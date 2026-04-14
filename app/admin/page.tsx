'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Video,
  DollarSign
} from 'lucide-react';
import PayoutPanel from '@/components/admin/PayoutPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    stars: 0,
    liveSessions: 0,
    avgConcurrent: 0
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [hotSessions, setHotSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // 1. Fetch Stars
      const { count: starCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'star');

      // 2. Fetch Live Sessions
      const { data: activeSessions } = await supabase
        .from('live_sessions')
        .select('*, profiles(username)')
        .eq('status', 'live');
      
      const sessionCount = activeSessions?.length || 0;

      // 3. Mock Avg Concurrent for now until viewer_count columns are added
      const concurrent = sessionCount > 0 ? Math.floor(Math.random() * 5000) + 100 : 0;

      // 4. Fetch Revenue (sum of all gifts)
      // Note: A production app would do this via a PostgreSQL aggregation function
      const { data: giftsData } = await supabase.from('gifts').select('usd_value');
      const totalRev = giftsData?.reduce((acc, g) => acc + (g.usd_value || 0), 0) || 0;

      setStats({
        revenue: totalRev,
        stars: starCount || 0,
        liveSessions: sessionCount,
        avgConcurrent: concurrent
      });

      // 5. Fetch Logs
      const { data: sysLogs } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setLogs(sysLogs || []);

      // 6. Set Hot Sessions
      setHotSessions(activeSessions || []);
      setLoading(false);
    }

    loadDashboard();
    
    // Subscribe to changes in live sessions to adapt dashboard in real-time
    const sub = supabase.channel('admin_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => {
         loadDashboard();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">COMMAND CENTER</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Platform overview and real-time analytics.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="px-6 py-3 glass-pane border border-foreground/10 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest text-green-500">System Live</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.revenue, 'USD')} 
            change="+12.5%" 
            icon={<TrendingUp className="text-green-500" />} 
          />
          <StatCard 
            title="Active Stars" 
            value={stats.stars.toString()} 
            change="+3" 
            icon={<Users className="text-fanx-secondary" />} 
          />
          <StatCard 
            title="Live Sessions" 
            value={stats.liveSessions.toString()} 
            change="+5" 
            icon={<Video className="text-fanx-primary" />} 
          />
          <StatCard 
            title="Avg. Concurrent" 
            value={stats.avgConcurrent.toString()} 
            change="+8.2%" 
            icon={<Activity className="text-white" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Payouts Section */}
            <PayoutPanel />
            
            {/* Recent Activity Mockup */}
            <div className="p-6 glass-pane border border-foreground/10 rounded-2xl">
              <h3 className="text-xl font-black mb-6 uppercase italic">Critical System Logs</h3>
              <div className="space-y-4 font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-gray-500 italic">No critical errors reported in the last 24h.</p>
                ) : logs.map(log => (
                  <div key={log.id} className={`flex gap-4 pl-4 border-l-2 ${
                    log.severity === 'HIGH' ? 'border-red-500 text-red-500' :
                    log.severity === 'WARNING' ? 'border-fanx-secondary text-fanx-secondary' :
                    'border-fanx-primary text-gray-500'
                  }`}>
                    <span className="font-bold">[{log.severity}] {log.event_type}</span>
                    <span>{log.description}</span>
                    <span className="ml-auto opacity-50">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Real-time Tipping Chart Mockup */}
            <div className="p-6 glass-pane border border-foreground/10 rounded-2xl h-[400px] flex flex-col">
              <h3 className="text-xl font-black mb-6 uppercase italic flex items-center justify-between">
                Hot Sessions
                {loading && <div className="w-3 h-3 bg-fanx-primary rounded-full animate-ping" />}
              </h3>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                {hotSessions.length === 0 && !loading && (
                  <p className="text-gray-500 text-sm font-bold mt-4">No active broadcasts happening right now.</p>
                )}
                {hotSessions.map((hs, i) => (
                  <SessionRank 
                    key={hs.id} 
                    name={`${hs.profiles?.username || 'Unknown'} - ${hs.title}`} 
                    fans="Live" 
                    color={i === 0 ? "bg-fanx-primary" : i === 1 ? "bg-fanx-secondary" : "bg-white"} 
                    width={`${Math.max(10, 100 - (i * 20))}%`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 glass-pane border border-foreground/10 rounded-2xl space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-foreground/5 rounded-lg border border-foreground/10">{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-xs font-bold text-green-500 mt-1">{change} <span className="text-gray-500 dark:text-gray-400 ml-1">vs last 24h</span></div>
      </div>
    </div>
  );
}

function SessionRank({ name, fans, color, width }: { name: string, fans: string, color: string, width: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span>{name}</span>
        <span className="text-gray-500 dark:text-gray-400">{fans} fans</span>
      </div>
      <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width }} />
      </div>
    </div>
  );
}
