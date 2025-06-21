'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'
import { showSuccess, showLoading, updateToast } from '@/lib/contract-utils'
import { createTimestamp, daysAgo } from '@/lib/bigint-utils'

interface StakingOperationsProps {
  onSuccess?: () => void
}

interface StakeInfo {
  totalStake: bigint
  lockedStake: bigint  
  availableStake: bigint
  activeLoans: bigint
  lastLoanEnd: bigint
}

interface MockStakeData {
  totalStake: string
  lockedStake: string
  availableStake: string
  activeLoans: number
  lastLoanEnd: number
  canCreateLoan: boolean
  inGracePeriod: boolean
}

export function StakingOperations({ onSuccess }: StakingOperationsProps) {
  const { address, chain } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [txState, setTxState] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [txError, setTxError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const [mockData, setMockData] = useState<MockStakeData | null>(null)

  const { address: contractAddress, abi } = getContractConfig('StakingVault', chain?.id)
  
  // Network validation - Core DAO Testnet
  const isCorrectNetwork = chain?.id === 1114
  
  // Read comprehensive staking data
  const { 
    data: stakeInfo,
    isLoading: isLoadingStakeInfo,
    error: stakeInfoError,
    refetch: refetchStakeInfo 
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getStakeInfo',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!contractAddress && isCorrectNetwork,
      refetchInterval: 10000, // Auto-refresh every 10 seconds
    },
  })

  const { 
    data: canCreateLoan,
    refetch: refetchCanCreateLoan 
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'canCreateLoan',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!contractAddress && isCorrectNetwork,
    },
  })

  const { 
    data: hash,
    error: writeError,
    isPending,
    writeContract 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Create mock data for development/testing
  const createMockStakeData = (): MockStakeData => {
    const scenarios = [
      // New staker - no stakes
      {
        totalStake: '0',
        lockedStake: '0',
        availableStake: '0',
        activeLoans: 0,
        lastLoanEnd: 0,
        canCreateLoan: false,
        inGracePeriod: false
      },
      // Active staker - has available stakes
      {
        totalStake: '5.5',
        lockedStake: '2.0',
        availableStake: '3.5',
        activeLoans: 2,
        lastLoanEnd: 0,
        canCreateLoan: true,
        inGracePeriod: false
      },
      // All stakes locked
      {
        totalStake: '3.0',
        lockedStake: '3.0',
        availableStake: '0',
        activeLoans: 3,
        lastLoanEnd: 0,
        canCreateLoan: false,
        inGracePeriod: false
      },
      // Grace period after loan completion
      {
        totalStake: '4.0',
        lockedStake: '0',
        availableStake: '4.0',
        activeLoans: 0,
        lastLoanEnd: Number(daysAgo(5)), // 5 days ago using utility function
        canCreateLoan: true,
        inGracePeriod: true
      }
    ]
    
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  }

  // Mock data effect
  useEffect(() => {
    const loadStakeData = async () => {
      try {
        if (stakeInfo && !stakeInfoError) {
          // Real data available
          console.log('Using real staking data from contract')
          setUseMockData(false)
        } else {
          // Use mock data for development
          console.log('Using mock staking data for development')
          const mock = createMockStakeData()
          setMockData(mock)
          setUseMockData(true)
        }
      } catch (err) {
        console.log('Falling back to mock staking data due to error:', err)
        const mock = createMockStakeData()
        setMockData(mock)
        setUseMockData(true)
      }
    }

    loadStakeData()
  }, [stakeInfo, stakeInfoError, isLoadingStakeInfo])

  // Get current stake data (real or mock)
  const getCurrentStakeData = () => {
    try {
      if (useMockData && mockData) {
        return {
          totalStake: parseEther(mockData.totalStake),
          lockedStake: parseEther(mockData.lockedStake),
          availableStake: parseEther(mockData.availableStake),
          activeLoans: BigInt(mockData.activeLoans),
          lastLoanEnd: BigInt(mockData.lastLoanEnd),
          canCreateLoan: mockData.canCreateLoan,
          inGracePeriod: mockData.inGracePeriod
        }
      } else if (stakeInfo) {
        const info = stakeInfo as StakeInfo
        const gracePeriod = 7 * 24 * 60 * 60 // 7 days in seconds
        const currentTime = BigInt(Math.floor(Date.now() / 1000))
        const inGracePeriod = info.lastLoanEnd > 0 && 
          (currentTime < info.lastLoanEnd + BigInt(gracePeriod))
        
        return {
          totalStake: info.totalStake,
          lockedStake: info.lockedStake,
          availableStake: info.availableStake,
          activeLoans: info.activeLoans,
          lastLoanEnd: info.lastLoanEnd,
          canCreateLoan: !!canCreateLoan,
          inGracePeriod
        }
      }
    } catch (error) {
      console.error('Error in getCurrentStakeData:', error)
    }
    
    // Default fallback values
    return {
      totalStake: BigInt(0),
      lockedStake: BigInt(0),
      availableStake: BigInt(0),
      activeLoans: BigInt(0),
      lastLoanEnd: BigInt(0),
      canCreateLoan: false,
      inGracePeriod: false
    }
  }

  const currentData = getCurrentStakeData()

  // Safe formatters with null checks
  const safeFormatEther = (value: bigint | undefined): string => {
    if (value === undefined || value === null) return '0.0000'
    return formatEther(value)
  }

  // Transaction effect management
  useEffect(() => {
    if (isPending) {
      setTxState('pending')
      setTxError(null)
    } else if (isConfirming) {
      setTxState('confirming')
    } else if (isConfirmed) {
      setTxState('success')
      // Refresh data after successful transaction
      refetchStakeInfo()
      refetchCanCreateLoan()
      // Reset form
      setStakeAmount('')
      setUnstakeAmount('')
      onSuccess?.()
      
      // Reset state after a delay
      setTimeout(() => setTxState('idle'), 3000)
    } else if (writeError || receiptError) {
      setTxState('error')
      setTxError(writeError?.message || receiptError?.message || 'Transaction failed')
    }
  }, [isPending, isConfirming, isConfirmed, writeError, receiptError, refetchStakeInfo, refetchCanCreateLoan, onSuccess])

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTxError('Please enter a valid stake amount')
      return
    }

    if (!isCorrectNetwork) {
      setTxError('Please switch to Core DAO Testnet')
      return
    }

    if (useMockData) {
      // Mock transaction for development
      setTxState('pending')
      setTimeout(() => {
        setTxState('confirming')
        setTimeout(() => {
          setTxState('success')
          showSuccess('Mock staking successful! Staked ' + stakeAmount + ' CORE')
          // Update mock data
          if (mockData) {
            const newTotal = (parseFloat(mockData.totalStake) + parseFloat(stakeAmount)).toString()
            const newAvailable = (parseFloat(mockData.availableStake) + parseFloat(stakeAmount)).toString()
            setMockData({
              ...mockData,
              totalStake: newTotal,
              availableStake: newAvailable,
              canCreateLoan: parseFloat(newAvailable) >= 1.0
            })
          }
          setStakeAmount('')
          setTimeout(() => setTxState('idle'), 3000)
        }, 2000)
      }, 1000)
      return
    }

    try {
      const toastId = showLoading('Staking CORE... Please confirm the transaction')
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'stake',
        value: parseEther(stakeAmount),
      })
      
      updateToast(toastId, 'Transaction submitted! Waiting for confirmation...', 'success')
    } catch (err) {
      console.error('Staking error:', err)
      setTxError(err instanceof Error ? err.message : 'Staking failed')
      setTxState('error')
    }
  }

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setTxError('Please enter a valid unstake amount')
      return
    }

    const requestedAmount = parseEther(unstakeAmount)
    if (requestedAmount > currentData.availableStake) {
      setTxError('Insufficient available stake')
      return
    }

    if (!isCorrectNetwork) {
      setTxError('Please switch to Core DAO Testnet')
      return
    }

    if (useMockData) {
      // Mock transaction for development
      setTxState('pending')
      setTimeout(() => {
        setTxState('confirming')
        setTimeout(() => {
          setTxState('success')
          showSuccess('Mock unstaking successful! Unstaked ' + unstakeAmount + ' CORE')
          // Update mock data
          if (mockData) {
            const newTotal = Math.max(0, parseFloat(mockData.totalStake) - parseFloat(unstakeAmount)).toString()
            const newAvailable = Math.max(0, parseFloat(mockData.availableStake) - parseFloat(unstakeAmount)).toString()
            setMockData({
              ...mockData,
              totalStake: newTotal,
              availableStake: newAvailable,
              canCreateLoan: parseFloat(newAvailable) >= 1.0
            })
          }
          setUnstakeAmount('')
          setTimeout(() => setTxState('idle'), 3000)
        }, 2000)
      }, 1000)
      return
    }

    try {
      const toastId = showLoading('Unstaking CORE... Please confirm the transaction')
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'unstake',
        args: [requestedAmount],
      })
      
      updateToast(toastId, 'Transaction submitted! Waiting for confirmation...', 'success')
    } catch (err) {
      console.error('Unstaking error:', err)
      setTxError(err instanceof Error ? err.message : 'Unstaking failed')
      setTxState('error')
    }
  }

  // Network warning component
  if (!isCorrectNetwork) {
    return (
      <div className="bg-red-500/20 backdrop-blur-lg rounded-lg p-6 border border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Wrong Network</h3>
        <p className="text-white mb-4">
          Please switch to <strong>Core DAO Testnet</strong> to use staking features.
        </p>
        <div className="text-sm text-gray-300">
          <p>Expected: Core DAO Testnet (Chain ID: 1114)</p>
          <p>Current: {chain?.name || 'Unknown'} (Chain ID: {chain?.id || 'Unknown'})</p>
        </div>
      </div>
    )
  }

  const maxUnstakeAmount = safeFormatEther(currentData.availableStake)
  const hasActiveLoans = Number(currentData.activeLoans) > 0
  const showSlashingWarning = hasActiveLoans && Number(currentData.lockedStake) > 0

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">🔒 Staking Vault</h3>
        {useMockData && (
          <span className="text-yellow-400 text-sm bg-yellow-400/20 px-2 py-1 rounded">
            🧪 Mock Data
          </span>
        )}
      </div>
      
      {/* Comprehensive Staking Dashboard */}
      <div className="mb-6 space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Total Staked</p>
            <p className="text-white font-bold text-lg">
              {safeFormatEther(currentData.totalStake)} CORE
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Available to Unstake</p>
            <p className="text-green-400 font-bold text-lg">
              {safeFormatEther(currentData.availableStake)} CORE
            </p>
            {currentData.inGracePeriod && (
              <p className="text-yellow-400 text-xs mt-1">⏳ Grace period active</p>
            )}
          </div>
        </div>

        {/* Loan Status */}
        {hasActiveLoans && (
          <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 font-medium">Active Loans</p>
                <p className="text-white text-sm">
                  {Number(currentData.activeLoans)} loans • {safeFormatEther(currentData.lockedStake)} CORE locked
                </p>
              </div>
              <div className="text-orange-400">
                ⚠️
              </div>
            </div>
            {showSlashingWarning && (
              <p className="text-orange-300 text-xs mt-2">
                💡 Locked stakes are at risk of 50% slashing if loans fail
              </p>
            )}
          </div>
        )}

        {/* Loan Creation Status */}
        <div className={`p-3 rounded-lg border ${
          currentData.canCreateLoan 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className={currentData.canCreateLoan ? 'text-green-400' : 'text-red-400'}>
              {currentData.canCreateLoan ? '✅' : '❌'}
            </span>
            <p className={`text-sm ${currentData.canCreateLoan ? 'text-green-400' : 'text-red-400'}`}>
              {currentData.canCreateLoan 
                ? 'Eligible to create new loans (≥1 CORE available)'
                : 'Need at least 1 CORE available stake to create loans'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Error Display */}
      {txState === 'error' && txError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">❌ {txError}</p>
          <button
            onClick={() => {
              setTxState('idle')
              setTxError(null)
            }}
            className="text-red-300 text-xs mt-1 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transaction Success Display */}
      {txState === 'success' && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">✅ Transaction successful!</p>
        </div>
      )}

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
          Stake CORE
        </button>
        <button
          onClick={() => setActiveTab('unstake')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'unstake'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Unstake CORE
        </button>
      </div>

      {/* Stake Tab */}
      {activeTab === 'stake' && (
        <form onSubmit={handleStake} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Stake (CORE)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0000"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={txState === 'pending' || txState === 'confirming'}
              />
              <div className="absolute right-2 top-2 text-gray-400 text-sm">
                CORE
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Minimum: 0.0001 CORE</span>
              <button
                type="button"
                onClick={() => setStakeAmount('1.0')}
                className="text-blue-400 hover:text-blue-300"
              >
                Stake 1 CORE
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
            <p className="text-blue-400 text-sm">
              💡 <strong>Staking Benefits:</strong>
            </p>
            <ul className="text-blue-300 text-xs mt-1 space-y-1">
              <li>• Enable loan creation (1 CORE per loan minimum)</li>
              <li>• Earn reputation through successful loan completion</li>
              <li>• Participate in CoreDev Zero ecosystem</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={
              !stakeAmount || 
              parseFloat(stakeAmount) <= 0 || 
              txState === 'pending' || 
              txState === 'confirming'
            }
            className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
              txState === 'pending' || txState === 'confirming'
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {txState === 'pending' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Preparing Transaction...
              </div>
            ) : txState === 'confirming' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Confirming Transaction...
              </div>
            ) : (
              `Stake ${stakeAmount || '0'} CORE`
            )}
          </button>
        </form>
      )}

      {/* Unstake Tab */}
      {activeTab === 'unstake' && (
        <form onSubmit={handleUnstake} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Unstake (CORE)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0000"
                max={maxUnstakeAmount}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={txState === 'pending' || txState === 'confirming'}
              />
              <div className="absolute right-2 top-2 text-gray-400 text-sm">
                CORE
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Available: {maxUnstakeAmount} CORE</span>
              <button
                type="button"
                onClick={() => setUnstakeAmount(maxUnstakeAmount)}
                className="text-blue-400 hover:text-blue-300"
                disabled={parseFloat(maxUnstakeAmount) === 0}
              >
                Max
              </button>
            </div>
          </div>

          {/* Unstaking Warnings */}
          {currentData.inGracePeriod && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
              <p className="text-yellow-400 text-sm">
                ⏳ <strong>Grace Period Active:</strong>
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                You recently completed a loan. Full unstaking is available after the 7-day grace period.
              </p>
            </div>
          )}

          {showSlashingWarning && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-3">
              <p className="text-orange-400 text-sm">
                ⚠️ <strong>Active Loan Warning:</strong>
              </p>
              <p className="text-orange-300 text-xs mt-1">
                You have {Number(currentData.activeLoans)} active loans. 
                {safeFormatEther(currentData.lockedStake)} CORE is locked and at risk of 50% slashing if loans fail.
              </p>
            </div>
          )}

          {parseFloat(maxUnstakeAmount) === 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
              <p className="text-red-400 text-sm">
                ❌ <strong>No Available Stakes:</strong>
              </p>
              <p className="text-red-300 text-xs mt-1">
                All your stakes are currently locked in active loans or you have no staked CORE.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              !unstakeAmount || 
              parseFloat(unstakeAmount) <= 0 || 
              parseFloat(unstakeAmount) > parseFloat(maxUnstakeAmount) ||
              txState === 'pending' || 
              txState === 'confirming'
            }
            className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
              txState === 'pending' || txState === 'confirming'
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : parseFloat(maxUnstakeAmount) === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {txState === 'pending' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Preparing Transaction...
              </div>
            ) : txState === 'confirming' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Confirming Transaction...
              </div>
            ) : (
              `Unstake ${unstakeAmount || '0'} CORE`
            )}
          </button>
        </form>
      )}

      {/* Debug Information */}
      {useMockData && (
        <div className="mt-6 p-3 bg-gray-800/50 rounded-lg text-xs">
          <p className="text-gray-400 mb-2">🔍 Debug Info:</p>
          <div className="text-gray-500 space-y-1">
            <p>Network: {chain?.name} (ID: {chain?.id})</p>
            <p>Contract: {contractAddress || 'Not found'}</p>
            <p>Mock Data: {useMockData ? 'Active' : 'Disabled'}</p>
            <p>Can Create Loan: {currentData.canCreateLoan ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
