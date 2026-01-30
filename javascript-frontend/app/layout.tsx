import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { LayoutContent } from './LayoutContent' 

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'StockMonitor',
  description: 'High Frequency Trading Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
        </head>
        {/* Changed bg-white to bg-black to match the dark theme */}
        <body className={`${inter.className} min-h-screen bg-black text-white`}>
          <LayoutContent>{children}</LayoutContent>
        </body>
      </html>
    </ClerkProvider>
  )
}