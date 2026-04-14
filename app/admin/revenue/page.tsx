import React from 'react';
import { DollarSign } from 'lucide-react';

export default function AdminRevenuePage() {
  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">REVENUE TRACKING</h1>
        <p className="text-gray-500 font-medium">Global platform earnings, payouts, and gift logs.</p>
      </header>
      
      <div className="flex flex-col items-center justify-center p-20 border border-foreground/10 border-dashed rounded-3xl opacity-50">
        <DollarSign size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold">Revenue Data Formatting</h2>
        <p className="text-gray-500 mt-2">Payment integrations are currently being sandboxed.</p>
      </div>
    </main>
  );
}
