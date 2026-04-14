'use client';
import React from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CollabModalProps {
  roomId: string;
  onClose: () => void;
}

export default function CollabModal({ roomId, onClose }: CollabModalProps) {
  const [cohostCopied, setCohostCopied] = useState(false);
  const [fanCopied, setFanCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const cohostLink = `${baseUrl}/live/${roomId}?role=cohost`;
  const fanLink = `${baseUrl}/live/${roomId}?role=fan`;

  const copy = async (text: string, which: 'cohost' | 'fan') => {
    await navigator.clipboard.writeText(text);
    if (which === 'cohost') {
      setCohostCopied(true);
      setTimeout(() => setCohostCopied(false), 2500);
    } else {
      setFanCopied(true);
      setTimeout(() => setFanCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-pane border border-white/10 rounded-3xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black italic tracking-tight mb-2">SHARE YOUR STREAM</h2>
        <p className="text-gray-400 text-sm mb-8">Choose who you are sharing with — Co-hosts stream with you, Fans just watch and interact.</p>

        {/* Co-host Link */}
        <div className="mb-6 p-5 rounded-2xl border border-fanx-primary/30 bg-fanx-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-fanx-primary flex items-center justify-center text-sm font-black">🎙️</div>
            <div>
              <p className="font-black text-sm text-white">CO-HOST INVITE</p>
              <p className="text-[10px] text-gray-400">Anyone with this link can stream alongside you</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 text-[10px] text-gray-300 bg-black/40 rounded-lg px-3 py-2 truncate font-mono">{cohostLink}</code>
            <button
              onClick={() => copy(cohostLink, 'cohost')}
              className={`px-4 py-2 rounded-lg font-black text-xs flex items-center gap-1 transition-all ${cohostCopied ? 'bg-green-500 text-white' : 'bg-fanx-primary text-white hover:scale-105'}`}
            >
              {cohostCopied ? <><Check size={14} /> COPIED!</> : <><Copy size={14} /> COPY</>}
            </button>
          </div>
        </div>

        {/* Fan / Spectator Link */}
        <div className="p-5 rounded-2xl border border-fanx-secondary/30 bg-fanx-secondary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-fanx-secondary flex items-center justify-center text-sm font-black">👥</div>
            <div>
              <p className="font-black text-sm text-white">FAN LINK</p>
              <p className="text-[10px] text-gray-400">Viewers can watch, send gifts & react — but not stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 text-[10px] text-gray-300 bg-black/40 rounded-lg px-3 py-2 truncate font-mono">{fanLink}</code>
            <button
              onClick={() => copy(fanLink, 'fan')}
              className={`px-4 py-2 rounded-lg font-black text-xs flex items-center gap-1 transition-all ${fanCopied ? 'bg-green-500 text-white' : 'bg-fanx-secondary text-black hover:scale-105'}`}
            >
              {fanCopied ? <><Check size={14} /> COPIED!</> : <><Copy size={14} /> COPY</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
