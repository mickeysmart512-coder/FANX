'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check role and redirect accordingly
      const role = data?.user?.user_metadata?.role || 'user';
      const email = data?.user?.email;
      if (role === 'admin' || email === 'onojamichaelmichael@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/host');
      }
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-secondary/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black tracking-tighter italic inline-block mb-4">
            FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
          </Link>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400">Log in to join the collision.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 glass-pane p-8 rounded-3xl border border-foreground/10">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl focus:border-fanx-primary focus:ring-1 focus:ring-fanx-primary outline-none transition-all placeholder:text-gray-500"
              placeholder="star@fanx.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl focus:border-fanx-primary focus:ring-1 focus:ring-fanx-primary outline-none transition-all placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-fanx-primary hover:bg-fanx-primary/90 text-white font-black rounded-2xl transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-fanx-secondary font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
