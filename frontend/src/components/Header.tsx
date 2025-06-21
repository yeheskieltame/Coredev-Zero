'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { NotificationCenter } from './NotificationCenter'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/actions', label: 'Actions' },
  { href: '/markets', label: 'Markets' },
  { href: '/marketplace', label: 'NFT Marketplace' },
]

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-lg border-b border-white/10">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-white text-2xl font-bold">CoreDev Zero</h1>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          <ConnectButton />
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-cyan-400 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg border-b border-white/10">
          <nav className="px-6 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
