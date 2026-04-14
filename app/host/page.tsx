'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  MessageSquare,
  Sparkles,
  Play,
  LogOut,
  Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';

export default function StarHub() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('');
  const [category, setCategory] = useState('Music');
  const [isPublic, setIsPublic] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleGoLive = async () => {
    if (!session?.user) return;
    setIsStarting(true);

    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .insert({
          host_id: session.user.id,
          title: sessionTitle || 'New Collision Session',
          category: category,
          is_public: isPublic,
          status: 'live'
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/live/${data.id}`);
    } catch (error: any) {
      alert('Error starting session: ' + error.message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-secondary/10 blur-[120px] rounded-full -z-10" />

      {/* Modern Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 border-r border-foreground/10 bg-background/50 backdrop-blur-xl z-50 flex flex-col items-center md:items-stretch p-6 gap-8">
        <div className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          FAN<span className="text-fanx-primary">X</span> <span className="hidden md:inline text-sm font-bold text-gray-500 uppercase ml-2 tracking-widest">STAR HUB</span>
        </div>

        <nav className="flex-1 w-full space-y-2">
          <NavItem icon={<Video />} label="Overview" active />
          <NavItem icon={<MessageSquare />} label="Fan Messages" />
          <NavItem icon={<Users />} label="Community" />
          <NavItem icon={<DollarSign />} label="Earnings" />
          <NavItem icon={<BarChart3 />} label="Analytics" />
        </nav>

        <div className="pt-6 border-t border-foreground/10 w-full space-y-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-foreground transition-all font-bold text-sm">
            <Home size={20} /> <span className="hidden md:inline">Back to Home</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={20} /> <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-2 underline decoration-fanx-primary decoration-4">WELCOME BACK</h1>
            <p className="text-gray-500 font-medium">Ready to collide with your fans?</p>
          </div>
          <div className="flex gap-4 items-center">
             <ThemeToggle />
             <button 
              onClick={handleGoLive}
              className="px-8 py-3 bg-fanx-primary hover:bg-fanx-primary/90 text-[10px] font-black uppercase rounded-full glow-primary transition-all flex items-center gap-2"
            >
              <Play size={16} fill="white" /> GO LIVE NOW
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <HostStatCard 
            label="TOTAL EARNINGS" 
            value={`₦${profile?.earnings?.toLocaleString() || '0'}`}
            sub="Last 30 days"
            icon={<DollarSign className="text-green-500" />}
          />
          <HostStatCard 
            label="NEW STARS" 
            value={profile?.follower_count?.toLocaleString() || '0'}
            sub="+15% growth"
            icon={<Users className="text-fanx-secondary" />}
          />
          <HostStatCard 
            label="TOTAL GIFTS" 
            value="0"
            sub="Top contributor: @none"
            icon={<Sparkles className="text-fanx-primary" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Setup */}
          <div className="glass-pane p-8 rounded-[40px] border border-foreground/10 space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3 italic">
               <Settings className="text-fanx-primary" /> SESSION SETUP
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-gray-500">Session Name</label>
                 <input 
                  type="text" 
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-5 py-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-fanx-primary transition-all font-bold text-lg"
                  placeholder="e.g. Late Night Vibes"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">CATEGORY</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-fanx-primary transition-all font-bold"
                  >
                    <option value="Music">Music</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">ACCESS</label>
                  <select 
                    value={isPublic ? 'Public' : 'Private'}
                    onChange={(e) => setIsPublic(e.target.value === 'Public')}
                    className="w-full px-5 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-fanx-primary transition-all font-bold"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Fans */}
          <div className="glass-pane p-8 rounded-[40px] border border-foreground/10">
            <h3 className="text-2xl font-black flex items-center gap-3 italic mb-6">
               <Users className="text-fanx-secondary" /> RECENT SUPERFANS
            </h3>
            <div className="space-y-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-foreground/10 border border-fanx-secondary/30 flex items-center justify-center font-black">F{i}</div>
                      <div>
                        <div className="font-bold">@super_fan_{i}42</div>
                        <div className="text-xs text-gray-500">Sent "Mega Rocket" gift</div>
                      </div>
                   </div>
                   <button className="px-4 py-2 rounded-xl bg-foreground/5 text-xs font-black hover:bg-fanx-secondary/20 transition-all">MESSAGE</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-fanx-primary text-white shadow-lg' : 'text-gray-500 hover:bg-foreground/5 hover:text-foreground'
    }`}>
      {icon} <span className="hidden md:inline font-bold text-sm tracking-tight">{label}</span>
    </div>
  );
}

function HostStatCard({ label, value, sub, icon }: { label: string, value: string, sub?: string, icon: React.ReactNode }) {
  return (
    <div className="glass-pane p-8 rounded-[40px] border border-foreground/10 relative overflow-hidden group hover:scale-[1.02] transition-all">
      <div className="absolute top-6 right-6 p-3 bg-foreground/5 rounded-2xl">{icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}</div>
      <div className="text-4xl font-black mb-1">{value}</div>
      <div className="text-xs font-bold text-fanx-secondary">{sub}</div>
    </div>
  );
}
