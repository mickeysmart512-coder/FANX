'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, Play, Radio } from 'lucide-react';

const CATEGORIES = ['ALL', 'MUSIC', 'COMEDY', 'FASHION', 'GAMING', 'LIFESTYLE'];

export default function ExplorePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchSessions = async () => {
    setLoading(true);
    let query = supabase
      .from('live_sessions')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (activeCategory !== 'ALL') {
      query = query.ilike('category', activeCategory);
    }

    const { data, error } = await query;
    if (!error) setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();

    // Real-time: sessions going live or ending update immediately
    const channel = supabase.channel('live_sessions_watch')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_sessions',
      }, () => {
        // Re-fetch on any change (new session, status update, viewer count)
        fetchSessions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filtered = sessions.filter(s =>
    search === '' ||
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.profiles?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const joinAsCoHost = async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    router.push(`/live/${sessionId}?role=cohost`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 z-10 relative">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter">EXPLORE SESSIONS</h1>
          <p className="text-gray-400 font-medium mt-1">
            {loading ? 'Finding live content...' : `${filtered.length} session${filtered.length !== 1 ? 's' : ''} live right now`}
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search streams or hosts..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-fanx-primary outline-none transition-all"
            />
          </div>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Filter size={24} />
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 z-10 relative no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full text-xs font-black tracking-widest whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-fanx-primary text-white shadow-lg shadow-fanx-primary/30'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stream Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Radio size={64} className="text-gray-700 mb-6" />
          <h2 className="text-2xl font-black text-gray-500 uppercase italic mb-2">No live sessions right now</h2>
          <p className="text-gray-600 mb-8">Be the first to start a collision on FANX!</p>
          <Link href="/host" className="px-8 py-4 bg-fanx-primary text-white font-black rounded-full hover:scale-105 transition-all">
            GO LIVE NOW
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 z-10 relative">
          {filtered.map((session) => (
            <div key={session.id} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative mb-4 border border-white/10 group-hover:border-fanx-primary/50 transition-all duration-300">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

                {/* Thumbnail */}
                <div className="w-full h-full bg-gradient-to-br from-fanx-primary/20 via-black to-fanx-secondary/20 flex items-center justify-center">
                  {session.profiles?.avatar_url ? (
                    <img
                      src={session.profiles.avatar_url}
                      alt={session.profiles?.display_name || 'Host'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    />
                  ) : (
                    <div className="text-6xl font-black text-white/20 italic">
                      {(session.profiles?.display_name || session.profiles?.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Live badge + viewer count */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                  </span>
                  {session.viewer_count > 0 && (
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black uppercase rounded-full">
                      {session.viewer_count?.toLocaleString()} 👁
                    </span>
                  )}
                </div>

                {/* Category badge */}
                {session.category && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase rounded-full text-gray-300">
                      {session.category}
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <Link
                    href={`/live/${session.id}?role=fan`}
                    className="px-6 py-3 bg-fanx-primary text-white font-black rounded-full flex items-center gap-2 hover:scale-105 transition-all glow-primary"
                  >
                    <Play size={16} fill="white" /> WATCH LIVE
                  </Link>
                  <button
                    onClick={() => joinAsCoHost(session.id)}
                    className="px-6 py-2 bg-fanx-secondary text-black font-black rounded-full text-xs flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    🎙️ REQUEST CO-HOST
                  </button>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-base font-black truncate">{session.title || 'Live Session'}</h3>
                  <p className="text-sm text-gray-400 font-medium">@{session.profiles?.username || 'unknown'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-20 text-center">
        <Link href="/" className="px-10 py-4 glass-pane text-xl font-black rounded-full hover:bg-white/10 transition-all inline-block">
          BACK TO HOME
        </Link>
      </footer>
    </main>
  );
}
