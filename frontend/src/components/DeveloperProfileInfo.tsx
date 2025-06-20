'use client'

import { useAccount, useReadContract } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'

interface DeveloperProfileData {
  githubHandle: string
  profileDataCID: string
  trustScore: bigint
  completedProjects: bigint
  successfulLoans: bigint
  defaultedLoans: bigint
  totalBorrowed: bigint
  totalRepaid: bigint
  isVerified: boolean
  isActive: boolean
  verificationTimestamp: bigint
  lastActivityTimestamp: bigint
}

export function DeveloperProfileInfo() {
  const { address, isConnected, chain } = useAccount()
  
  const { address: contractAddress, abi } = getContractConfig('DeveloperProfile', chain?.id)
  
  // Read developer profile data
  const { 
    data: profileData, 
    isError, 
    isLoading, 
    error 
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getDeveloperProfile',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  }) as {
    data: DeveloperProfileData | undefined
    isError: boolean
    isLoading: boolean
    error: Error | null
  }

  if (!isConnected || !address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">👤 Developer Profile</h3>
        <p className="text-gray-300">Connect wallet to view profile</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">👤 Developer Profile</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError || !profileData) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">👤 Developer Profile</h3>
        <div className="text-red-400">
          <p>❌ Error loading profile data</p>
          {error && <p className="text-sm mt-2">Error: {error.message}</p>}
          <p className="text-sm mt-2 text-gray-400">
            Make sure you have a profile created or the contract is deployed correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">👤 Developer Profile</h3>
      
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300 text-sm">GitHub Handle:</p>
            <p className="text-white font-mono">
              {profileData.githubHandle || 'Not set'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-300 text-sm">Trust Score:</p>
            <p className="text-white font-bold text-lg">
              {profileData.trustScore.toString()}/1000
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-block w-3 h-3 rounded-full mr-2 ${
              profileData.isVerified ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-gray-300">
              {profileData.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          
          <div className="text-center">
            <div className={`inline-block w-3 h-3 rounded-full mr-2 ${
              profileData.isActive ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-300">
              {profileData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-gray-300 text-xs">Completed Projects</p>
            <p className="text-white font-bold">
              {profileData.completedProjects.toString()}
            </p>
          </div>
          
          <div>
            <p className="text-gray-300 text-xs">Successful Loans</p>
            <p className="text-white font-bold">
              {profileData.successfulLoans.toString()}
            </p>
          </div>
          
          <div>
            <p className="text-gray-300 text-xs">Defaulted Loans</p>
            <p className="text-white font-bold text-red-400">
              {profileData.defaultedLoans.toString()}
            </p>
          </div>
          
          <div>
            <p className="text-gray-300 text-xs">Total Borrowed</p>
            <p className="text-white font-bold">
              {(Number(profileData.totalBorrowed) / 1e6).toFixed(2)} USDT
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <p className="text-gray-300">Verification Date:</p>
            <p className="text-white">
              {profileData.verificationTimestamp > 0 
                ? new Date(Number(profileData.verificationTimestamp) * 1000).toLocaleDateString()
                : 'Not verified'
              }
            </p>
          </div>
          
          <div>
            <p className="text-gray-300">Last Activity:</p>
            <p className="text-white">
              {profileData.lastActivityTimestamp > 0
                ? new Date(Number(profileData.lastActivityTimestamp) * 1000).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
