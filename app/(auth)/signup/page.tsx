'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user', // Default role
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-primary/20 blur-[120px] rounded-full" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-secondary/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black tracking-tighter italic inline-block mb-4">
            FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
          </Link>
          <h2 className="text-2xl font-bold">Join the Collision</h2>
          <p className="text-gray-400">Create your account and start interacting.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6 glass-pane p-8 rounded-3xl border border-white/10">
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
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all"
              placeholder="star@fanx.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-fanx-secondary focus:ring-1 focus:ring-fanx-secondary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-fanx-secondary hover:bg-fanx-secondary/90 text-black font-black rounded-2xl transition-all glow-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          <div className="text-center text-sm text-gray-400 mt-4">
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
