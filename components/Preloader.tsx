'use client';

import React, { useEffect, useState } from 'react';

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide preloader after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      // Remove from layout after transition
      setTimeout(() => setShow(false), 1000);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-[-40px] border-2 border-fanx-primary/30 rounded-full animate-ping" />
        <div className="absolute inset-[-20px] border border-fanx-secondary/20 rounded-full animate-pulse" />
        
        <h1 className="text-7xl font-black tracking-tighter italic z-10 relative">
          FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
        </h1>
        
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-fanx-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-fanx-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
