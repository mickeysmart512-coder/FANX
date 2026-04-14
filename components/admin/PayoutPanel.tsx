'use client';

import React, { useState } from 'react';
import { formatCurrency, coinsToUsd, coinsToNgn } from '@/lib/currency';

interface PayoutRequest {
  id: string;
  celeb: string;
  coins: number;
  status: 'Pending' | 'Flagged' | 'Processing' | 'Completed';
  risk: 'High' | 'Low';
  reason: string;
}

const PENDING_PAYOUTS: PayoutRequest[] = [
  { id: 'p1', celeb: 'StarBoy_419', coins: 30000, status: 'Flagged', risk: 'High', reason: 'Rapid gifting from single IP' },
  { id: 'p2', celeb: 'Comedian_X', coins: 80000, status: 'Pending', risk: 'Low', reason: 'None' },
  { id: 'p3', celeb: 'MamaNigeria', coins: 5000, status: 'Pending', risk: 'Low', reason: 'None' },
];

export default function PayoutPanel() {
  const [payouts, setPayouts] = useState(PENDING_PAYOUTS);

  const lockPayout = (id: string) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'Processing' } : p));
    console.log(`Locking payout ${id} to prevent double-dipping.`);
  };

  return (
    <div className="p-6 glass-pane border border-foreground/10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic">GLOBAL PAYOUTS</h2>
        <div className="flex gap-2 text-[10px] font-bold">
          <span className="px-3 py-1 bg-foreground/5 dark:bg-white/10 rounded-full border border-foreground/10 dark:border-white/20 text-gray-500 dark:text-gray-300">
            AUTO-CONVERSION: 1,550 NGN/USD
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-foreground/10">
            <tr>
              <th className="pb-4">Celebrity</th>
              <th className="pb-4">Coins Balance</th>
              <th className="pb-4">Est. USD</th>
              <th className="pb-4">Est. NGN</th>
              <th className="pb-4">Status & Risk</th>
              <th className="pb-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {payouts.map((payout) => (
              <tr key={payout.id} className="group hover:bg-foreground/5 transition-all">
                <td className="py-4 font-bold">{payout.celeb}</td>
                <td className="py-4 font-mono text-fanx-secondary">{payout.coins.toLocaleString()} 🪙</td>
                <td className="py-4 text-xs">{formatCurrency(coinsToUsd(payout.coins), 'USD')}</td>
                <td className="py-4 text-xs font-bold text-fanx-primary">
                  {formatCurrency(coinsToNgn(payout.coins), 'NGN')}
                </td>
                <td className="py-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      payout.status === 'Flagged' ? 'bg-red-600' : 'bg-fanx-secondary text-black'
                    }`}>
                      {payout.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-foreground/10 ${
                      payout.risk === 'High' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {payout.risk} Risk
                    </span>
                  </div>
                  {payout.reason !== 'None' && <span className="text-[8px] text-gray-500 italic">{payout.reason}</span>}
                </td>
                <td className="py-4 text-right space-x-2">
                  <button 
                    disabled={payout.status === 'Processing'}
                    onClick={() => lockPayout(payout.id)}
                    className="px-4 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-full disabled:opacity-50"
                  >
                    {payout.status === 'Processing' ? 'LOCKED' : 'APPROVE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
