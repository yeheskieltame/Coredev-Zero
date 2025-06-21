'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { NFTMarketplace } from '@/components/NFTMarketplace'
import { EventListener } from '@/components/EventListener'
import Link from 'next/link'

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-white text-2xl font-bold">CoreDev Zero</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/actions" className="text-gray-300 hover:text-white transition-colors">Actions</Link>
            <Link href="/markets" className="text-gray-300 hover:text-white transition-colors">Markets</Link>
            <Link href="/marketplace" className="text-cyan-400 font-semibold">Marketplace</Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      {/* Page Content */}
      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🏪 NFT Marketplace</h1>
            <p className="text-gray-300 text-lg">
              Buy and sell Loan Position NFTs • Trade developer debt positions • Earn yields from loan interests
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Marketplace - takes 2 columns */}
            <div className="xl:col-span-2">
              <NFTMarketplace />
            </div>
            
            {/* Side Panel - Events */}
            <div>
              <EventListener />
            </div>
          </div>

          {/* Marketplace Info Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">💡 How NFT Marketplace Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">For Sellers (Lenders)</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• List your Loan Position NFTs for sale</li>
                  <li>• Set competitive prices based on expected returns</li>
                  <li>• Transfer loan collection rights to buyers</li>
                  <li>• Get immediate liquidity from your loans</li>
                </ul>
              </div>
              <div>
                <h4 className="text-green-400 font-semibold mb-2">For Buyers (Investors)</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Browse high-yield loan opportunities</li>
                  <li>• Analyze risk vs return profiles</li>
                  <li>• Collect loan repayments + interest</li>
                  <li>• Build diversified debt portfolio</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-400">⚠️</span>
                <h4 className="text-yellow-400 font-semibold">Investment Risk Notice</h4>
              </div>
              <p className="text-gray-300 text-sm">
                NFT purchases transfer loan collection rights. Borrower default risk applies. 
                Verify developer profiles and loan terms before investing. Past performance doesn&apos;t guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
