import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LiveRoomContainer from '@/components/video/LiveRoomContainer';
import GiftBar from '@/components/gifts/GiftBar';
import GiftAnimationLayer from '@/components/gifts/GiftAnimationLayer';

/**
 * Role Matrix:
 *  host    → creator of the session. HostControlBar + INVITE button.
 *  cohost  → has ?role=cohost link (host gave it to them) OR got approved from request.
 *            Gets mic/cam + CoHostControlBar. The invite link IS the authorization — no extra request.
 *  fan     → logged in fan. GiftBar + can spontaneously REQUEST co-host from inside room.
 *  guest   → not logged in. GiftBar locked (GuestGate on interaction).
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
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch live session to get host_id
  const { data: session } = await supabase
    .from('live_sessions')
    .select('host_id, title')
    .eq('id', roomId)
    .single();

  // Fetch accepted co-host IDs for this session
  const { data: cohostData } = await supabase
    .from('cohost_requests')
    .select('requester_id')
    .eq('session_id', roomId)
    .eq('status', 'accepted');

  const cohostUserIds = cohostData?.map(r => r.requester_id) || [];
  const hostUserId = session?.host_id || '';

  // Determine role
  let role: RoomRole = 'guest';
  if (user && session && user.id === session.host_id) {
    // They own this session → host
    role = 'host';
  } else if (roleParam === 'cohost' && user) {
    // They have the co-host invite link from the host → immediately co-host.
    // The invite link IS the authorization — no additional request/approval needed.
    // (Request flow is only for fans who spontaneously ask from inside the room.)
    role = 'cohost';
  } else if (user) {
    role = 'fan';
  } else {
    role = 'guest';
  }

  const identity = user?.user_metadata?.username || user?.email || 'guest-' + Math.floor(Math.random() * 9999);
  const canPublish = role === 'host' || role === 'cohost';
  const isGuest = role === 'guest';
  const isHost = role === 'host';
  const isCohost = role === 'cohost';

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full p-4 flex justify-between items-center z-40 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black italic">FAN<span className="text-fanx-primary">X</span></div>
          <div className="h-6 w-[1px] bg-white/20" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider">
              {session?.title || `COLLISION: ${roomId.substring(0, 8)}...`}
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold">LIVE ON FANX</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {isCohost && (
            <span className="px-3 py-1 bg-fanx-secondary/20 border border-fanx-secondary/50 text-fanx-secondary text-[9px] font-black rounded-full tracking-widest">CO-HOST</span>
          )}
          {isGuest && (
            <span className="px-3 py-1 bg-white/10 text-gray-400 text-[9px] font-black rounded-full tracking-widest">GUEST VIEW</span>
          )}
          <a
            href={isHost || isCohost ? '/host' : '/explore'}
            className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full hover:scale-105 transition-all"
          >
            {isHost ? 'EXIT STUDIO' : isCohost ? 'LEAVE COLLAB' : 'LEAVE ROOM'}
          </a>
        </div>
      </header>

      {/* Main Video — grid layout with role badges */}
      <main className="flex-1 pt-14">
        <LiveRoomContainer
          roomId={roomId}
          identity={identity}
          canPublish={canPublish}
          isHost={isHost}
          isCohost={isCohost}
          hostUserId={hostUserId}
          cohostUserIds={cohostUserIds}
        />
      </main>

      {/* Gift animations — visible to everyone */}
      <GiftAnimationLayer roomId={roomId} />

      {/* Fan/Guest bottom bar — host and cohost bars are inside LiveRoomContainer */}
      {!isHost && !isCohost && (
        <GiftBar roomId={roomId} isGuest={isGuest} />
      )}
    </div>
  );
}
