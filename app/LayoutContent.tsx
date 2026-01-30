'use client'
import { UserButton, useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useState, useRef, ReactNode } from 'react'
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar"
import {
  IconReceipt,
  IconChartBar,
  IconTable,
  IconMessageCircle,
  IconBook,
  IconTrendingUp,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from 'next/navigation'

const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full"
        >
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
        </svg>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[1.4vw] font-semibold tracking-tight text-white"
      >
        Monitor110
      </motion.span>
    </div>
  )
}

const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full"
        >
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
        </svg>
      </div>
    </div>
  )
}

export function LayoutContent({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const triggerRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const links = [
    {
      label: "page-one",
      href: "/page-one",
      icon: <IconReceipt className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/page-one'),
    },
    {
      label: "page-two",
      href: "/page-two",
      icon: <IconTable className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/page-two'),
    },
    {
      label: "page-three",
      href: "/page-three",
      icon: <IconMessageCircle className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/page-three'),
    },
  ]

  // Don't show layout on landing page or auth pages
  if (!isLoaded || pathname === '/' || pathname?.startsWith('/sign-')) {
    return <>{children}</>
  }

  return (
    <>
      <SignedIn>
        <div className="bg-[#1a1a1a] min-h-screen">
          {/* Fixed Sidebar */}
          <div className="fixed top-0 left-0 h-screen z-30">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className="justify-between gap-10 bg-[#1a1a1a] h-full">
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  <div 
                    className="cursor-pointer py-2"
                    onMouseEnter={() => setSidebarOpen(true)}
                    onMouseLeave={() => setSidebarOpen(false)}
                  >
                    {sidebarOpen ? <Logo /> : <LogoIcon />}
                  </div>
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer">
                        <SidebarLink link={link} />
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
                        <div className="h-7 w-7 shrink-0 rounded-full bg-white text-black flex items-center justify-center text-sm font-semibold">
                          {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                      ),
                    }}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            {/* Top Navbar - Only height of topbar, no extra space below */}
            <div className="sticky top-0 z-20 flex items-center h-[9.5vh] bg-[#1a1a1a] px-8 border-b border-gray-700/50">
              <div className="flex-1" />
           <div
  className={cn(
    "inline-flex w-[30vw] md:w-[7.5vw] items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white md:px-4 md:py-[0.45vw] py-[0.6vh] px-[0.5vw] text-lg font-semibold text-black shadow-sm transition-all duration-150 cursor-pointer",
    "hover:bg-[#ececec] hover:shadow-lg hover:border-gray-400 active:shadow-xl"
  )}
  onClick={() => {
    const btn = triggerRef.current?.querySelector('button');
    btn?.click();
  }}
>
  <span className='md:text-[1.1vw] text-[2vh]'>{user?.username}</span>
  <div ref={triggerRef} className="relative">
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
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

            {/* Content: No extra div, no padding, children start immediately below topbar */}
            <div>
              {children}
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
