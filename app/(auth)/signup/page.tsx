'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Username availability check with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus('checking');
      
      try {
        if (!supabase) {
          console.error('Supabase not initialized. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
          setUsernameStatus('idle'); // Don't show 'available' if we don't know
          return;
        }

        // Add a timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 3000)
        );

        const checkPromise = supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        const result: any = await Promise.race([checkPromise, timeoutPromise]);
        
        const { data, error } = result;

        if (error) {
          // Postgres error code 42P01 means 'profiles' table doesn't exist yet
          if (error.code === '42P01') {
            console.warn('Profiles table not yet created. Defaulting to available.');
            setUsernameStatus('available');
          } else {
            console.error('Database error checking username:', error);
            setUsernameStatus('available'); // Don't block user on other DB errors
          }
          return;
        }

        if (data) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err: any) {
        if (err.message === 'timeout') {
          console.warn('Username check timed out. Assuming available to prevent blocking user.');
          setUsernameStatus('available');
        } else {
          console.error('Unexpected error in username check:', err);
          setUsernameStatus('available'); // Fallback to not block user
        }
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus !== 'available') {
      setError('Please choose an available username.');
      return;
    }

    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured. Please add your SUPABASE_URL and ANON_KEY to your Vercel project settings.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
          role: 'user', // Default role
        },
      },
    });

    if (error) {
      console.error('Signup error details:', error);
      if (error.message === 'Failed to fetch') {
        setError('Network Error: Failed to reach Supabase. Please check your internet connection or ensure your Supabase project is not paused.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      // Create profile record in public.profiles
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            display_name: fullName,
            username: username.toLowerCase(),
            role: 'fan', // Default role
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // We don't block the user if profile creation fails, 
          // but we log it. In a real app, a trigger is better.
        }
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Glows */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-primary/20 blur-[120px] rounded-full" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-secondary/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10 py-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black tracking-tighter italic inline-block mb-4">
            FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
          </Link>
          <h2 className="text-2xl font-bold">Join the Collision</h2>
          <p className="text-gray-500 dark:text-gray-400">Create your account and start interacting.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 glass-pane p-8 rounded-3xl border border-foreground/10">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded-xl text-center">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all placeholder:text-gray-500"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className={`w-full px-5 py-4 bg-foreground/5 border rounded-2xl outline-none transition-all placeholder:text-gray-500 ${
                  usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' :
                  usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' :
                  'border-foreground/10 focus:border-fanx-secondary'
                }`}
                placeholder="star_boy"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="animate-spin text-gray-400" size={20} />}
                {usernameStatus === 'available' && <CheckCircle2 className="text-green-500" size={20} />}
                {usernameStatus === 'taken' && <XCircle className="text-red-500" size={20} />}
              </div>
            </div>
            {usernameStatus === 'taken' && <p className="text-[10px] text-red-500 ml-1 font-bold italic transition-all">Username already taken!</p>}
            {usernameStatus === 'available' && <p className="text-[10px] text-green-500 ml-1 font-bold italic transition-all">Username available!</p>}
            {usernameStatus === 'checking' && <p className="text-[10px] text-gray-500 ml-1 font-medium italic animate-pulse">Checking availability...</p>}
            <p className="text-[10px] text-gray-500 ml-1 font-medium italic">3+ characters, only letters, numbers, and underscores.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all placeholder:text-gray-500"
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
              className="w-full px-5 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || (username.length > 0 && usernameStatus !== 'available')}
            className="w-full py-4 bg-fanx-secondary hover:bg-fanx-secondary/90 text-black font-black rounded-2xl transition-all glow-secondary disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-fanx-primary font-bold hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
