'use client';
import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useLocalParticipant } from '@livekit/components-react';

// Co-hosts get mic/camera but NOT end stream
export default function CoHostControlBar() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(() => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  return (
    <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-5 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-6">
        <span className="px-3 py-1 bg-fanx-secondary/20 border border-fanx-secondary/40 text-fanx-secondary text-[9px] font-black rounded-full tracking-widest mr-4">
          CO-HOSTING
        </span>

        <button
          onClick={toggleMic}
          title={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMicrophoneEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}
        >
          {isMicrophoneEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleCamera}
          title={isCameraEnabled ? 'Hide camera' : 'Show camera'}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isCameraEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}
        >
          {isCameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
      </div>
    </div>
  );
}
