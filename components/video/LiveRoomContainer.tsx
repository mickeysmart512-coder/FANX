'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  ParticipantTile,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Loader2, AlertCircle, LayoutGrid, Maximize2 } from 'lucide-react';
import HostControlBar from './HostControlBar';
import CoHostControlBar from './CoHostControlBar';

interface LiveRoomContainerProps {
  roomId: string;
  identity: string;
  canPublish?: boolean;
  isHost?: boolean;
  isCohost?: boolean;
  hostUserId?: string;
  cohostUserIds?: string[];
}

// ---- Inner: Grid + Focus Layout ----
function StreamGrid({ hostUserId, cohostUserIds }: { hostUserId?: string; cohostUserIds?: string[] }) {
  const participants = useParticipants();
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const [focusedIdentity, setFocusedIdentity] = useState<string | null>(null);

  const getRoleBadge = (identity: string) => {
    if (identity === hostUserId) return { label: 'HOST', color: 'bg-fanx-primary' };
    if (cohostUserIds?.includes(identity)) return { label: 'CO-HOST', color: 'bg-fanx-secondary text-black' };
    return null;
  };

  const focusedTrack = focusedIdentity
    ? tracks.find(t => t.participant.identity === focusedIdentity)
    : null;

  if (focusedTrack) {
    const badge = getRoleBadge(focusedTrack.participant.identity);
    return (
      <div className="h-full relative">
        <ParticipantTile trackRef={focusedTrack} className="h-full w-full" />
        {badge && (
          <div className={`absolute top-4 left-4 z-30 px-3 py-1 ${badge.color} text-[10px] font-black rounded-full tracking-widest`}>
            {badge.label}
          </div>
        )}
        <button
          onClick={() => setFocusedIdentity(null)}
          className="absolute top-4 right-4 z-30 px-4 py-2 glass-pane text-[10px] font-black rounded-full flex items-center gap-2 hover:bg-white/20"
        >
          <LayoutGrid size={14} /> GRID VIEW
        </button>
      </div>
    );
  }

  // Grid view
  const cols = tracks.length === 1 ? 'grid-cols-1' :
               tracks.length === 2 ? 'grid-cols-2' :
               tracks.length <= 4 ? 'grid-cols-2' :
               tracks.length <= 9 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className={`h-full grid ${cols} gap-1 p-1`}>
      {tracks.map((track) => {
        const badge = getRoleBadge(track.participant.identity);
        return (
          <div
            key={track.participant.identity}
            className="relative group cursor-pointer"
            onClick={() => setFocusedIdentity(track.participant.identity)}
          >
            <ParticipantTile trackRef={track} className="h-full w-full rounded-lg overflow-hidden" />
            {badge && (
              <div className={`absolute top-2 left-2 z-30 px-2 py-0.5 ${badge.color} text-[9px] font-black rounded-full tracking-widest`}>
                {badge.label}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20 rounded-lg z-20">
              <div className="p-2 bg-black/60 rounded-full">
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
      {tracks.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500 col-span-full">
          <div className="text-center">
            <div className="text-5xl mb-4">📡</div>
            <p className="font-black italic uppercase tracking-widest">Connecting to stream...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveRoomContainer({
  roomId,
  identity,
  canPublish = true,
  isHost = false,
  isCohost = false,
  hostUserId,
  cohostUserIds = [],
}: LiveRoomContainerProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/live/token?roomId=${roomId}&identity=${encodeURIComponent(identity)}&canPublish=${canPublish}`
        );
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          setError(data.error || 'Failed to get token');
        }
      } catch (e) {
        console.error(e);
        setError('Connection error');
      }
    })();
  }, [roomId, identity, canPublish]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-4">
        <AlertCircle size={48} />
        <p className="text-xl font-bold uppercase tracking-widest">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-black text-xs uppercase">
          RETRY
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <Loader2 size={48} />
        <p className="text-xl font-black italic tracking-tighter uppercase">Connecting to Collision Room...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={canPublish}
      audio={canPublish}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://fanx-8ah57jg5.livekit.cloud'}
      data-lk-theme="default"
      className="h-full"
    >
      {/* Custom grid/focus layout with role badges */}
      <StreamGrid hostUserId={hostUserId} cohostUserIds={cohostUserIds} />

      {/* Controls inside room context for access to useLocalParticipant */}
      {isHost && <HostControlBar roomId={roomId} />}
      {isCohost && <CoHostControlBar />}
    </LiveKitRoom>
  );
}
