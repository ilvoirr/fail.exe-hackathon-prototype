"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
// Import useRouter for navigation
import { useRouter } from 'next/navigation' 
import { 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconActivity, 
  IconBolt,
  IconTrendingUp,
  IconChartBar,
  IconBell
} from '@tabler/icons-react'

export default function Page() {
  const router = useRouter(); // Initialize the router

  const [traderLottie, setTraderLottie] = useState(null);
  const [bullishLottie, setBullishLottie] = useState(null);
  const [bearLottie, setBearLottie] = useState(null); 
  const [bnbLottie, setBnbLottie] = useState(null); 

  useEffect(() => {
    fetch('/blockchain-technology.json').then((res) => res.json()).then((data) => setTraderLottie(data));
    fetch('/growth-analysis.json').then((res) => res.json()).then((data) => setBullishLottie(data));
    fetch('/email-marketing.json').then((res) => res.json()).then((data) => setBearLottie(data));
    fetch('/bnb-crypto-coin.json').then((res) => res.json()).then((data) => setBnbLottie(data));
  }, []);

  const topStocks = [
    { symbol: "NIFTY 50", price: "21,450", change: "+1.2%", color: "text-green-400" },
    { symbol: "SENSEX", price: "71,820", change: "+0.9%", color: "text-green-400" },
    { symbol: "BANKNIFTY", price: "46,610", change: "-0.4%", color: "text-red-400" },
    { symbol: "RELIANCE", price: "2,750", change: "+2.1%", color: "text-green-400" },
    { symbol: "ADANI ENT", price: "3,100", change: "-1.1%", color: "text-red-400" },
    { symbol: "TATA MTR", price: "812.00", change: "+0.5%", color: "text-green-400" },
  ];

  return (
    <main className="h-[90.5vh] w-full max-w-full p-6 bg-[#1a1a1a] flex flex-col gap-6 overflow-hidden min-w-0 relative">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Top Ticker */}
      <div className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 flex items-center z-10 shrink-0">
        <div className="px-4 border-r border-white/10 mr-4">
          <IconActivity className="text-white/50 w-5 h-5 animate-pulse" />
        </div>
        <div className="overflow-hidden flex-1 mask-linear-fade"> 
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 items-center whitespace-nowrap"
          >
            {[...topStocks, ...topStocks, ...topStocks].map((stock, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-black italic text-white/40 tracking-wider text-sm">{stock.symbol}</span>
                <span className="text-white font-mono text-sm">{stock.price}</span>
                <span className={`text-xs font-bold ${stock.color} bg-white/5 px-1.5 py-0.5 rounded`}>{stock.change}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-6 gap-6 min-h-0 z-10 w-full">
        
        {/* --- LEFT: BEARISH CARD (Page Three) --- */}
        <motion.div 
          onClick={() => router.push('/page-three')}
          whileHover={{ scale: 0.99 }}
          whileTap={{ scale: 0.97 }}
          className="col-span-12 md:col-span-4 row-span-6 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-red-500/50 cursor-pointer"
        >
          <div className=" absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full p-8">
            <div className="flex justify-between items-start">
              <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                <IconArrowDownRight className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-red-500/40 font-mono text-xs">MKKT_SENTIMENT_SHORT</span>
            </div>
            <div className="mt-8">
              <h2 className="text-6xl lg:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/20 group-hover:from-red-400 group-hover:to-red-900 transition-all duration-500">
                BEAR
              </h2>
              <p className="text-red-300/50 font-medium text-sm mt-2">SELLING PRESSURE HIGH</p>
            </div>
            <div className="my-auto relative w-full h-64 lg:h-96 flex items-center justify-center mix-blend-screen">
              {bearLottie ? (
                  <div className="w-full h-full drop-shadow-[0_0_20px_rgba(239,68,68,0.3)] filter contrast-125">
                     <Lottie animationData={bearLottie} loop={true} />
                  </div>
              ) : (
                  <div className="w-24 h-24 border-4 border-red-900 border-t-red-500 rounded-full animate-spin" />
              )}
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT TOP: BULLISH CARD (Page Two) --- */}
        <motion.div 
          onClick={() => router.push('/page-two')}
          whileHover={{ scale: 0.99 }}
          whileTap={{ scale: 0.97 }}
          className="col-span-12 md:col-span-8 row-span-3 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-green-500/50 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-60 transition-opacity duration-700" />
          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white group-hover:text-green-400 transition-colors duration-300">
                  BULLISH
                </h2>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-[10px] font-bold tracking-widest border border-green-500/20 uppercase">
                    Strong Buy
                  </span>
                </div>
              </div>
              <div className="w-32 h-32 md:w-48 md:h-48 relative -mt-4">
                 {bullishLottie ? (
                   <div className="w-full h-full drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                      <Lottie animationData={bullishLottie} loop={true} />
                   </div>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" /></div>
                 )}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 mt-4 items-end h-80">
              {[40, 70, 50, 90, 60, 85].map((h, i) => (
                <div key={i} className="w-full bg-white/5 rounded-t-sm h-full flex items-end overflow-hidden relative">
                  <motion.div 
                    animate={{ height: [`${h}%`, `${h * 0.1}%`] }}
                    transition={{ duration: 1.5 + (i * 0.1), repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="w-full bg-green-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT BOTTOM: TRADER'S DILEMMA (Page Four) --- */}
        <motion.div 
          onClick={() => router.push('/page-four')}
          whileHover={{ scale: 0.99 }}
          whileTap={{ scale: 0.97 }}
          className="col-span-12 md:col-span-4 row-span-3 rounded-[2rem] bg-gradient-to-br from-indigo-950/40 via-[#111] to-blue-900/20 border border-white/5 p-6 flex flex-col relative group overflow-hidden transition-all duration-500 hover:border-blue-400/30 cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700 pointer-events-none" />
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
             <span className="text-[10px] font-mono text-blue-300/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Live_Feed</span>
             <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-400 italic tracking-tighter">TRADER'S DILEMMA</h3>
              <p className="text-blue-400/30 text-xs font-mono mt-1">PSYCHOLOGY_LAYER_01</p>
            </div>
            <div className="flex-1 flex items-center justify-center -my-2 relative">
               {traderLottie ? (
                 <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen grayscale group-hover:grayscale-0 contrast-125">
                   <Lottie animationData={traderLottie} loop={true} />
                 </div>
               ) : (
                 <div className="animate-pulse w-24 h-24 rounded-full bg-blue-500/5 border border-blue-500/10" />
               )}
            </div>
            <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-end">
               <div className="flex gap-1">
                 {[1,2,3].map(i => (
                   <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="w-1 bg-blue-500/40 rounded-full" />
                 ))}
               </div>
               <IconTrendingUp className="text-blue-500/40 w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Card 02: Lightning Actions (Static Navigation) */}
        <div className="col-span-12 md:col-span-4 row-span-3 rounded-[2rem] bg-gradient-to-br from-purple-900/20 to-[#111] border border-white/5 p-6 flex flex-col relative group hover:border-purple-500/30 transition-all overflow-hidden">
          <div className="flex justify-between items-center mb-4 z-20">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:rotate-12 transition-transform">
              <IconBolt size={24} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">FAST TRADE</span>
          </div>
          <div className="flex-1 flex items-center gap-4 relative z-10">
             <div className="flex-1 flex items-center justify-center">
                 <div className="w-34 h-34 group-hover:scale-110 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-purple-600/10 blur-[40px] rounded-full" />
                    {bnbLottie ? (
                        <div className="w-full h-full drop-shadow-[0_0_25px_rgba(168,85,247,0.25)]"><Lottie animationData={bnbLottie} loop={true} /></div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><div className="w-14 h-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" /></div>
                    )}
                 </div>
             </div>
             <div className="flex flex-col gap-3 w-1/2">
                <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-purple-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <IconChartBar size={16} /> Portfolio
                </button>
                <button className="w-full py-3 rounded-xl bg-white/5 text-white font-bold text-xs hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                  <IconBell size={16} /> Alerts
                </button>
             </div>
          </div>
        </div>

      </div>
    </main>
  )
}