import React from 'react';
import VideoGrid from '@/components/video/VideoGrid';
import GiftBar from '@/components/gifts/GiftBar';
import GiftAnimationLayer from '@/components/gifts/GiftAnimationLayer';

export default async function LiveRoom({ 
  params 
}: { 
  params: Promise<{ roomId: string }> 
}) {
  const { roomId } = await params;

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full p-4 flex justify-between items-center z-40 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black italic">FAN<span className="text-fanx-primary">X</span></div>
          <div className="h-6 w-[1px] bg-white/20" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider">Session: {roomId}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400">4,250 VIEWERS</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-1.5 glass-pane text-[10px] font-bold">SHARE</button>
          <button className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full">EXIT</button>
        </div>
      </header>

      {/* Main Video View */}
      <main className="flex-1 pt-20 pb-28">
        <VideoGrid />
      </main>

      {/* Global Real-time Layers */}
      <GiftAnimationLayer />
      
      {/* Interaction Bar */}
      <GiftBar />

      {/* Side Chat (Floating) */}
      <div className="absolute bottom-32 left-6 w-72 h-48 pointer-events-none overflow-hidden flex flex-col justify-end gap-2">
        <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg text-xs border border-white/5">
          <span className="text-fanx-secondary font-bold">WizkidFan:</span> This is legendary! 🔥
        </div>
        <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg text-xs border border-white/5">
          <span className="text-fanx-primary font-bold">BurnaBoy:</span> Shoutout to the fans! 🦍
        </div>
      </div>
    </div>
  );
}
