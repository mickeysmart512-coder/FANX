'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Video,
  DollarSign
} from 'lucide-react';
import PayoutPanel from '@/components/admin/PayoutPanel';

import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-foreground/10 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="text-2xl font-black italic tracking-tighter">
          FAN<span className="text-fanx-primary">X</span> ADMIN
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-foreground/5 text-foreground rounded-xl font-medium transition-all">
            <Activity size={20} /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <Users size={20} /> Users
          </Link>
          <Link href="/admin/sessions" className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <Video size={20} /> Live Sessions
          </Link>
          <Link href="/admin/revenue" className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <DollarSign size={20} /> Revenue
          </Link>
          <Link href="/admin/security" className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <ShieldAlert size={20} /> Security
          </Link>
        </nav>

        <div className="pt-6 border-t border-foreground/10 space-y-2">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <Settings size={20} /> Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">COMMAND CENTER</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Platform overview and real-time analytics.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="px-6 py-3 glass-pane border border-foreground/10 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest text-green-500">System Live</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Revenue" 
            value="₦4,250,000" 
            change="+12.5%" 
            icon={<TrendingUp className="text-green-500" />} 
          />
          <StatCard 
            title="Active Stars" 
            value="42" 
            change="+3" 
            icon={<Users className="text-fanx-secondary" />} 
          />
          <StatCard 
            title="Live Sessions" 
            value="18" 
            change="+5" 
            icon={<Video className="text-fanx-primary" />} 
          />
          <StatCard 
            title="Avg. Concurrent" 
            value="12.4k" 
            change="+8.2%" 
            icon={<Activity className="text-white" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Payouts Section */}
            <PayoutPanel />
            
            {/* Recent Activity Mockup */}
            <div className="p-6 glass-pane border border-foreground/10 rounded-2xl">
              <h3 className="text-xl font-black mb-6 uppercase italic">Critical System Logs</h3>
              <div className="space-y-4 font-mono text-xs">
                <div className="flex gap-4 text-gray-500 border-l-2 border-fanx-primary pl-4">
                  <span className="text-fanx-primary">[!] SECURITY</span>
                  <span>Multiple failed login attempts from 192.168.1.45</span>
                  <span className="ml-auto">2m ago</span>
                </div>
                <div className="flex gap-4 text-gray-500 border-l-2 border-fanx-secondary pl-4">
                  <span className="text-fanx-secondary">[+] SESSION</span>
                  <span>Legendary Star "Burnaboy" started public session</span>
                  <span className="ml-auto">15m ago</span>
                </div>
                <div className="flex gap-4 text-gray-500 border-l-2 border-foreground/20 pl-4">
                  <span className="text-foreground/60">[*] UPDATE</span>
                  <span>SFU Cluster #4 auto-scaled to 8 instances</span>
                  <span className="ml-auto">45m ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Real-time Tipping Chart Mockup */}
            <div className="p-6 glass-pane border border-foreground/10 rounded-2xl h-[400px] flex flex-col">
              <h3 className="text-xl font-black mb-6 uppercase italic">Hot Sessions</h3>
              <div className="flex-1 flex flex-col gap-4">
                <SessionRank name="Wizkid Live" fans="8.5k" color="bg-fanx-primary" width="90%" />
                <SessionRank name="Davido private" fans="4.2k" color="bg-fanx-secondary" width="65%" />
                <SessionRank name="Tiwa Savage" fans="3.1k" color="bg-foreground/80 dark:bg-white" width="45%" />
                <SessionRank name="Don Jazzy" fans="2.8k" color="bg-fanx-primary" width="40%" />
                <SessionRank name="Olamide" fans="1.2k" color="bg-fanx-secondary" width="15%" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 glass-pane border border-foreground/10 rounded-2xl space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-foreground/5 rounded-lg border border-foreground/10">{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-xs font-bold text-green-500 mt-1">{change} <span className="text-gray-500 dark:text-gray-400 ml-1">vs last 24h</span></div>
      </div>
    </div>
  );
}

function SessionRank({ name, fans, color, width }: { name: string, fans: string, color: string, width: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span>{name}</span>
        <span className="text-gray-500 dark:text-gray-400">{fans} fans</span>
      </div>
      <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width }} />
      </div>
    </div>
  );
}
