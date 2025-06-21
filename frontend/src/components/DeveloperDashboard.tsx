'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { IPFSUpload } from './IPFSUpload'
import { PerformanceMonitor } from './PerformanceMonitor'
import { showToast } from '@/lib/contract-utils'
import { CreateProfileForm } from './CreateProfileForm'
import { ChartArea, Upload, User, Coins, TrendingUp, Settings, Activity } from 'lucide-react'

export function DeveloperDashboard() {
  const { address, isConnected, chain } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ipfs' | 'performance' | 'settings'>('overview')

  // Get contract configs
  const developerProfileConfig = getContractConfig('DeveloperProfile', chain?.id)
  const stakingVaultConfig = getContractConfig('StakingVault', chain?.id)

  // Contract read hooks
  const { data: profileExists } = useReadContract({
    ...developerProfileConfig,
    functionName: 'profileExists',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  const { data: profile } = useReadContract({
    ...developerProfileConfig,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!profileExists },
  })

  const { data: trustScore } = useReadContract({
    ...developerProfileConfig,
    functionName: 'getTrustScore',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!profileExists },
  })

  const { data: stakedAmount } = useReadContract({
    ...stakingVaultConfig,
    functionName: 'getStakedAmount',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  // Contract write hooks
  const { writeContract: stakeEth, data: stakeHash } = useWriteContract()

  // Transaction status hooks
  const { isLoading: isStaking } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  // Handler functions

  const handleStakeEth = async () => {
    const amount = prompt('Enter amount of ETH to stake:')
    if (!amount || isNaN(Number(amount))) return

    setIsLoading(true)
    try {
      await stakeEth({
        ...stakingVaultConfig,
        functionName: 'stake',
        value: parseEther(amount),
      })
      showToast('success', `Staking ${amount} ETH transaction submitted!`)
    } catch (error) {
      console.error('Error staking ETH:', error)
      showToast('error', 'Failed to stake ETH')
    } finally {
      setIsLoading(false)
    }
  }

  // Use effect for transaction receipts
  useEffect(() => {
    if (stakeHash) {
      showToast('info', 'Staking ETH... Please wait for confirmation.')
    }
  }, [stakeHash])

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Developer Dashboard</h2>
        <p className="text-gray-300 mb-6">Please connect your wallet to access the dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex flex-col space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Developer Dashboard</h2>
            <p className="text-gray-300">Comprehensive platform for developers and lenders</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'analytics', label: 'Analytics', icon: ChartArea },
              { id: 'ipfs', label: 'File Manager', icon: Upload },
              { id: 'performance', label: 'Performance', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Profile Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Status</span>
            </h3>
            
            {profileExists ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white">Profile Created</span>
                </div>
                
                {profile && Array.isArray(profile) && profile.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-300 text-sm">GitHub Username:</p>
                      <p className="text-white">{String(profile[0])}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Specialty:</p>
                      <p className="text-white">{String(profile[2])}</p>
                    </div>
                  </div>
                ) : null}
                
                {trustScore !== undefined && (
                  <div>
                    <p className="text-gray-300 text-sm">Trust Score:</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(Number(trustScore) / 1000 * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-white">{Number(trustScore)}/1000</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <CreateProfileForm 
                onSuccess={() => {
                  showToast('success', 'Profile created successfully!')
                  // The profile data will be automatically refetched
                }}
              />
            )}
          </div>

          {/* Staking Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span>Staking Status</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 text-sm">Staked Amount:</p>
                <p className="text-white text-xl font-bold">
                  {stakedAmount && typeof stakedAmount === 'bigint' ? `${formatEther(stakedAmount)} ETH` : '0.0000 ETH'}
                </p>
              </div>
              
              <button
                onClick={handleStakeEth}
                disabled={isLoading || isStaking}
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50"
              >
                {isStaking ? 'Staking...' : 'Stake ETH'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Actions</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                disabled={!profileExists}
                onClick={() => window.location.href = '/actions'}
              >
                <div className="text-2xl mb-2">📝</div>
                <p className="text-white font-semibold">Create Loan Request</p>
              </button>
              
              <button 
                className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                onClick={() => window.location.href = '/markets'}
              >
                <div className="text-2xl mb-2">📊</div>
                <p className="text-white font-semibold">View Markets</p>
              </button>
              
              <button 
                className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                onClick={() => window.location.href = '/marketplace'}
              >
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-white font-semibold">NFT Portfolio</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <AnalyticsDashboard />
        </div>
      )}

      {/* IPFS Tab */}
      {activeTab === 'ipfs' && (
        <div>
          <IPFSUpload />
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          <PerformanceMonitor />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </h3>
          
          <div className="space-y-6">
            {/* Notification Settings */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
                  <span className="text-gray-300">Email notifications for loan updates</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
                  <span className="text-gray-300">Push notifications for marketplace activities</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                  <span className="text-gray-300">Weekly analytics reports</span>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Privacy Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
                  <span className="text-gray-300">Make profile public</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                  <span className="text-gray-300">Show transaction history</span>
                </label>
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Advanced</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-300 text-sm mb-2">Gas Price Preference:</p>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="fast">Fast (Higher cost)</option>
                    <option value="standard" selected>Standard</option>
                    <option value="slow">Economy (Lower cost)</option>
                  </select>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-2">Default Network:</p>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="1116">Core DAO Testnet</option>
                    <option value="1115">Core DAO Mainnet</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
