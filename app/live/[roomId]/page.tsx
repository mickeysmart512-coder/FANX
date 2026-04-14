import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LiveRoomContainer from '@/components/video/LiveRoomContainer';
import GiftBar from '@/components/gifts/GiftBar';
import GiftAnimationLayer from '@/components/gifts/GiftAnimationLayer';
// HostControlBar is rendered inside LiveRoomContainer (needs LiveKit context)
// CollabModal is opened from within HostControlBar

/**
 * Role logic:
 *  - host     → the owner of this room. Gets HostControlBar (mic/cam controls, invite, end stream).
 *  - cohost   → joined via co-host invite link. Gets mic+cam, but no end-stream button.
 *  - fan      → joined via fan link (logged in). Gets GiftBar, no mic/cam.
 *  - guest    → not logged in, or no role param. Sees stream + locked GiftBar (gate on interaction).
 */

type RoomRole = 'host' | 'cohost' | 'fan' | 'guest';

export default async function LiveRoom({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { roomId } = await params;
  const { role: roleParam } = await searchParams;

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

  // Fetch session ownership
  const { data: session } = await supabase
    .from('live_sessions')
    .select('host_id')
    .eq('id', roomId)
    .single();

  // Determine role
  let role: RoomRole = 'guest';
  if (user && session && user.id === session.host_id) {
    role = 'host';
  } else if (roleParam === 'cohost' && user) {
    role = 'cohost';
  } else if (roleParam === 'fan' && user) {
    role = 'fan';
  } else if (!user || roleParam === 'fan') {
    role = 'guest'; // not logged in → guest (can watch, can't interact)
  }

  const identity = user?.user_metadata?.username || user?.email || 'guest-' + Math.floor(Math.random() * 9999);
  const canPublish = role === 'host' || role === 'cohost';
  const isGuest = role === 'guest';
  const isHost = role === 'host';

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

        <div className="flex gap-2 items-center">
          {/* Role badges */}
          {role === 'cohost' && (
            <span className="px-3 py-1 bg-fanx-primary/20 border border-fanx-primary/50 text-fanx-primary text-[9px] font-black rounded-full tracking-widest">CO-HOST</span>
          )}
          {isGuest && (
            <span className="px-3 py-1 bg-white/10 text-gray-400 text-[9px] font-black rounded-full tracking-widest">GUEST VIEW</span>
          )}

          {/* Exit button */}
          <a
            href={isHost ? '/host' : '/explore'}
            className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full hover:scale-105 transition-all"
          >
            {isHost ? 'EXIT STUDIO' : 'LEAVE ROOM'}
          </a>
        </div>
      </header>

      {/* Main Video — everyone joins the room, publish rights differ */}
      <main className="flex-1 pt-14">
        <LiveRoomContainer
          roomId={roomId}
          identity={identity}
          canPublish={canPublish}
          isHost={isHost}
        />
      </main>

      {/* Gift animations visible to everyone */}
      <GiftAnimationLayer roomId={roomId} />

      {/* Bottom Bar — fans and guests get GiftBar; host controls are inside LiveRoomContainer */}
      {!isHost && (
        <GiftBar roomId={roomId} isGuest={isGuest} />
      )}
    </div>
  );
}
