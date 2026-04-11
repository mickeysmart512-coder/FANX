'use client';

import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GiftEvent {
  id: string;
  senderName: string;
  giftId: string;
  lottieUrl: string;
}

export default function GiftAnimationLayer() {
  const [activeGifts, setActiveGifts] = useState<GiftEvent[]>([]);

  // Mock listening to real-time events
  useEffect(() => {
    const handleGift = (event: any) => {
      const newGift: GiftEvent = {
        id: Math.random().toString(),
        senderName: 'Fan_123',
        giftId: 'rose',
        lottieUrl: '/animations/rose.json',
      };
      
      setActiveGifts(prev => [...prev, newGift]);

      // Remove after 3 seconds
      setTimeout(() => {
        setActiveGifts(prev => prev.filter(g => g.id !== newGift.id));
      }, 3500);
    };

    // Placeholder for actual Supabase subscription
    // window.addEventListener('new-gift', handleGift);
  }, []);

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
