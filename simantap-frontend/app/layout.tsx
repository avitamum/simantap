// simantap-frontend/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SIMANTAP - AI-Driven Occupational Safety',
  description: 'Sistem Manajemen Tata Kelola Proteksi berbasis Computer Vision',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              © 2025 SIMANTAP - Politeknik Statistika STIS
            </p>
            <p className="text-xs text-gray-400 mt-2">
              AI-Driven Occupational Safety Intelligence System
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}