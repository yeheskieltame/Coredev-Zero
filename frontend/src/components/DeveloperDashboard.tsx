'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

export function DeveloperDashboard() {
  const { address, isConnected, chain } = useAccount()
  const [githubUsername, setGithubUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
  const { writeContract: createProfile, data: createProfileHash } = useWriteContract()
  const { writeContract: stakeEth, data: stakeHash } = useWriteContract()

  // Transaction status hooks
  const { isLoading: isCreatingProfile } = useWaitForTransactionReceipt({
    hash: createProfileHash,
  })

  const { isLoading: isStaking } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  // Handler functions
  const handleCreateProfile = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter your GitHub username')
      return
    }

    setIsLoading(true)
    try {
      await createProfile({
        ...developerProfileConfig,
        functionName: 'createProfile',
        args: [githubUsername, `Portfolio for ${githubUsername}`, 'Software Developer'],
      })
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile')
    } finally {
      setIsLoading(false)
    }
  }

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
    } catch (error) {
      console.error('Error staking ETH:', error)
      alert('Failed to stake ETH')
    } finally {
      setIsLoading(false)
    }
  }

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
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Developer Dashboard</h2>
        <p className="text-gray-300">Manage your developer profile and stake collateral</p>
      </div>

      {/* Profile Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Profile Status</h3>
        
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
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-white">No Profile Found</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  GitHub Username:
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
              </div>
              
              <button
                onClick={handleCreateProfile}
                disabled={isLoading || isCreatingProfile}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
              >
                {isCreatingProfile ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staking Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Staking Status</h3>
        
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
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
            disabled={!profileExists}
          >
            <div className="text-2xl mb-2">📝</div>
            <p className="text-white font-semibold">Create Loan Request</p>
          </button>
          
          <button 
            className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="text-white font-semibold">View Markets</p>
          </button>
          
          <button 
            className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-white font-semibold">NFT Portfolio</p>
          </button>
        </div>
      </div>
    </div>
  )
}
