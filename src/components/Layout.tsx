import React from "react";
import { motion } from "motion/react";
import { Terminal, ShieldCheck } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/src/lib/utils";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-cyber-gradient text-white selection:bg-cyan-500/30 font-sans">
      <Toaster position="top-center" theme="dark" />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Terminal className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                HACKVERSE <span className="text-cyan-400 not-italic">PRELIMS</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <p className="text-[10px] text-cyan-400/80 font-mono tracking-[0.2em] uppercase">System Online // v2.0</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            {!isAdminPage && (
              <Link 
                to="/admin" 
                className="text-[10px] uppercase tracking-[0.2em] font-bold border border-white/10 px-4 h-10 rounded-full transition-all text-white/50 hover:text-white hover:bg-white/5 flex items-center"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            )}
            {isAdminPage && (
              <Link 
                to="/"
                className="text-[10px] uppercase tracking-[0.2em] font-bold border border-cyan-400/50 bg-cyan-400/10 px-4 h-10 rounded-full transition-all text-cyan-400 flex items-center"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Home
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="relative z-10 py-32 border-t border-white/10 mt-32 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-sm font-black tracking-[0.5em] uppercase italic">Hackverse // 2026</span>
          </div>
          <div className="flex gap-8 opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
          <p className="text-white/10 text-[10px] font-black tracking-[0.4em] uppercase text-center max-w-lg leading-loose">
            &copy; 2026 PRELIMS LEADERBOARD &bull; SECURED BY CYBER_CORE &bull; POWERED BY AI STUDIO &bull; ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
