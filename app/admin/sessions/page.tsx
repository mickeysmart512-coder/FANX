import React from 'react';
import { Video } from 'lucide-react';

export default function AdminSessionsPage() {
  return (
    <main className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">LIVE SESSIONS</h1>
        <p className="text-gray-500 font-medium">Monitor and manage active collision streams.</p>
      </header>
      
      <div className="flex flex-col items-center justify-center p-20 border border-foreground/10 border-dashed rounded-3xl opacity-50">
        <Video size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold">No Active Sessions</h2>
        <p className="text-gray-500 mt-2">Active streaming sessions will dynamically populate here.</p>
      </div>
    </main>
  );
}
