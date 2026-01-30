"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  IconArrowLeft, 
  IconRefresh, 
  IconBrain,
  IconNews,
  IconTarget,
  IconExternalLink,
  IconTrendingUp,
  IconActivity,
  IconRocket
} from '@tabler/icons-react'

// --- Types ---
interface TopPick {
  action: string;
  name: string;
  price: string;
  reason: string;
}

interface LiveSignal {
  title: string;
  details: string;
  source: string;
}

interface MarketData {
  market_summary: string;
  llm_advice: string;
  sentiment: string;
  success: boolean;
  top_picks: TopPick[];
  live_signals: LiveSignal[];
}

export default function BullishDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://unnoting-tanya-boilingly.ngrok-free.dev/api/bullish', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const jsonData = await res.json();
      setData(jsonData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="h-screen w-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-emerald-500/30 flex flex-col p-6">
      
      {/* Background Ambience (Green/Emerald) */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* --- HEADER --- */}
      <header className="flex-none mb-6 flex items-end justify-between z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <IconArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-white to-emerald-400 leading-none"
            >
              SPANISH<span className="text-emerald-500">   BULLS</span>
            </motion.h1>
            <div className="text-[10px] font-mono tracking-[0.3em] text-emerald-500/50 uppercase mt-1 pl-1">
              Bullish Intelligence Terminal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
             <div className="text-right flex items-center gap-2 text-emerald-500/40">
                <IconTrendingUp size={16} />
                <span className="text-xs font-mono">{lastUpdated.toLocaleTimeString()}</span>
             </div>
          )}
          <button 
             onClick={fetchData} 
             disabled={loading}
             className="h-8 w-8 flex items-center justify-center bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:border-emerald-500/30 transition-all text-white/50"
          >
             <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* --- MAIN GRID (Flex-1 fills remaining height, no scroll) --- */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 z-10">
        
        {/* --- LEFT: SIGNALS (4 Boxes) --- */}
        <div className="col-span-8 flex flex-col min-h-0 bg-[#080808]/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
           <div className="flex-none mb-4 flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase text-white/60 flex items-center gap-2">
                <IconNews size={16} className="text-emerald-500" /> Live Signals (Top 4)
              </h2>
           </div>

           {/* 2x2 Grid for Signals */}
           <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
              {data ? data.live_signals.slice(0,4).map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {signal.title}
                    </h3>
                    <p className="text-base text-gray-500 leading-relaxed line-clamp-4">
                      {signal.details}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-white/30 truncate max-w-[150px]">
                      {signal.source}
                    </span>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(signal.source + " finance news")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <IconExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              )) : (
                // Skeletons
                [1,2,3,4].map(i => <div key={i} className="bg-white/5 rounded-xl animate-pulse" />)
              )}
           </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="col-span-4 flex flex-col gap-6 min-h-0">
          
          {/* RIGHT TOP: TARGETS */}
          <div className="flex-[0.4] min-h-0 bg-[#080808]/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm flex flex-col">
             <div className="flex-none mb-3">
                <h2 className="text-xs font-mono uppercase text-white/60 flex items-center gap-2">
                  <IconTarget size={16} className="text-emerald-500" /> High Conviction
                </h2>
             </div>
             
             <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                {data ? data.top_picks.slice(0,3).map((pick, i) => (
                  <div key={i} className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-lg px-4 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                     <div>
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-sm font-bold text-white">{pick.name}</span>
                           <span className={`text-[9px] font-black uppercase px-1 rounded ${
                             pick.action.toLowerCase() === 'sell' ? 'bg-red-500 text-black' : 'bg-emerald-500 text-black'
                           }`}>
                             {pick.action}
                           </span>
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                           TP: {pick.price}
                        </div>
                     </div>
                     <div className="text-right max-w-[120px]">
                        <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 text-right">
                           {pick.reason}
                        </p>
                     </div>
                  </div>
                )) : (
                   [1,2,3].map(i => <div key={i} className="flex-1 bg-white/5 rounded-lg animate-pulse" />)
                )}
             </div>
          </div>

          {/* RIGHT BOTTOM: CONTEXT & AI */}
          <div className="flex-[0.6] min-h-0 bg-[#080808]/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm flex flex-col relative overflow-hidden">
             {/* Decorative Background Icon */}
             <IconRocket className="absolute bottom-[-20px] right-[-20px] text-white/[0.02]" size={150} />

             <div className="flex-1 flex flex-col gap-4 z-10">
                
                {/* Sentiment Score/Status */}
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                   <span className="text-2xl font-black text-white tracking-tight uppercase">
                      {data?.sentiment || "LOADING..."}
                   </span>
                </div>

                {/* Market Summary */}
                <div className="flex-1 min-h-0">
                   <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 border-l-2 border-white/10 pl-3">
                      {data?.market_summary || "Analyzing market microstructure..."}
                   </p>
                </div>

                {/* AI Directive Box */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 relative">
                   <div className="absolute top-3 left-3">
                      <IconBrain size={16} className="text-emerald-500" />
                   </div>
                   <p className="text-sm font-medium text-emerald-100/90 italic leading-relaxed pl-6 line-clamp-4">
                      "{data?.llm_advice || "Synthesizing strategic directives..."}"
                   </p>
                </div>

             </div>
          </div>

        </div>

      </div>
    </main>
  )
}