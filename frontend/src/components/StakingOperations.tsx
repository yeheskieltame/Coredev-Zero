'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

interface StakingOperationsProps {
  onSuccess?: () => void
}

export function StakingOperations({ onSuccess }: StakingOperationsProps) {
  const { address, chain } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')

  const { address: contractAddress, abi } = getContractConfig('StakingVault', chain?.id)
  
  // Read current staking data
  const { data: totalStaked } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'stakesOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { data: availableStake } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getAvailableStake',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { 
    data: hash,
    error,
    isPending,
    writeContract 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid stake amount')
      return
    }

    try {
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'stake',
        value: parseEther(stakeAmount),
      })
    } catch (err) {
      console.error('Staking error:', err)
    }
  }

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      alert('Please enter a valid unstake amount')
      return
    }

    try {
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'unstake',
        args: [parseEther(unstakeAmount)],
      })
    } catch (err) {
      console.error('Unstaking error:', err)
    }
  }

  // Reset form when transaction is confirmed
  if (isConfirmed) {
    setStakeAmount('')
    setUnstakeAmount('')
    onSuccess?.()
  }

  const maxUnstakeAmount = availableStake ? formatEther(availableStake as bigint) : '0'

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🔒 Staking Operations</h3>
      
      {/* Current Staking Status */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-300">Total Staked:</p>
            <p className="text-white font-bold">
              {totalStaked ? formatEther(totalStaked as bigint) : '0.0000'} ETH
            </p>
          </div>
          <div>
            <p className="text-gray-300">Available to Unstake:</p>
            <p className="text-green-400 font-bold">
              {maxUnstakeAmount} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'stake'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Stake ETH
        </button>
        <button
          onClick={() => setActiveTab('unstake')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'unstake'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Unstake ETH
        </button>
      </div>

      {/* Stake Tab */}
      {activeTab === 'stake' && (
        <form onSubmit={handleStake} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount to Stake (ETH) *
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="1.0"
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 1.0 ETH required to create loan markets
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && 'Preparing Transaction...'}
            {isConfirming && 'Staking ETH...'}
            {!isPending && !isConfirming && `Stake ${stakeAmount || '0'} ETH`}
          </button>

          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Staking Info:</strong> Staked ETH serves as collateral for loan creation. 
              It will be locked during active loans and can be slashed if you default.
            </p>
          </div>
        </form>
      )}

      {/* Unstake Tab */}
      {activeTab === 'unstake' && (
        <form onSubmit={handleUnstake} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount to Unstake (ETH) *
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              max={maxUnstakeAmount}
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder={`Max: ${maxUnstakeAmount}`}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
              disabled={isPending || isConfirming || parseFloat(maxUnstakeAmount) === 0}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">
                Available: {maxUnstakeAmount} ETH
              </p>
              <button
                type="button"
                onClick={() => setUnstakeAmount(maxUnstakeAmount)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
                disabled={parseFloat(maxUnstakeAmount) === 0}
              >
                Max
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isPending || 
              isConfirming || 
              !unstakeAmount || 
              parseFloat(unstakeAmount) <= 0 || 
              parseFloat(unstakeAmount) > parseFloat(maxUnstakeAmount)
            }
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && 'Preparing Transaction...'}
            {isConfirming && 'Unstaking ETH...'}
            {!isPending && !isConfirming && `Unstake ${unstakeAmount || '0'} ETH`}
          </button>

          {parseFloat(maxUnstakeAmount) === 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>No available stake:</strong> All your staked ETH is currently locked 
                in active loans or there is no stake to withdraw.
              </p>
            </div>
          )}
        </form>
      )}

      {/* Transaction Status */}
      {hash && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            📝 Transaction submitted: 
            <span className="text-cyan-400 font-mono text-xs ml-1">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </span>
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
          <p className="text-red-300 text-sm">
            ❌ Transaction failed: {error.message}
          </p>
        </div>
      )}

      {/* Success Message */}
      {isConfirmed && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
          <p className="text-green-300 text-sm">
            ✅ Staking operation completed successfully!
          </p>
        </div>
      )}
    </div>
  )
}
