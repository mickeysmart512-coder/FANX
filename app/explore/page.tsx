'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Play } from 'lucide-react';

export default function ExplorePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, profiles(username, display_name, avatar_url, role)')
        .eq('status', 'live');
      
      if (error) {
        console.error('Error fetching sessions:', error);
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-secondary/10 blur-[120px] rounded-full" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 z-10 relative">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter">EXPLORE SESSIONS</h1>
          <p className="text-gray-400 font-medium">Find your favorite stars and join the collision.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Search stars or sessions..." 
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-fanx-primary outline-none transition-all"
            />
          </div>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Filter size={24} />
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 z-10 relative no-scrollbar">
        {['ALL SESSIONS', 'MUSIC', 'COMEDY', 'FASHION', 'GAMING', 'LIFESTYLE'].map((cat, i) => (
          <button 
            key={cat} 
            className={`px-8 py-3 rounded-full text-xs font-black tracking-widest whitespace-nowrap transition-all ${
              i === 0 ? 'bg-fanx-primary text-white glow-primary' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 z-10 relative">
          {sessions.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <h2 className="text-2xl font-black text-gray-500 uppercase italic">No live sessions at the moment</h2>
              <p className="text-gray-600">Be the first to start a collision!</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden relative mb-4 border border-white/10 group-hover:border-fanx-primary/50 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                  <img 
                    src={session.profiles?.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=400`} 
                    alt="Star" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase rounded-full">
                      {session.viewer_count?.toLocaleString()} Watching
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                    <div className="w-16 h-16 bg-fanx-primary rounded-full flex items-center justify-center text-white glow-primary">
                      <Play size={24} fill="white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{session.title}</h3>
                  <p className="text-sm font-medium text-gray-400">@{session.profiles?.username || 'unknown'}</p>
                </div>
              </div>
            ))
          )}
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
