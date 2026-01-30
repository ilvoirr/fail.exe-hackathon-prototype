"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { IconArrowUpRight, IconTerminal2 } from "@tabler/icons-react";

// --- Redirect Logic ---
function RedirectToApp({ router }: { router: ReturnType<typeof useRouter> }) {
  useEffect(() => {
    router.push("/page-one");
  }, [router]);
  return null;
}

export default function HomePage() {
  const router = useRouter();

  // Mouse Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xPct = clientX / innerWidth - 0.5;
    const yPct = clientY / innerHeight - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  // Clock
  const [time, setTime] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Force override any global layout scrolling */}
      <style jsx global>{`
        html, body {
          overflow: hidden;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          overscroll-behavior: none;
        }
      `}</style>

      <div 
        onMouseMove={handleMouseMove}
        className="fixed inset-0 h-[100dvh] w-screen bg-[#050505] text-[#e0e0e0] overflow-hidden flex flex-col justify-between selection:bg-white selection:text-black font-sans"
      >
        <SignedIn>
          <RedirectToApp router={router} />
        </SignedIn>

        {/* --- NOISE TEXTURE --- */}
        <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* --- TOP BAR --- */}
        <header className="relative z-20 w-full p-6 flex justify-between items-start text-[10px] md:text-xs font-mono uppercase tracking-widest text-neutral-500 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-white font-bold">110 STOCK MONITOR</span>
            <span>SYS.VER.4.0</span>
          </div>
          <div className="text-right flex flex-col gap-1">
            <span className="text-white">{time}</span>
            <span className="flex items-center justify-end gap-2">
              <span className="animate-pulse w-1.5 h-1.5 bg-green-500 rounded-full"/> ONLINE
            </span>
          </div>
        </header>

        {/* --- CENTER STAGE --- */}
        <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center perspective-1000">
          <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative flex items-center justify-center"
          >
              <h1 className="text-[25vw] leading-none font-black text-neutral-900 absolute blur-sm select-none pointer-events-none transform -translate-z-10 translate-y-4">
                  110
              </h1>
              <h1 className="text-[25vw] leading-none font-black tracking-tighter text-white mix-blend-difference select-none relative z-10">
                  110
              </h1>
              <div className="absolute -right-4 md:-right-12 top-[20%] bg-white text-black text-[0.6rem] md:text-[0.8rem] font-bold px-2 md:px-3 py-1 font-mono uppercase transform translate-z-20 rotate-12 shadow-xl">
                  Beta
              </div>
          </motion.div>
        </main>

        {/* --- BOTTOM CONTROLS --- */}
        <footer className="relative z-20 w-full p-6 flex items-end justify-between shrink-0">
          <div className="hidden md:block text-xs font-mono text-neutral-600 max-w-xs leading-relaxed">
            CAUTION: UNAUTHORIZED ACCESS TO 110 MONITORING SYSTEMS IS STRICTLY PROHIBITED. ALL IP ADDRESSES LOGGED.
          </div>

          <SignedOut>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                  {/* SIGN UP BUTTON */}
                  <SignUpButton mode="modal" forceRedirectUrl="/page-one">
                      <button className="group relative w-full md:w-80 bg-white text-black h-14 flex items-center justify-between px-6 transition-all hover:bg-[#b8b8b8]">
                          <span className="font-bold tracking-tight text-lg">SIGN UP</span>
                          <IconArrowUpRight className="group-hover:rotate-45 transition-transform duration-300" />
                      </button>
                  </SignUpButton>

                  {/* LOG IN / DEMO REVEAL BUTTON */}
                  <SignInButton mode="modal" forceRedirectUrl="/page-one">
                      <button className="group relative w-full md:w-80 h-12 overflow-hidden border border-white/20 text-xs font-mono uppercase tracking-widest bg-transparent hover:border-emerald-500/50 transition-colors">
                          {/* Normal State */}
                          <div className="absolute inset-0 flex items-center justify-between px-6 transition-transform duration-300 ease-in-out group-hover:-translate-y-full text-white/50 group-hover:text-white">
                              <span>EXISTING USER</span>
                              <span>[ LOG IN ]</span>
                          </div>

                          {/* Hover State (Demo Credentials) */}
                          <div className="absolute inset-0 flex items-center justify-between px-6 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0 bg-emerald-950/30 text-emerald-400 font-bold tracking-tight">
                              <span className="flex items-center gap-2"><IconTerminal2 size={14}/> DEMO ID: test</span>
                              <span>DEMO PW: test123</span>
                          </div>
                      </button>
                  </SignInButton>
              </div>
          </SignedOut>
        </footer>
        
        {/* Grid Lines */}
        <div className="absolute top-0 left-1/4 h-full w-[1px] bg-white/5 pointer-events-none" />
        <div className="absolute top-0 right-1/4 h-full w-[1px] bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 pointer-events-none" />
      </div>
    </>
  );
}