'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      setLogs(data || []);
      setLoading(false);
    }
    fetchLogs();

    const sub = supabase.channel('admin_security_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_logs' }, () => {
         fetchLogs();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">SECURITY LOGS</h1>
        <p className="text-gray-500 font-medium">Platform events, moderation reports, and flag histories.</p>
      </header>
      
      <div className="glass-pane border border-foreground/10 rounded-3xl overflow-hidden p-6">
        <table className="w-full text-left">
          <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-foreground/10">
            <tr>
              <th className="pb-4">Timestamp</th>
              <th className="pb-4">Severity</th>
              <th className="pb-4">Event Type</th>
              <th className="pb-4 w-[50%]">Contextual Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5 font-mono text-sm">
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500 animate-pulse">Parsing logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center justify-center p-20 opacity-50">
                    <ShieldAlert size={48} className="text-green-500 mb-4" />
                    <h2 className="text-xl font-bold">Systems Secure</h2>
                    <p className="text-gray-500 mt-2 text-center">No critical system events logged yet.<br/>The platform is fully stable.</p>
                  </div>
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} className="group hover:bg-foreground/5 transition-all">
                <td className="py-4 text-gray-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    log.severity === 'HIGH' ? 'bg-red-500 text-white' :
                    log.severity === 'WARNING' ? 'bg-fanx-secondary/20 text-fanx-secondary' :
                    'bg-foreground/10'
                  }`}>
                    {log.severity}
                  </span>
                </td>
                <td className="py-4 font-bold">{log.event_type}</td>
                <td className="py-4 text-xs">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
