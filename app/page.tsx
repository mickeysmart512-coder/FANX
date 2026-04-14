'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const currentSession = data?.session || null;
      setSession(currentSession);
      
      // Auto-redirect if session exists
      if (currentSession) {
        const role = currentSession.user.user_metadata?.role;
        const email = currentSession.user.email;
        if (role === 'admin' || email === 'onojamichaelmichael@gmail.com') {
          router.push('/admin');
        } else {
          router.push('/explore');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) {
        const role = session.user.user_metadata?.role;
        const email = session.user.email;
        if (role === 'admin' || email === 'onojamichaelmichael@gmail.com') {
          router.push('/admin');
        } else {
          router.push('/explore');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const dashboardPath = (session?.user?.user_metadata?.role === 'admin' || session?.user?.email === 'onojamichaelmichael@gmail.com') ? '/admin' : '/explore';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-secondary/20 blur-[120px] rounded-full" />

      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50">
        <h1 className="text-3xl font-black tracking-tighter italic">
          FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
        </h1>
        <div className="flex items-center space-x-4">
          {session && (
            <span className="text-[10px] bg-foreground/5 px-2 py-1 rounded text-gray-500 font-mono">
              DEBUG: {session.user.user_metadata?.role || 'no-role'}
            </span>
          )}
          <ThemeToggle />
          {!session ? (
            <>
              <Link href="/login" className="px-6 py-2 rounded-full glass-pane hover:bg-foreground/10 transition-all">
                Login
              </Link>
              <Link href="/signup" className="px-6 py-2 rounded-full bg-fanx-primary text-white font-bold hover:scale-105 transition-all glow-primary">
                Join Now
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href={dashboardPath} className="px-6 py-2 rounded-full bg-foreground text-background font-bold hover:scale-105 transition-all">
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut}
                className="px-6 py-2 rounded-full glass-pane hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="text-center z-10 max-w-4xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
            WHERE FANS & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fanx-primary to-fanx-secondary">
              STARS COLLIDE.
            </span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
            The ultimate hybrid of TikTok Live × Zoom. 50 Celebrities. Thousands of Fans. 
            Real-time money moves.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href={session ? dashboardPath : "/explore"}>
            <button className="px-10 py-4 bg-foreground text-background text-xl font-black rounded-full hover:scale-105 transition-all uppercase tracking-tight">
              {session ? 'Explore Sessions' : 'Start Exploring'}
            </button>
          </Link>
          {!session && (
            <Link href="/become-host">
              <button className="px-10 py-4 glass-pane text-xl font-black rounded-full hover:bg-foreground/10 transition-all uppercase tracking-tight">
                Become a Host
              </button>
            </Link>
          )}
        </div>

        {/* Feature Grid Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="p-6 glass-pane space-y-2 border-l-4 border-fanx-primary">
            <h3 className="text-xl font-bold">50 Host SFU</h3>
            <p className="text-sm text-gray-400">High-quality video grid that doesn't lag.</p>
          </div>
          <div className="p-6 glass-pane space-y-2 border-l-4 border-fanx-secondary">
            <h3 className="text-xl font-bold">Gift Explosions</h3>
            <p className="text-sm text-gray-400">Watch the screen go crazy when big gifts drop.</p>
          </div>
          <div className="p-6 glass-pane space-y-2 border-l-4 border-white">
            <h3 className="text-xl font-bold">Instant Payouts</h3>
            <p className="text-sm text-gray-400">Convert your virtual gifts to cash instantly.</p>
          </div>
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="fixed bottom-0 w-full p-6 text-center text-xs text-gray-600">
        © 2026 FANX PLATFORM • NIGERIA FIRST • GLOBAL NEXT
      </footer>
    </main>
  );
}
