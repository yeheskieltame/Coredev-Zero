'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Header } from '@/components/Header'
import { MarketList } from '@/components/MarketList'

export default function Markets() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <Header />

      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">💰 Loan Markets</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover and fund loan opportunities from talented developers, or browse funded projects to learn from their success.
            </p>
          </div>

          {isConnected ? (
            <>
              {/* Market Statistics */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 border border-white/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">12</div>
                  <div className="text-gray-300 text-sm">Total Markets</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">8</div>
                  <div className="text-gray-300 text-sm">Funded</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">4</div>
                  <div className="text-gray-300 text-sm">Seeking Funding</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">45.2</div>
                  <div className="text-gray-300 text-sm">ETH in Loans</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8 flex flex-wrap gap-4 justify-center">
                <a 
                  href="/actions?tab=market"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  🚀 Create New Market
                </a>
                <a 
                  href="/actions?tab=lending"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  💰 Manage Lending
                </a>
                <a 
                  href="/dashboard"
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  📊 View Dashboard
                </a>
              </div>

              {/* Market List */}
              <MarketList />

              {/* Additional Info */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-3">🎯 For Lenders</h3>
                  <ul className="text-blue-300 space-y-2 text-sm">
                    <li>• Fund promising developer projects</li>
                    <li>• Earn competitive interest rates</li>
                    <li>• Support the developer ecosystem</li>
                    <li>• Diversify your crypto portfolio</li>
                  </ul>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-3">🚀 For Borrowers</h3>
                  <ul className="text-green-300 space-y-2 text-sm">
                    <li>• Access funding for your projects</li>
                    <li>• Build reputation through GitHub verification</li>
                    <li>• Transparent, decentralized lending</li>
                    <li>• Stake collateral to build trust</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Not Connected State */
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-4xl">💰</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Explore Loan Markets</h2>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
                  Connect your wallet to browse loan markets, fund developers, or create your own loan opportunities.
                </p>
              </div>
              
              <div className="flex justify-center mb-12">
                <ConnectButton />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Browse Markets</h3>
                  <p className="text-gray-300 text-sm">
                    Discover loan opportunities from developers building the next generation of apps.
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Fund Projects</h3>
                  <p className="text-gray-300 text-sm">
                    Support talented developers and earn competitive returns on your investment.
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Create Markets</h3>
                  <p className="text-gray-300 text-sm">
                    Need funding for your project? Create a loan market and get funded by the community.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
