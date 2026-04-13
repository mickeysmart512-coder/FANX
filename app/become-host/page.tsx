'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Zap, DollarSign, Globe } from 'lucide-react';

export default function BecomeHostPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-fanx-secondary/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-fanx-primary/10 blur-[150px] rounded-full" />

      <div className="max-w-4xl mx-auto z-10 relative">
        <header className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-tight mb-6">
            OWN THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fanx-primary to-fanx-secondary">STAGE.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto">
            Join the elite circle of Stars who are redefining live interaction and making massive bank.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <FeatureCard 
            icon={<Star className="text-fanx-primary" size={32} />}
            title="Celebrity Status"
            description="Verified badge and priority placement in the explore feed for all professional hosts."
          />
          <FeatureCard 
            icon={<Zap className="text-fanx-secondary" size={32} />}
            title="Elite SFU Tech"
            description="Stream to thousands of fans simultaneously with ultra-low latency and crystal clear grid."
          />
          <FeatureCard 
            icon={<DollarSign className="text-white" size={32} />}
            title="Instant Payouts"
            description="Virtual gifts are converted to NGN/USD instantly. Cash out every single day."
          />
          <FeatureCard 
            icon={<Globe className="text-fanx-primary" size={32} />}
            title="Global Reach"
            description="Connect with fans across Nigeria and the world. Build your global brand from home."
          />
        </div>

        <div className="glass-pane p-12 rounded-[3.5rem] border border-white/10 text-center space-y-8">
          <h2 className="text-3xl font-black italic">READY TO GO LIVE?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Currently, host applications are by invitation only. If you have a significant following on social media, apply below to join our next wave.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-12 py-5 bg-fanx-primary text-white text-xl font-black rounded-full hover:scale-105 transition-all glow-primary">
              APPLY NOW
            </button>
            <Link href="/">
              <button className="px-12 py-5 glass-pane text-xl font-black rounded-full hover:bg-white/10 transition-all w-full sm:w-auto">
                BACK TO HOME
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 glass-pane border border-white/10 rounded-3xl space-y-4 hover:border-white/20 transition-all">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
