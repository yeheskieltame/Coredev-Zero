'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

export function StakingVaultInfo() {
  const { address, isConnected, chain } = useAccount()
  
  const { address: contractAddress, abi } = getContractConfig('StakingVault', chain?.id)
  
  // Read staking data
  const { data: totalStaked, isLoading: loadingStaked } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'stakesOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  })

  const { data: availableStake, isLoading: loadingAvailable } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getAvailableStake',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  })

  const { data: lockedStake, isLoading: loadingLocked } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'lockedStakes',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  })

  const { data: canCreateLoan, isLoading: loadingCanCreate } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'canCreateLoan',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  })

  if (!isConnected || !address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔒 Staking Vault</h3>
        <p className="text-gray-300">Connect wallet to view staking info</p>
      </div>
    )
  }

  const isLoading = loadingStaked || loadingAvailable || loadingLocked || loadingCanCreate

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔒 Staking Vault</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🔒 Staking Vault</h3>
      
      <div className="space-y-4">
        {/* Main Staking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Total Staked</p>
            <p className="text-white font-bold text-xl">
              {totalStaked ? formatEther(totalStaked as bigint) : '0.0000'} ETH
            </p>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Available</p>
            <p className="text-green-400 font-bold text-xl">
              {availableStake ? formatEther(availableStake as bigint) : '0.0000'} ETH
            </p>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Locked</p>
            <p className="text-red-400 font-bold text-xl">
              {lockedStake ? formatEther(lockedStake as bigint) : '0.0000'} ETH
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-gray-300 text-sm">Loan Creation Status</p>
            <p className="text-white font-medium">
              {canCreateLoan ? '✅ Eligible to create loans' : '❌ Not eligible for loans'}
            </p>
          </div>
          <div className={`w-4 h-4 rounded-full ${
            canCreateLoan ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
        </div>

        {/* Progress Bar for Staking Requirement */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Minimum Stake Required</span>
            <span className="text-white">1.0 ETH</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100, 
                  totalStaked ? (Number(formatEther(totalStaked as bigint)) / 1.0) * 100 : 0
                )}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            {totalStaked 
              ? `${((Number(formatEther(totalStaked as bigint)) / 1.0) * 100).toFixed(1)}% of minimum requirement`
              : 'No stake yet'
            }
          </p>
        </div>

        {/* Action Hints */}
        <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Info:</strong> You need to stake at least 1.0 ETH to create loan markets. 
            Staked ETH will be locked during active loans as collateral.
          </p>
        </div>
      </div>
    </div>
  )
}
