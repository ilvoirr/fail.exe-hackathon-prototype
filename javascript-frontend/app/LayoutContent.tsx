'use client'
import { UserButton, useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useState, useRef, ReactNode, useEffect } from 'react'
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { IconDeviceDesktopOff } from '@tabler/icons-react' 

// --- ANIMATION IMPORTS ---
import mobilePaymentData from "@/public/mobile-payment.json" 
import addToCartData from "@/public/add-to-cart.json"
import addData from "@/public/add.json"
import announcementData from "@/public/announcement.json"

// --- INTERNAL HELPER COMPONENT ---
const LottieIcon = ({ isHovered, animationData }: { isHovered: boolean, animationData: any }) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (isHovered) {
      lottieRef.current?.play()
    } else {
      lottieRef.current?.stop()
    }
  }, [isHovered])

  return (
    // FIX: 
    // 1. Removed 'opacity-80' (no longer translucent).
    // 2. Added 'brightness-150 contrast-200' to force the inverted colors to look much whiter/brighter.
    <div className="h-8 w-8 shrink-0 invert brightness-150 contrast-200">
      <Lottie 
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={false}
      />
    </div>
  )
}

const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[5vh] h-[5vh] md:w-[4vh] md:h-[4vh] flex items-center justify-center shrink-0">
        <Image 
          src="/chart-candlestick.svg" 
          alt="StockMonitor Logo" 
          width={48} 
          height={48}
          className="w-full h-full brightness-0 invert"
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[1.4vw] font-semibold tracking-tight text-white"
      >
        StockMonitor
      </motion.span>
    </div>
  )
}

const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[5vh] h-[5vh] md:w-[4vh] md:h-[4vh] flex items-center justify-center shrink-0">
        <Image 
          src="/chart-candlestick.svg" 
          alt="StockMonitor Logo" 
          width={48} 
          height={48}
          className="w-full h-full brightness-0 invert"
        />
      </div>
    </div>
  )
}

// --- MOBILE RESTRICTION SCREEN ---
const MobileRestrictedScreen = () => (
  <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-8 text-center border-t-4 border-red-600">
    <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
      <div className="relative z-10 bg-red-950/50 p-6 rounded-full border border-red-500/50 text-red-500">
         <IconDeviceDesktopOff size={48} />
      </div>
    </div>
    <h1 className="text-3xl font-black italic text-white tracking-tighter mb-2">
      DESKTOP <span className="text-red-600">ONLY</span>
    </h1>
    <p className="text-white/40 font-mono text-sm max-w-xs">
      ERROR_CODE: MOBILE_DEVICE_DETECTED
      <br/>
      This trading terminal requires a larger display surface for data visualization.
    </p>
    <div className="mt-12 h-1 w-24 bg-red-900/30 overflow-hidden rounded-full">
      <div className="h-full bg-red-600 w-full animate-[shimmer_2s_infinite_linear] -translate-x-full" />
    </div>
  </div>
)

export function LayoutContent({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const triggerRef = useRef<HTMLDivElement>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // LOGIC: Only show dashboard layout on /page-one
  const isDashboardPage = pathname === '/page-one';

  const linksData = [
    { label: "Finance Dashboard", href: "/page-one", onClick: () => router.push('/page-one'), animationData: mobilePaymentData },
    { label: "Bullish Sentiments", href: "/page-two", onClick: () => router.push('/page-two'), animationData: addData },
    { label: "Bearish Sells", href: "/page-three", onClick: () => router.push('/page-three'), animationData: addToCartData },
    { label: "Trader's Dillemma", href: "/page-four", onClick: () => router.push('/page-four'), animationData: announcementData },
  ]

  if (!isLoaded) return null;

  return (
    <>
      <div className="block md:hidden">
        <MobileRestrictedScreen />
      </div>

      <div className="hidden md:block">
        {isDashboardPage ? (
          <SignedIn>
            <div className="bg-black min-h-screen">
              <div className="fixed top-0 left-0 h-screen z-30 border-r border-white/5">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                  <SidebarBody className="justify-between gap-10 bg-black h-full pl-4">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                      <div 
                        className="cursor-pointer py-2"
                        onMouseEnter={() => setSidebarOpen(true)}
                        onMouseLeave={() => setSidebarOpen(false)}
                      >
                        {sidebarOpen ? <Logo /> : <LogoIcon />}
                      </div>
                      <div className="mt-8 flex flex-col gap-2">
                        {linksData.map((link, idx) => (
                          <div 
                            key={idx} 
                            onClick={link.onClick} 
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredIdx(idx)} 
                            onMouseLeave={() => setHoveredIdx(null)}
                          >
                            <SidebarLink 
                              link={{
                                label: link.label,
                                href: link.href,
                                icon: <LottieIcon isHovered={hoveredIdx === idx} animationData={link.animationData} />
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <SidebarLink
                        link={{
                          label: user?.username || 'User',
                          href: "#",
                          icon: (
                            <div className="h-7 w-7 shrink-0 rounded-full bg-white/10 text-white border border-white/10 flex items-center justify-center text-sm font-semibold">
                              {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                            </div>
                          ),
                        }}
                      />
                    </div>
                  </SidebarBody>
                </Sidebar>
              </div>

              <div className={cn(
                "transition-all duration-300 ease-in-out",
                sidebarOpen ? "ml-72 w-[calc(100vw-18rem)]" : "ml-20 w-[calc(100vw-5rem)]"
              )}>
                <div className="sticky top-0 z-20 flex items-center h-[9.5vh] bg-[#1a1a1a] border-b border-white/5 px-8">
                  <div className="flex-1" />
                  <div
                    className={cn(
                      "inline-flex w-[30vw] md:w-[7.5vw] items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 md:px-4 md:py-[0.45vw] py-[0.6vh] px-[0.5vw] text-lg font-semibold text-white shadow-sm transition-all duration-150 cursor-pointer",
                      "hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
                    )}
                    onClick={() => {
                      const btn = triggerRef.current?.querySelector('button');
                      btn?.click();
                    }}
                  >
                    <span className='md:text-[1.1vw] text-[2vh]'>
                      {user?.username || "Trader"}
                    </span>
                    <div ref={triggerRef} className="relative">
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            userButtonAvatarBox: "w-[2.5vh] h-[2.5vh]",
                            userButtonPopoverCard: {
                              transform: 'translateY(3.5vh)',
                              '@media (max-width: 768px)': {
                                transform: 'translateY(3.5vh) translateX(4vw)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a]">
                  {children}
                </div>
              </div>
            </div>
          </SignedIn>
        ) : (
          <div className="min-h-screen bg-black text-white">
             {children}
          </div>
        )}
         <SignedOut>
            {children} 
         </SignedOut>
      </div>
    </>
  )
}