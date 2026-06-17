import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-slate-200 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-500">
            <Zap size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">NexusAI</span>
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2.5 text-sm font-semibold tracking-wide text-slate-900 bg-emerald-500 rounded-full hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Intelligent Model Routing</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 mb-8 leading-tight">
          The Future of <br className="hidden md:block" /> AI Interaction
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl font-medium leading-relaxed">
          NexusAI dynamically routes your prompts to the optimal LLM based on complexity, cost, and latency. Experience peak performance without the premium price tag.
        </p>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-emerald-500 rounded-full hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <a 
            href="#features" 
            className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors duration-300"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 bg-black/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">Dynamic Routing</h3>
              <p className="text-zinc-400 leading-relaxed">
                Automatically directs simple queries to faster models and complex reasoning tasks to advanced models.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <TrendingDown size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">Cost Optimization</h3>
              <p className="text-zinc-400 leading-relaxed">
                Slash your API bills by up to 60%. Track real-time savings with our intuitive cost analysis dashboard.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">Enterprise Secure</h3>
              <p className="text-zinc-400 leading-relaxed">
                Built on top of Supabase auth with RLS policies ensuring your prompts and history remain totally private.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center text-zinc-500 text-sm">
        <p>&copy; {new Date().getFullYear()} NexusAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
