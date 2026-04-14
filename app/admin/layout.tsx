'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Video,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Shared Sidebar */}
      <aside className="w-64 border-r border-foreground/10 p-6 flex flex-col gap-8 hidden md:flex h-screen sticky top-0">
        <div className="text-2xl font-black italic tracking-tighter">
          FAN<span className="text-fanx-primary">X</span> ADMIN
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5" hover:text-foreground'
            }`}
          >
             <Activity size={20} /> Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin/users' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5" hover:text-foreground'
            }`}
          >
             <Users size={20} /> Users
          </Link>
          <Link 
            href="/admin/sessions" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin/sessions' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5" hover:text-foreground'
            }`}
          >
            <Video size={20} /> Live Sessions
          </Link>
          <Link 
            href="/admin/revenue" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin/revenue' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5" hover:text-foreground'
            }`}
          >
            <DollarSign size={20} /> Revenue
          </Link>
          <Link 
            href="/admin/security" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin/security' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5" hover:text-foreground'
            }`}
          >
            <ShieldAlert size={20} /> Security
          </Link>
        </nav>

        <div className="pt-6 border-t border-foreground/10 space-y-2">
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname === '/admin/settings' ? 'bg-foreground/5 text-foreground' : 'text-gray-500 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <Settings size={20} /> Gift Shop
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
