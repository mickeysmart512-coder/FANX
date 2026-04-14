'use client';
import React, { useState, useEffect } from 'react';
import { Video, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from('live_sessions')
        .select('*, profiles(username)')
        .eq('status', 'live')
        .order('created_at', { ascending: false });
      
      setSessions(data || []);
      setLoading(false);
    }
    fetchSessions();

    const sub = supabase.channel('admin_sessions_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => {
         fetchSessions();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const terminateSession = async (id: string, hostName: string) => {
    if(!confirm(`Are you sure you want to forcibly terminate ${hostName}'s session?`)) return;

    await supabase.from('live_sessions').update({ status: 'terminated' }).eq('id', id);
    
    // Log the termination action
    await supabase.from('system_logs').insert({
      event_type: 'SESSION_TERMINATED',
      description: `Admin forcibly terminated live session: ${id}`,
      severity: 'WARNING'
    });
  };

  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">LIVE SESSIONS</h1>
        <p className="text-gray-500 font-medium">Monitor and manage active collision streams.</p>
      </header>
      
      <div className="glass-pane border border-foreground/10 rounded-3xl overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-foreground/10">
              <tr>
                <th className="pb-4">Host</th>
                <th className="pb-4">Title & Category</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Uptime</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500 animate-pulse">Scanning network...</td></tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center p-20 opacity-50">
                      <Video size={48} className="text-gray-500 mb-4" />
                      <h2 className="text-xl font-bold">No Active Sessions</h2>
                      <p className="text-gray-500 mt-2">No stars are currently broadcasting.</p>
                    </div>
                  </td>
                </tr>
              ) : sessions.map(s => {
                const uptime = Math.floor((new Date().getTime() - new Date(s.created_at).getTime()) / 60000);
                return (
                  <tr key={s.id} className="group hover:bg-foreground/5 transition-all">
                    <td className="py-4 font-bold">@{s.profiles?.username || 'Unknown'}</td>
                    <td className="py-4">
                      <div className="font-bold">{s.title}</div>
                      <div className="text-xs text-fanx-secondary font-black uppercase mt-1">{s.category}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-red-500">LIVE</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-sm">{uptime} mins</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => terminateSession(s.id, s.profiles?.username)}
                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ml-auto"
                      >
                        <ShieldAlert size={14} /> TERMINATE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
