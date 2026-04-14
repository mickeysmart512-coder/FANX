'use client';

import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';

interface GiftEvent {
  id: string;
  senderName: string;
  giftId: string;
  lottieUrl: string;
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

        // Map standard items to a Lottie fallback if needed
        // Future admin config can set specific JSON files per gift
        let lottieFile = '/animations/rose.json';
        if (giftData.gift.name.toLowerCase().includes('rocket')) lottieFile = '/animations/rocket.json';
        if (giftData.gift.name.toLowerCase().includes('money')) lottieFile = '/animations/money.json';

        const newGift: GiftEvent = {
          id: Math.random().toString(),
          senderName: giftData.senderName,
          giftId: giftData.gift.id,
          lottieUrl: lottieFile,
        };
        
        setActiveGifts(prev => [...prev, newGift]);

        // Remove after 3.5 seconds
        setTimeout(() => {
          setActiveGifts(prev => prev.filter(g => g.id !== newGift.id));
        }, 3500);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center">
      <AnimatePresence>
        {activeGifts.map((gift) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1.2, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -200 }}
            className="flex flex-col items-center"
          >
            {/* Animation placeholder using local JSON asset */}
            <div className="w-64 h-64">
              <DotLottieReact
                src={gift.lottieUrl}
                autoplay
                loop={false}
              />
            </div>
            
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-fanx-secondary/30">
              <span className="text-fanx-secondary font-black italic">{gift.senderName}</span>
              <span className="text-white font-bold ml-2">sent a gift!</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
