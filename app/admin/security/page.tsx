import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminSecurityPage() {
  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">SECURITY LOGS</h1>
        <p className="text-gray-500 font-medium">Platform bans, moderation reports, and flag events.</p>
      </header>
      
      <div className="flex flex-col items-center justify-center p-20 border border-foreground/10 border-dashed rounded-3xl opacity-50">
        <ShieldAlert size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold">Systems Secure</h2>
        <p className="text-gray-500 mt-2">No critical moderation alerts at this time.</p>
      </div>
    </main>
  );
}
