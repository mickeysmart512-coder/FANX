import React from 'react';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">SYSTEM SETTINGS</h1>
        <p className="text-gray-500 font-medium">Global platform configuration options.</p>
      </header>
      
      <div className="flex flex-col items-center justify-center p-20 border border-foreground/10 border-dashed rounded-3xl opacity-50">
        <Settings size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold">Preferences Saved</h2>
        <p className="text-gray-500 mt-2">Configuration UI is under construction.</p>
      </div>
    </main>
  );
}
