'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { CreateProfileForm } from '@/components/CreateProfileForm'
import { StakingOperations } from '@/components/StakingOperations'
import { CreateMarketForm } from '@/components/CreateMarketForm'
import { UpdateProfileForm } from '@/components/UpdateProfileForm'
import { GitHubVerification } from '@/components/GitHubVerification'
import { LenderBorrowerActions } from '@/components/LenderBorrowerActions'

type ActiveTab = 'profile' | 'update-profile' | 'github' | 'staking' | 'market' | 'lending'

export default function Actions() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    // Trigger refresh of all components
    setRefreshKey(prev => prev + 1)
  }

  const tabs = [
    { id: 'profile' as ActiveTab, label: '👤 Create Profile', description: 'Create your developer profile' },
    { id: 'update-profile' as ActiveTab, label: '✏️ Update Profile', description: 'Edit your existing profile' },
    { id: 'github' as ActiveTab, label: '🔗 GitHub Verify', description: 'Verify your GitHub account' },
    { id: 'staking' as ActiveTab, label: '🔒 Staking', description: 'Stake ETH as collateral for loans' },
    { id: 'market' as ActiveTab, label: '💰 Create Market', description: 'Create loan markets for your projects' },
    { id: 'lending' as ActiveTab, label: '💼 Lending & Borrowing', description: 'Manage loans and lending' },
  ]

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
            <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
            <a href="/actions" className="text-cyan-400 font-semibold">Actions</a>
            <a href="/markets" className="text-gray-300 hover:text-white transition-colors">Markets</a>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">⚡ Actions</h1>
            <p className="text-gray-300 text-lg">
              Create profiles, stake collateral, and launch loan markets
            </p>
          </div>

          {isConnected ? (
            <>
              {/* Tab Navigation */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-0 p-4 rounded-lg border transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold mb-1">{tab.label}</div>
                        <div className="text-sm opacity-80">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div key={refreshKey} className="mb-8">
                {activeTab === 'profile' && (
                  <CreateProfileForm onSuccess={handleSuccess} />
                )}
                
                {activeTab === 'update-profile' && (
                  <UpdateProfileForm onSuccess={handleSuccess} />
                )}
                
                {activeTab === 'github' && (
                  <GitHubVerification onSuccess={handleSuccess} />
                )}
                
                {activeTab === 'staking' && (
                  <StakingOperations onSuccess={handleSuccess} />
                )}
                
                {activeTab === 'market' && (
                  <CreateMarketForm onSuccess={handleSuccess} />
                )}
                
                {activeTab === 'lending' && (
                  <LenderBorrowerActions onSuccess={handleSuccess} />
                )}
              </div>

              {/* Phase 2 Progress */}
              <div className="p-6 bg-gray-500/10 border border-gray-400/20 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">🚀 Phase 2 Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.1: Profile Management</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.2: Profile Updates</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.3: GitHub Verification</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.4: Staking Operations</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.5: Market Creation</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">✅ Phase 2.6: Lending & Borrowing</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">⏳ Phase 3: Advanced Features</span>
                    <span className="text-yellow-400">Ready to Start</span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">💡 Getting Started</h4>
                  <p className="text-blue-300 text-sm">
                    Start by creating your developer profile to establish your on-chain identity and trust score.
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">🔒 Collateral Required</h4>
                  <p className="text-green-300 text-sm">
                    Stake at least 1.0 ETH as collateral before creating loan markets. This ensures lender confidence.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">💰 Loan Markets</h4>
                  <p className="text-purple-300 text-sm">
                    Once you have a profile and collateral, create loan markets for your development projects.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Not Connected State */
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-4xl">🔌</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
                  Connect your wallet to start creating profiles, staking collateral, and launching loan markets.
                </p>
              </div>
              
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Create Profile</h3>
                  <p className="text-gray-300 text-sm">
                    Build your on-chain developer identity with GitHub integration and trust scoring.
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">🔒</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Stake Collateral</h3>
                  <p className="text-gray-300 text-sm">
                    Stake ETH as collateral to demonstrate commitment and enable loan creation.
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg border border-white/20">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Launch Markets</h3>
                  <p className="text-gray-300 text-sm">
                    Create loan markets for your projects and get funded by the community.
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
