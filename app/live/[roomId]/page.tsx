import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LiveRoomContainer from '@/components/video/LiveRoomContainer';
import GiftBar from '@/components/gifts/GiftBar';
import GiftAnimationLayer from '@/components/gifts/GiftAnimationLayer';

export default async function LiveRoom({ 
  params 
}: { 
  params: Promise<{ roomId: string }> 
}) {
  const { roomId } = await params;
  
  // Get user for identity
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const identity = user?.user_metadata?.username || user?.email || 'guest-' + Math.floor(Math.random() * 100);

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full p-4 flex justify-between items-center z-40 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black italic">FAN<span className="text-fanx-primary">X</span></div>
          <div className="h-6 w-[1px] bg-white/20" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider">COLLISION: {roomId.substring(0, 8)}...</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold">LIVE ON FANX</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-1.5 glass-pane text-[10px] font-bold">SHARE</button>
          <a href="/host" className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full">EXIT ROOM</a>
        </div>
      </header>

      {/* Main Video View */}
      <main className="flex-1">
        <LiveRoomContainer roomId={roomId} identity={identity} />
      </main>

      {/* Global Real-time Layers */}
      <GiftAnimationLayer />
      
      {/* Interaction Bar */}
      <GiftBar />
    </div>
  );
}
