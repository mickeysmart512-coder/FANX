'use client';
import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HostControlBar({ roomId }: { roomId: string }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const router = useRouter();

  const handleEndStream = async () => {
    if (!confirm('Are you sure you want to end your broadcast?')) return;
    
    await supabase.from('live_sessions').update({ status: 'ended' }).eq('id', roomId);
    router.push('/host');
  };

  return (
    <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-6 z-50 flex justify-center">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setMicEnabled(!micEnabled)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            micEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 border border-red-500/50'
          }`}
        >
          {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button 
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            videoEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 border border-red-500/50'
          }`}
        >
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button 
          onClick={handleEndStream}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-full shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2 tracking-widest text-sm ml-4"
        >
          <PhoneOff size={20} /> END STREAM
        </button>
      </div>
    </div>
  );
}
