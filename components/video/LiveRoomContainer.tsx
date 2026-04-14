'use client';
import React, { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2, AlertCircle } from 'lucide-react';
import HostControlBar from './HostControlBar';

interface LiveRoomContainerProps {
  roomId: string;
  identity: string;
  canPublish?: boolean;
  isHost?: boolean;
}

export default function LiveRoomContainer({
  roomId,
  identity,
  canPublish = true,
  isHost = false,
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
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black rounded-full font-black text-xs uppercase"
        >
          RETRY
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <Loader2 size={48} />
        <p className="text-xl font-black italic tracking-tighter uppercase">Initializing Collision Room...</p>
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
      {/* Video tiles for all participants */}
      <VideoConference />

      {/*
       * HostControlBar MUST render inside LiveKitRoom so that
       * useLocalParticipant() has access to the room context.
       * Only shown when isHost=true.
       */}
      {isHost && <HostControlBar roomId={roomId} />}
    </LiveKitRoom>
  );
}
