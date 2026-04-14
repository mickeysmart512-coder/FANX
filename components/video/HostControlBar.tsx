'use client';
import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useLocalParticipant } from '@livekit/components-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CollabModal from './CollabModal';

export default function HostControlBar({ roomId }: { roomId: string }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const [showCollab, setShowCollab] = useState(false);
  const router = useRouter();

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(() => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const handleEndStream = async () => {
    if (!confirm('Are you sure you want to end your broadcast?')) return;
    await supabase.from('live_sessions').update({ status: 'ended' }).eq('id', roomId);
    router.push('/host');
  };

  return (
    <>
      {showCollab && (
        <CollabModal roomId={roomId} onClose={() => setShowCollab(false)} />
      )}

      <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-5 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Left — stream info */}
          <div className="text-xs text-gray-500 font-mono hidden sm:block">
            <span className="text-green-400 font-black">● LIVE</span>
            <span className="ml-2">ROOM {roomId.substring(0, 8).toUpperCase()}</span>
          </div>

          {/* Center — main controls */}
          <div className="flex items-center gap-4 mx-auto">
            <button
              onClick={toggleMic}
              title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMicrophoneEnabled
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}
            >
              {isMicrophoneEnabled ? <Mic size={22} /> : <MicOff size={22} />}
            </button>

            <button
              onClick={handleEndStream}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-full shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2 tracking-widest text-xs"
            >
              <PhoneOff size={18} /> END STREAM
            </button>

            <button
              onClick={toggleCamera}
              title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isCameraEnabled
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}
            >
              {isCameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
          </div>

          {/* Right — share */}
          <button
            onClick={() => setShowCollab(true)}
            className="px-5 py-2.5 bg-fanx-primary text-white font-black text-[10px] rounded-full tracking-widest hover:scale-105 transition-all hidden sm:flex items-center gap-2"
          >
            🔗 INVITE
          </button>
        </div>
      </div>
    </>
  );
}
