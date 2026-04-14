'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency, coinsToUsd, usdToNgn } from '@/lib/currency';
import { supabase } from '@/lib/supabase';
import GuestGate from '@/components/video/GuestGate';

interface GiftBarProps {
  roomId?: string;
  isGuest?: boolean; // true if not logged in
}

export default function GiftBar({ roomId, isGuest = false }: GiftBarProps) {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [wallet, setWallet] = useState<number>(0);
  const [gifts, setGifts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [gateMessage, setGateMessage] = useState('');

  const requireAuth = (action: string) => {
    if (isGuest) {
      setGateMessage(action);
      setShowGate(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    async function loadData() {
      if (!isGuest) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('coins_balance')
            .eq('id', user.id)
            .single();
          setWallet(profile?.coins_balance || 0);
        }
      }

      const { data: catalog } = await supabase
        .from('catalog_items')
        .select('*')
        .order('price', { ascending: true });

      if (catalog && catalog.length > 0) {
        setGifts(catalog);
      } else {
        setGifts([
          { id: 'mock1', name: 'Rose', price: 1, icon: '🌹', color: '#FF0050' },
          { id: 'mock2', name: 'Fire', price: 5, icon: '🔥', color: '#FFA500' },
          { id: 'mock3', name: 'Supercar', price: 50, icon: '🏎️', color: '#00F2EA' },
          { id: 'mock4', name: 'Rocket', price: 100, icon: '🚀', color: '#FFFFFF' },
          { id: 'mock5', name: 'Money Rain', price: 500, icon: '💸', color: '#00FF00' },
        ]);
      }
    }
    loadData();
  }, [isGuest]);

  // Real-time wallet balance sync
  useEffect(() => {
    if (!userId) return;
    const sub = supabase.channel('wallet_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload: any) => {
        setWallet(payload.new.coins_balance || 0);
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [userId]);

  const addMockCoins = async () => {
    if (requireAuth('Sign in to add coins to your wallet.')) return;
    if (!userId) return;
    const newBalance = wallet + 1000;
    setWallet(newBalance);
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);
  };

  const sendGift = async (gift: any) => {
    if (requireAuth(`Sign in to send a ${gift.name} — it costs ${gift.price} coins!`)) return;
    if (!roomId || !userId) return;
    if (wallet < gift.price) {
      alert(`Not enough coins! You need ${gift.price} coins.`);
      return;
    }

    const newBalance = wallet - gift.price;
    setWallet(newBalance);
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);

    const { data: sessionData } = await supabase
      .from('live_sessions')
      .select('host_id')
      .eq('id', roomId)
      .single();

    const receiverId = sessionData?.host_id;
    if (receiverId) {
      const usdValue = coinsToUsd(gift.price);
      await supabase.from('gifts').insert({
        sender_id: userId,
        receiver_id: receiverId,
        session_id: roomId,
        gift_name: gift.name,
        coin_cost: gift.price,
        usd_value: usdValue
      });

      await supabase.channel(`room-${roomId}`).send({
        type: 'broadcast',
        event: 'gift_sent',
        payload: { gift, senderName: 'A Fan' }
      });
    }
  };

  return (
    <>
      {showGate && <GuestGate onClose={() => setShowGate(false)} message={gateMessage} />}

      <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-4 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center gap-6">
          {/* Wallet */}
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
            {isGuest ? (
              <button onClick={() => requireAuth('Sign in to see your coin balance.')} className="text-gray-600 font-black text-sm text-left">
                🔒 Hidden
              </button>
            ) : (
              <>
                <span className="text-fanx-secondary font-black text-xl leading-none">{wallet.toLocaleString()} 🪙</span>
                <span className="text-[10px] text-gray-500">
                  ≈ {formatCurrency(currency === 'USD' ? coinsToUsd(wallet) : usdToNgn(coinsToUsd(wallet)), currency)}
                </span>
              </>
            )}
          </div>

          {/* Gifts */}
          <div className="flex-1 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => sendGift(gift)}
                title={`Send ${gift.name} — ${gift.price} 🪙`}
                className="flex flex-col items-center gap-1 min-w-[64px] group"
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
                <span className="text-[10px] font-bold text-gray-300">{gift.price}</span>
              </button>
            ))}
          </div>

          {/* Add Coins */}
          <button
            onClick={addMockCoins}
            className="px-6 py-3 bg-fanx-primary text-white font-black rounded-full shadow-lg shadow-fanx-primary/20 hover:scale-105 transition-all text-xs"
          >
            ADD +1K 🪙
          </button>
        </div>
      </div>
    </>
  );
}
