'use client';

import React, { useState } from 'react';
import { formatCurrency, coinsToUsd, usdToNgn } from '@/lib/currency';

const GIFTS = [
  { id: 'rose', name: 'Rose', price: 1, icon: '🌹', color: '#FF0050' },
  { id: 'fire', name: 'Fire', price: 5, icon: '🔥', color: '#FFA500' },
  { id: 'car', name: 'Supercar', price: 50, icon: '🏎️', color: '#00F2EA' },
  { id: 'rocket', name: 'Rocket', price: 100, icon: '🚀', color: '#FFFFFF' },
  { id: 'rain', name: 'Money Rain', price: 500, icon: '💸', color: '#00FF00' },
];

export default function GiftBar() {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  
  const sendGift = (giftId: string) => {
    console.log(`Sending gift: ${giftId}`);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-4 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center gap-6">
        {/* Wallet & Currency Toggle */}
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase font-black">Wallet</span>
            <button 
              onClick={() => setCurrency(c => c === 'USD' ? 'NGN' : 'USD')}
              className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold hover:bg-white/20"
            >
              {currency} ⇄
            </button>
          </div>
          <span className="text-fanx-secondary font-black text-xl leading-none">1,250 🪙</span>
          <span className="text-[10px] text-gray-500">
            ≈ {formatCurrency(currency === 'USD' ? coinsToUsd(1250) : usdToNgn(coinsToUsd(1250)), currency)}
          </span>
        </div>

        {/* Gift List */}
        <div className="flex-1 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {GIFTS.map((gift) => (
            <button
              key={gift.id}
              onClick={() => sendGift(gift.id)}
              className="flex flex-col items-center gap-1 min-w-[64px] group"
            >
              <div className="w-12 h-12 rounded-xl glass-pane flex items-center justify-center text-2xl group-hover:scale-110 group-hover:glow-secondary transition-all">
                {gift.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-300">
                {gift.price}
              </span>
            </button>
          ))}
        </div>

        {/* Global Action */}
        <button className="px-6 py-3 bg-fanx-primary text-white font-black rounded-full shadow-lg shadow-fanx-primary/20 hover:scale-105 transition-all">
          ADD {currency === 'USD' ? 'USD' : 'NGN'}
        </button>
      </div>
    </div>
  );
}
