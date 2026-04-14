'use client';
import React from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GuestGateProps {
  onClose: () => void;
  message?: string;
}

export default function GuestGate({ onClose, message = 'Join FANX to interact with this stream.' }: GuestGateProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-pane border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black italic mb-2">Members Only</h2>
        <p className="text-gray-400 text-sm mb-8">{message}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/signup')}
            className="w-full py-3 bg-fanx-primary text-white font-black rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <UserPlus size={18} /> Create Free Account
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-white/10 text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
          >
            <LogIn size={18} /> Log In
          </button>
        </div>

        <p className="text-gray-600 text-[10px] mt-6 uppercase font-bold tracking-widest">
          You can still watch without signing in
        </p>
      </div>
    </div>
  );
}
