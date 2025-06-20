'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { WalletInfo } from '@/components/WalletInfo'
import { DeveloperDashboard } from '@/components/DeveloperDashboard'

export default function Dashboard() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-white text-2xl font-bold">CoreDev Zero</h1>
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {isConnected ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Dashboard */}
              <div className="lg:col-span-2">
                <DeveloperDashboard />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <WalletInfo />
                
                {/* Network Status */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Network Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">Contracts Deployed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">Oracle Services Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-white text-sm">Testnet Mode</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Platform Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Markets:</span>
                      <span className="text-white">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Loans:</span>
                      <span className="text-white">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Volume:</span>
                      <span className="text-white">45.2 ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Not Connected State
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">🔗</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-8">
                  Connect your wallet to access the developer dashboard and start building your lending profile.
                </p>
                <ConnectButton />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
