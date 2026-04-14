'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';

export default function AdminRevenuePage() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_volume: 0, highest_gift: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      const { data } = await supabase
        .from('gifts')
        .select('*, sender:sender_id(username), receiver:receiver_id(username)')
        .order('created_at', { ascending: false });
      
      if (data) {
        setGifts(data);
        const total = data.reduce((acc, g) => acc + (g.usd_value || 0), 0);
        const max = data.reduce((acc, g) => Math.max(acc, g.usd_value || 0), 0);
        setStats({ total_volume: total, highest_gift: max });
      }
      setLoading(false);
    }
    fetchRevenue();

    const sub = supabase.channel('admin_revenue_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => {
         fetchRevenue();
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">REVENUE TRACKING</h1>
        <p className="text-gray-500 font-medium">Global platform earnings and micro-transaction logs.</p>
      </header>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 glass-pane border border-foreground/10 rounded-3xl relative overflow-hidden group">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Platform Transacted Volume</div>
          <div className="text-4xl font-black text-green-500">{formatCurrency(stats.total_volume, 'USD')}</div>
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-foreground/5 group-hover:scale-110 transition-all" />
        </div>
        <div className="p-6 glass-pane border border-foreground/10 rounded-3xl relative overflow-hidden group">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Highest Recorded Gift</div>
          <div className="text-4xl font-black text-fanx-primary">{formatCurrency(stats.highest_gift, 'USD')}</div>
          <ArrowUpRight className="absolute -right-4 -bottom-4 w-32 h-32 text-foreground/5 group-hover:scale-110 transition-all" />
        </div>
      </div>

      <div className="glass-pane border border-foreground/10 rounded-3xl overflow-hidden p-6">
        <h3 className="text-xl font-black mb-6 uppercase italic">Transaction Ledger</h3>
        <table className="w-full text-left">
          <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-foreground/10">
            <tr>
              <th className="pb-4">Timestamp</th>
              <th className="pb-4">Sender</th>
              <th className="pb-4">Recipient (Star)</th>
              <th className="pb-4">Gift Type</th>
              <th className="pb-4 text-right">Value (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5 font-mono text-sm">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-500 animate-pulse">Running calculations...</td></tr>
            ) : gifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="text-gray-500 italic">No revenue objects processed yet.</div>
                </td>
              </tr>
            ) : gifts.map(g => (
              <tr key={g.id} className="group hover:bg-foreground/5 transition-all">
                <td className="py-4 text-gray-500 text-xs">{new Date(g.created_at).toLocaleString()}</td>
                <td className="py-4 font-bold">@{g.sender?.username || 'Unknown'}</td>
                <td className="py-4 font-bold text-fanx-secondary">@{g.receiver?.username || 'Unknown'}</td>
                <td className="py-4">
                  <span className="bg-foreground/10 px-2 py-1 rounded text-xs">
                     {g.gift_name} ({g.coin_cost} 🪙)
                  </span>
                </td>
                <td className="py-4 text-right font-black text-green-500">{formatCurrency(g.usd_value || 0, 'USD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
