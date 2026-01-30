"use client"



import React from 'react'

import { motion } from 'framer-motion'

import { 

  IconArrowUpRight, 

  IconArrowDownRight, 

  IconActivity, 

  IconBolt,

  IconTrendingUp,

  IconChartBar

} from '@tabler/icons-react'



// --- SVGs for Graphic Structures ---

// These are custom "out of this world" abstract shapes



const BullGraphic = () => (

  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">

    {/* Abstract Horns / Power Structure */}

    <motion.path 

      d="M40,120 Q60,20 100,60 T160,120"

      fill="none"

      stroke="currentColor"

      strokeWidth="12"

      strokeLinecap="round"

      className="text-green-400"

      initial={{ pathLength: 0, opacity: 0 }}

      animate={{ pathLength: 1, opacity: 1 }}

      transition={{ duration: 1.5, ease: "easeOut" }}

    />

    {/* Dynamic Eye */}

    <motion.circle 

      cx="100" cy="140" r="15" 

      className="fill-green-300"

      animate={{ scale: [1, 1.2, 1] }}

      transition={{ duration: 3, repeat: Infinity }}

    />

    <path d="M70,140 L130,140" stroke="currentColor" strokeWidth="4" className="text-green-900/50" />

  </svg>

)



const BearGraphic = () => (

  <svg viewBox="0 0 200 200" className="w-full h-full">

    {/* Abstract Claws / Downward Force */}

    <motion.path 

      d="M40,60 L100,140 L160,60"

      fill="none"

      stroke="currentColor"

      strokeWidth="12"

      strokeLinecap="round"

      className="text-red-500"

      initial={{ pathLength: 0 }}

      animate={{ pathLength: 1 }}

      transition={{ duration: 1.5, delay: 0.5 }}

    />

     <motion.rect 

      x="85" y="40" width="30" height="100" 

      className="fill-red-900/40"

      animate={{ height: [100, 20, 100] }}

      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

    />

  </svg>

)



export default function Page() {

  const topStocks = [

    { symbol: "NIFTY 50", price: "21,450", change: "+1.2%", color: "text-green-400" },

    { symbol: "SENSEX", price: "71,820", change: "+0.9%", color: "text-green-400" },

    { symbol: "BANKNIFTY", price: "46,610", change: "-0.4%", color: "text-red-400" },

    { symbol: "RELIANCE", price: "2,750", change: "+2.1%", color: "text-green-400" },

    { symbol: "ADANI ENT", price: "3,100", change: "-1.1%", color: "text-red-400" },

    { symbol: "TATA MTR", price: "812.00", change: "+0.5%", color: "text-green-400" },

  ];



  return (

    // FIX: min-w-0 ensures the grid shrinks when sidebar expands instead of hiding content

    <main className="h-[90.5vh] w-full p-6 bg-[#1a1a1a] flex flex-col gap-6 overflow-hidden min-w-0 relative">

      

      {/* Background Noise Texture for that premium feel */}

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"

           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 

      />



      {/* Top Ticker - Constant Motion */}

      <div className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 flex items-center z-10 shrink-0">

         <div className="px-4 border-r border-white/10 mr-4">

            <IconActivity className="text-white/50 w-5 h-5 animate-pulse" />

         </div>

         <div className="overflow-hidden flex-1 mask-linear-fade"> 

            {/* mask-linear-fade needs CSS or just simple overflow */}

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



      {/* Main Grid Area - Adaptive Layout */}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-6 gap-6 min-h-0 z-10">

        

        {/* --- LEFT: BEARISH CARD (Shorting/Vertical) --- */}

        <motion.div 

          whileHover={{ scale: 0.99 }}

          className="col-span-12 md:col-span-4 row-span-6 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)]"

        >

          {/* Animated Background Gradient */}

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



            {/* Dynamic Bear Graphic */}

            <div className="mt-auto relative w-full h-48 lg:h-64 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">

                <BearGraphic />

                

                {/* Glitch Overlay on Hover */}

                <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay opacity-0 group-hover:animate-pulse" />

            </div>

          </div>

        </motion.div>



        {/* --- RIGHT TOP: BULLISH CARD (Horizontal Focus) --- */}

        <motion.div 

          whileHover={{ scale: 0.99 }}

          className="col-span-12 md:col-span-8 row-span-3 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-green-500/50 hover:shadow-[0_0_60px_-15px_rgba(34,197,94,0.3)]"

        >

          {/* Radial Glow on Hover */}

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

              

              {/* Interactive Bull Graphic */}

              <div className="w-32 h-32 md:w-40 md:h-40 text-green-500/20 group-hover:text-green-400 group-hover:drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-500">

                 <BullGraphic />

              </div>

            </div>



            {/* Momentum Bars */}

            <div className="grid grid-cols-6 gap-2 mt-4 items-end h-12">

               {[40, 70, 50, 90, 60, 85].map((h, i) => (

                   <div key={i} className="w-full bg-white/5 rounded-t-sm h-full flex items-end overflow-hidden">

                       <motion.div 

                         initial={{ height: "0%" }}

                         whileInView={{ height: `${h}%` }}

                         className="w-full bg-green-500"

                         // On hover, bars get "excited"

                         variants={{

                            hover: { height: ["40%", "90%", "60%"], transition: { repeat: Infinity, duration: 0.5 + (i * 0.1) } }

                         }}

                       />

                   </div>

               ))}

            </div>

          </div>

        </motion.div>



        {/* --- RIGHT BOTTOM: FUNCTIONAL CARDS --- */}

        

        {/* Card 01: Top Gainers */}

        <div className="col-span-12 md:col-span-4 row-span-3 rounded-[2rem] bg-[#111] border border-white/5 p-6 flex flex-col relative group hover:bg-[#161616] transition-colors">

           <div className="flex justify-between items-center mb-6">

              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">

                 <IconTrendingUp size={24} />

              </div>

              <IconArrowUpRight className="text-white/20 group-hover:text-white transition-colors" />

           </div>

           

           <div className="space-y-4">

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">

                 <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">B</div>

                    <span className="font-bold text-white text-sm">Bitcoin</span>

                 </div>

                 <span className="text-green-400 text-sm font-mono">+5.2%</span>

              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">

                 <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">E</div>

                    <span className="font-bold text-white text-sm">Ethereum</span>

                 </div>

                 <span className="text-green-400 text-sm font-mono">+2.1%</span>

              </div>

           </div>

        </div>



        {/* Card 02: Lightning Actions */}

        <div className="col-span-12 md:col-span-4 row-span-3 rounded-[2rem] bg-gradient-to-br from-purple-900/20 to-[#111] border border-white/5 p-6 flex flex-col relative group hover:border-purple-500/30 transition-all">

           <div className="flex justify-between items-center mb-4">

              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:rotate-12 transition-transform">

                 <IconBolt size={24} fill="currentColor" />

              </div>

              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">FAST TRADE</span>

           </div>



           <div className="flex-1 flex flex-col justify-end gap-3">

               <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-purple-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">

                  <IconChartBar size={16} />

                  Analyze Portfolio

               </button>

               <button className="w-full py-3 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 border border-white/10 transition-all">

                  Set Alerts

               </button>

           </div>

        </div>



      </div>

    </main>

  )

}