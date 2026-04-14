'use client';

import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2, AlertCircle } from 'lucide-react';

interface LiveRoomContainerProps {
  roomId: string;
  identity: string;
}

export default function LiveRoomContainer({ roomId, identity }: LiveRoomContainerProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/live/token?roomId=${roomId}&identity=${identity}`);
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
  }, [roomId, identity]);

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
        <Loader2 className="animate-spin" size={48} />
        <p className="text-xl font-black italic tracking-tighter uppercase">Initializing Collision Room...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://fanx-8ah57jg5.livekit.cloud'}
      data-lk-theme="default"
      className="h-full"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
