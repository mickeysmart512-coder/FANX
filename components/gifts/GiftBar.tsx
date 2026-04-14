'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency, coinsToUsd, usdToNgn } from '@/lib/currency';
import { supabase } from '@/lib/supabase';

interface GiftBarProps {
  roomId?: string;
}

export default function GiftBar({ roomId }: GiftBarProps) {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [wallet, setWallet] = useState<number>(0);
  const [gifts, setGifts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Get identity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // 2. Fetch Wallet Balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins_balance')
          .eq('id', user.id)
          .single();
        
        setWallet(profile?.coins_balance || 0);
      }

      // 3. Fetch current catalog
      const { data: catalog } = await supabase
        .from('catalog_items')
        .select('*')
        .order('price', { ascending: true });
      
      if (catalog && catalog.length > 0) {
        setGifts(catalog);
      } else {
        // Fallback mocked items if admin hasn't created any!
        setGifts([
          { id: 'mock1', name: 'Rose', price: 1, icon: '🌹', color: '#FF0050' },
          { id: 'mock2', name: 'Rocket', price: 100, icon: '🚀', color: '#FFFFFF' }
        ]);
      }
    }
    loadData();

    if (!userId) return;

    // Real-time wallet sync 
    const sub = supabase.channel('wallet_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
        setWallet(payload.new.coins_balance || 0);
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [userId]);

  const addMockCoins = async () => {
    if (!userId) return alert('You must be logged in to add coins!');
    
    // Give 1000 coins instantly
    const newBalance = wallet + 1000;
    setWallet(newBalance); // optimistic
    
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);
  };

  const sendGift = async (gift: any) => {
    if (!roomId) return alert("You are not connected to an active room.");
    if (!userId) return alert("You must be logged in to send gifts.");
    
    if (wallet < gift.price) {
      alert(`Not enough coins! You need ${gift.price} coins.`);
      return;
    }

    const newBalance = wallet - gift.price;
    setWallet(newBalance); // Optimistic UI

    // 1. Deduct from Sender
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);

    // 2. We need the host's User ID to give them earnings!
    // roomId represents the live_session id. Let's fetch the host ID.
    const { data: sessionData } = await supabase
      .from('live_sessions')
      .select('host_id')
      .eq('id', roomId)
      .single();
    
    const receiverId = sessionData?.host_id;

    if (receiverId) {
      // 3. Insert specific physical transaction to Revenue Ledger
      const usdValue = coinsToUsd(gift.price);
      await supabase.from('gifts').insert({
        sender_id: userId,
        receiver_id: receiverId,
        session_id: roomId,
        gift_name: gift.name,
        coin_cost: gift.price,
        usd_value: usdValue
      });

      // 4. Fire the Global Broadcast event to trigger GiftAnimationLayer visually!
      await supabase.channel(`room-${roomId}`).send({
        type: 'broadcast',
        event: 'gift_sent',
        payload: {
          gift: gift,
          senderName: 'Someone' // Can query profile for real name later
        }
      });
    }
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
          <span className="text-fanx-secondary font-black text-xl leading-none">{wallet.toLocaleString()} 🪙</span>
          <span className="text-[10px] text-gray-500">
            ≈ {formatCurrency(currency === 'USD' ? coinsToUsd(wallet) : usdToNgn(coinsToUsd(wallet)), currency)}
          </span>
        </div>

        {/* Gift List */}
        <div className="flex-1 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {gifts.map((gift) => (
            <button
              key={gift.id}
              onClick={() => sendGift(gift)}
              className="flex flex-col items-center gap-1 min-w-[64px] group"
              title={gift.name}
            >
              <div 
                className="w-12 h-12 rounded-xl glass-pane flex items-center justify-center text-2xl group-hover:scale-110 transition-all border border-transparent group-hover:border-white/20"
                style={{ 
                  textShadow: `0 0 10px ${gift.color || '#fff'}`, 
                  boxShadow: `inset 0 0 20px ${gift.color ? gift.color + '20' : 'transparent'}` 
                }}
              >
                {gift.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-300">
                {gift.price}
              </span>
            </button>
          ))}
        </div>

        {/* Global Action (Top Up) */}
        <button 
          onClick={addMockCoins}
          className="px-6 py-3 bg-fanx-primary text-white font-black rounded-full shadow-lg shadow-fanx-primary/20 hover:scale-105 transition-all text-xs"
        >
          ADD +1K 🪙
        </button>
      </div>
    </div>
  );
}
