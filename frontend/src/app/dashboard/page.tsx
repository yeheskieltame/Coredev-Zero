'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WalletInfo } from '@/components/WalletInfo'
import { DeveloperProfileInfo } from '@/components/DeveloperProfileInfo'
import { StakingVaultInfo } from '@/components/StakingVaultInfo'
import { TokenBalanceInfo } from '@/components/TokenBalanceInfo'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <a href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-white text-2xl font-bold">CoreDev Zero</h1>
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="/dashboard" className="text-cyan-400 font-semibold">Dashboard</a>
            <a href="/markets" className="text-gray-300 hover:text-white transition-colors">Markets</a>
          </nav>
          <ConnectButton />
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">📊 Dashboard</h1>
            <p className="text-gray-300 text-lg">
              Monitor your developer profile, staking status, and token balances
            </p>
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Wallet Info */}
            <WalletInfo />
            
            {/* Token Balance */}
            <TokenBalanceInfo />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Developer Profile */}
            <DeveloperProfileInfo />
            
            {/* Staking Vault */}
            <StakingVaultInfo />
          </div>

          {/* Testing Status Section */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">🧪 Testing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Smart Contracts Deployed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Blockchain Connection Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Data Fetching: Testing</span>
              </div>
            </div>
            <p className="text-blue-300 text-sm mt-4">
              💡 <strong>Development Mode:</strong> Connected to Hardhat localhost network. 
              All data is fetched from deployed smart contracts in real-time.
            </p>
          </div>

          {/* Quick Actions Preview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-all duration-300"
              disabled
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-white font-semibold">Create Profile</div>
                <div className="text-gray-300 text-sm">Coming in Phase 2</div>
              </div>
            </button>

            <button 
              className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              disabled
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-white font-semibold">Stake ETH</div>
                <div className="text-gray-300 text-sm">Coming in Phase 2</div>
              </div>
            </button>

            <button 
              className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
              disabled
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-white font-semibold">Create Market</div>
                <div className="text-gray-300 text-sm">Coming in Phase 2</div>
              </div>
            </button>
          </div>

          {/* Development Progress */}
          <div className="mt-8 p-6 bg-gray-500/10 border border-gray-400/20 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">🛠️ Development Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">✅ Phase 1.1: Contract Configuration</span>
                <span className="text-green-400">Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">✅ Phase 1.2: Basic Data Fetching</span>
                <span className="text-green-400">Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">✅ Phase 1.3: Network Integration</span>
                <span className="text-green-400">Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">⏳ Phase 2.1: Profile Management</span>
                <span className="text-gray-500">Ready to Start</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
