'use client';
import React, { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`px-4 py-1.5 glass-pane text-[10px] font-bold transition-all ${
        copied ? 'bg-fanx-primary text-white' : 'hover:bg-white/10'
      }`}
    >
      {copied ? 'COPIED!' : 'SHARE'}
    </button>
  );
}
