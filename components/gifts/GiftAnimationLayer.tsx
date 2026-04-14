'use client';

import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';

interface GiftEvent {
  id: string;
  senderName: string;
  giftId: string;
  giftName: string;
  price: number;
  icon: string;
  lottieUrl: string;
  tier: 'small' | 'medium' | 'large';
  color: string;
}

interface GiftAnimationLayerProps {
  roomId?: string;
}

export default function GiftAnimationLayer({ roomId }: GiftAnimationLayerProps) {
  const [activeGifts, setActiveGifts] = useState<GiftEvent[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room-${roomId}`)
      .on('broadcast', { event: 'gift_sent' }, (payload) => {
        const giftData = payload.payload;
        const price = giftData.gift.price || 1;
        
        let tier: 'small' | 'medium' | 'large' = 'small';
        if (price >= 50 && price < 500) tier = 'medium';
        if (price >= 500) tier = 'large';

        let lottieFile = '/animations/rose.json';
        if (giftData.gift.name.toLowerCase().includes('rocket')) lottieFile = '/animations/rocket.json';
        if (giftData.gift.name.toLowerCase().includes('money')) lottieFile = '/animations/money.json';

        const newGift: GiftEvent = {
          id: Math.random().toString(),
          senderName: giftData.senderName,
          giftId: giftData.gift.id,
          giftName: giftData.gift.name,
          price: price,
          icon: giftData.gift.icon,
          color: giftData.gift.color || '#fanx-primary',
          lottieUrl: lottieFile,
          tier,
        };
        
        setActiveGifts(prev => [...prev, newGift]);

        // Different display durations based on tier
        const duration = tier === 'large' ? 6000 : tier === 'medium' ? 4500 : 3500;
        setTimeout(() => {
          setActiveGifts(prev => prev.filter(g => g.id !== newGift.id));
        }, duration);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {activeGifts.map((gift) => {
          if (gift.tier === 'large') {
            return (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[200]"
              >
                {/* Full screen massive effect */}
                <motion.div 
                  initial={{ y: 200, scale: 0.5, rotate: -20 }}
                  animate={{ y: 0, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
                  className="w-96 h-96 relative flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-3xl rounded-full" />
                  <DotLottieReact src={gift.lottieUrl} autoplay loop={true} />
                  <div className="absolute text-9xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl">
                    {gift.icon}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]">
                    {gift.senderName} 
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    sent a <span style={{ color: gift.color }} className="font-black drop-shadow-lg">{gift.giftName}</span>!
                  </p>
                </motion.div>
              </motion.div>
            );
          }

          if (gift.tier === 'medium') {
            return (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, scale: 0.5, y: 100 }}
                animate={{ opacity: 1, scale: 1.2, y: 0 }}
                exit={{ opacity: 0, scale: 1.5, y: -200 }}
                className="absolute flex flex-col items-center z-[150]"
              >
                <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 bg-gradient-to-t rounded-full blur-2xl opacity-40 mix-blend-screen" style={{ backgroundImage: `linear-gradient(to top, transparent, ${gift.color})` }} />
                  <DotLottieReact src={gift.lottieUrl} autoplay loop={false} />
                  <div className="absolute text-6xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-xl">{gift.icon}</div>
                </div>
                
                <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2 flex items-center gap-2" style={{ borderColor: `${gift.color}40` }}>
                  <span className="text-white font-black italic">{gift.senderName}</span>
                  <span className="text-gray-300 font-bold text-sm">sent</span>
                  <span className="font-black" style={{ color: gift.color }}>{gift.giftName}</span>
                </div>
              </motion.div>
            );
          }

          // Small Tier (Default)
          return (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, x: -100, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              className="absolute left-8 bottom-32 flex flex-row items-center gap-2 z-[100]"
            >
              <div className="bg-black/60 backdrop-blur-md pl-2 pr-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl overflow-hidden relative">
                   <div className="absolute inset-0 z-0">
                     <DotLottieReact src={gift.lottieUrl} autoplay loop={false} />
                   </div>
                   <div className="z-10">{gift.icon}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-fanx-secondary font-black text-xs leading-none">{gift.senderName}</span>
                  <span className="text-gray-300 font-bold text-[10px] leading-tight mt-0.5">sent {gift.giftName}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
