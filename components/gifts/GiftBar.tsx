'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency, coinsToUsd, usdToNgn } from '@/lib/currency';
import { supabase } from '@/lib/supabase';
import GuestGate from '@/components/video/GuestGate';
import { UserPlus, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CoHostStatus = 'idle' | 'pending' | 'accepted' | 'rejected';

interface GiftBarProps {
  roomId?: string;
  isGuest?: boolean;
}

export default function GiftBar({ roomId, isGuest = false }: GiftBarProps) {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [wallet, setWallet] = useState<number>(0);
  const [gifts, setGifts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [gateMessage, setGateMessage] = useState('');
  const [cohostStatus, setCohostStatus] = useState<CoHostStatus>('idle');
  const router = useRouter();

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

      setGifts(catalog?.length ? catalog : [
        { id: 'mock1', name: 'Rose', price: 1, icon: '🌹', color: '#FF0050' },
        { id: 'mock2', name: 'Fire', price: 5, icon: '🔥', color: '#FFA500' },
        { id: 'mock3', name: 'Supercar', price: 50, icon: '🏎️', color: '#00F2EA' },
        { id: 'mock4', name: 'Rocket', price: 100, icon: '🚀', color: '#FFFFFF' },
        { id: 'mock5', name: 'Money Rain', price: 500, icon: '💸', color: '#00FF00' },
      ]);
    }
    loadData();
  }, [isGuest]);

  // Real-time wallet sync
  useEffect(() => {
    if (!userId) return;
    const sub = supabase.channel(`wallet_sync_${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload: any) => {
        setWallet(payload.new.coins_balance || 0);
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [userId]);

  // Listen for co-host decision from host
  useEffect(() => {
    if (!userId || !roomId || cohostStatus !== 'pending') return;
    const channel = supabase.channel(`cohost-decision-${userId}-${roomId}`)
      .on('broadcast', { event: 'cohost_decision' }, (payload) => {
        const { decision } = payload.payload;
        if (decision === 'accepted') {
          setCohostStatus('accepted');
          // Auto-navigate to co-host view after a brief moment
          setTimeout(() => {
            router.push(`/live/${roomId}?role=cohost`);
          }, 1500);
        } else {
          setCohostStatus('rejected');
          // Reset after showing rejection toast
          setTimeout(() => setCohostStatus('idle'), 4000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, roomId, cohostStatus, router]);

  const [lastSentGift, setLastSentGift] = useState<string | null>(null);

  const requestCoHost = async () => {
    if (requireAuth('Sign in to request co-hosting this stream.')) return;
    if (!userId || !roomId) return;
    if (cohostStatus === 'pending') return;

    setCohostStatus('pending');
    await supabase.from('cohost_requests').insert({
      session_id: roomId,
      requester_id: userId,
      status: 'pending'
    });
  };

  const addMockCoins = async () => {
    if (requireAuth('Sign in to add coins to your wallet.')) return;
    if (!userId) return;
    const newBalance = wallet + 1000;
    setWallet(newBalance);
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);
  };

  const sendGift = async (gift: any) => {
    if (requireAuth(`Sign in to send a ${gift.name}!`)) return;
    if (!roomId || !userId) return;
    if (wallet < gift.price) { alert(`Not enough coins! You need ${gift.price} 🪙`); return; }

    const newBalance = wallet - gift.price;
    setWallet(newBalance);
    await supabase.from('profiles').update({ coins_balance: newBalance }).eq('id', userId);

    const { data: sessionData } = await supabase
      .from('live_sessions').select('host_id').eq('id', roomId).single();

    if (sessionData?.host_id) {
      await supabase.from('gifts').insert({
        sender_id: userId,
        receiver_id: sessionData.host_id,
        session_id: roomId,
        gift_name: gift.name,
        coin_cost: gift.price,
        usd_value: coinsToUsd(gift.price)
      });

      await supabase.channel(`room-${roomId}`).send({
        type: 'broadcast',
        event: 'gift_sent',
        payload: { gift, senderName: 'A Fan' }
      });
      
      setLastSentGift(gift.id);
      setTimeout(() => setLastSentGift(null), 500);
    }
  };

  const CoHostButton = () => {
    if (cohostStatus === 'accepted') return (
      <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-[9px] font-black rounded-full flex items-center gap-1.5 animate-pulse">
        <CheckCircle size={12} /> ACCEPTED! Switching...
      </div>
    );
    if (cohostStatus === 'rejected') return (
      <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black rounded-full">
        Request Declined
      </div>
    );
    if (cohostStatus === 'pending') return (
      <div className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 text-[9px] font-black rounded-full flex items-center gap-1.5">
        <Clock size={12} className="animate-spin" /> Waiting...
      </div>
    );
    return (
      <button
        onClick={requestCoHost}
        className="px-4 py-2 bg-fanx-secondary/20 border border-fanx-secondary/40 text-fanx-secondary text-[9px] font-black rounded-full flex items-center gap-1.5 hover:bg-fanx-secondary/30 transition-all hover:scale-105"
      >
        <UserPlus size={12} /> REQUEST CO-HOST
      </button>
    );
  };

  return (
    <>
      {showGate && <GuestGate onClose={() => setShowGate(false)} message={gateMessage} />}

      <div className="fixed bottom-0 left-0 w-full glass-pane border-t border-white/10 p-4 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          {/* Wallet */}
          <div className="flex flex-col gap-0.5 min-w-[100px]">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 uppercase font-black">Wallet</span>
              <button onClick={() => setCurrency(c => c === 'USD' ? 'NGN' : 'USD')} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-bold hover:bg-white/20">
                {currency} ⇄
              </button>
            </div>
            {isGuest ? (
              <button onClick={() => requireAuth('Sign in to see your wallet.')} className="text-gray-600 font-black text-sm text-left">🔒 Hidden</button>
            ) : (
              <>
                <span className="text-fanx-secondary font-black text-lg leading-none">{wallet.toLocaleString()} 🪙</span>
                <span className="text-[9px] text-gray-500">≈ {formatCurrency(currency === 'USD' ? coinsToUsd(wallet) : usdToNgn(coinsToUsd(wallet)), currency)}</span>
              </>
            )}
          </div>

          {/* Gifts */}
          <div className="flex-1 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {gifts.map(gift => {
              const isSent = lastSentGift === gift.id;
              return (
                <button 
                  key={gift.id} 
                  onClick={() => sendGift(gift)} 
                  title={`${gift.name} — ${gift.price} 🪙`} 
                  className={`flex flex-col items-center gap-1 min-w-[56px] group transition-all duration-300 ${isSent ? 'scale-110 -translate-y-2' : ''}`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl glass-pane flex items-center justify-center text-xl group-hover:scale-110 transition-all ${isSent ? 'bg-white/20 ring-2' : ''}`}
                    style={{ 
                      textShadow: `0 0 10px ${gift.color || '#fff'}`,
                      ringColor: isSent ? gift.color || '#fff' : 'transparent',
                      boxShadow: isSent ? `0 0 20px ${gift.color || '#ffffff'}80` : 'none'
                    }}
                  >
                    {gift.icon}
                  </div>
                  <span className={`text-[9px] font-bold ${isSent ? 'text-white' : 'text-gray-300'}`}>{gift.price}</span>
                </button>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex flex-col gap-2 items-end ml-2">
            {roomId && <CoHostButton />}
            <button onClick={addMockCoins} className="px-4 py-2 bg-fanx-primary text-white font-black rounded-full hover:scale-105 transition-all text-[9px]">
              ADD +1K 🪙
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
