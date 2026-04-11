import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fanx-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fanx-secondary/20 blur-[120px] rounded-full" />

      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50">
        <h1 className="text-3xl font-black tracking-tighter italic">
          FAN<span className="text-fanx-primary underline decoration-fanx-secondary">X</span>
        </h1>
        <div className="space-x-4">
          <Link href="/login" className="px-6 py-2 rounded-full glass-pane hover:bg-white/10 transition-all">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-2 rounded-full bg-fanx-primary text-white font-bold hover:scale-105 transition-all glow-primary">
            Join Now
          </Link>
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
          <p className="text-xl text-gray-400 font-medium">
            The ultimate hybrid of TikTok Live × Zoom. 50 Celebrities. Thousands of Fans. 
            Real-time money moves.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-10 py-4 bg-white text-black text-xl font-black rounded-full hover:scale-105 transition-all">
            EXPLORE SESSIONS
          </button>
          <button className="px-10 py-4 glass-pane text-xl font-black rounded-full hover:bg-white/10 transition-all">
            BECOME A HOST
          </button>
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
