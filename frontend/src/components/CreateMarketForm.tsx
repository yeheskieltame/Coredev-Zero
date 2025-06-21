'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

// Type definition for Profile struct from smart contract
interface Profile {
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

interface CreateMarketFormProps {
  onSuccess?: () => void
}

export function CreateMarketForm({ onSuccess }: CreateMarketFormProps) {
  const { address, chain, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    tenorDays: '',
    projectTitle: '',
    projectDescription: '',
    fundingPurpose: ''
  })
  const [requirements, setRequirements] = useState({
    hasProfile: false,
    hasStaking: false,
    canCreateLoan: false,
    loading: true
  })

  const { address: contractAddress, abi } = getContractConfig('MarketFactory', chain?.id)
  
  // Check user's profile
  const { address: profileAddress, abi: profileAbi } = getContractConfig('DeveloperProfile', chain?.id)
  const { data: profileData } = useReadContract({
    address: profileAddress,
    abi: profileAbi,
    functionName: 'getDeveloperProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!profileAddress,
    },
  })

  // Check staking status
  const { address: stakingAddress, abi: stakingAbi } = getContractConfig('StakingVault', chain?.id)
  const { data: stakeInfo } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingAddress,
    },
  })
  
  // Check if user can create loan
  const { data: canCreateLoan } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: 'canCreateLoan',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingAddress,
    },
  })

  // Update requirements status
  useEffect(() => {
    const profile = profileData as Profile | undefined
    const hasProfile = profile && profile.githubHandle && profile.githubHandle.length > 0
    const hasStaking = stakeInfo && Array.isArray(stakeInfo) && stakeInfo[0] && Number(stakeInfo[0]) >= 1000000000000000000 // >= 1 ETH in wei
    
    setRequirements({
      hasProfile: !!hasProfile,
      hasStaking: !!hasStaking,
      canCreateLoan: !!canCreateLoan,
      loading: false
    })
  }, [profileData, stakeInfo, canCreateLoan])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!requirements.canCreateLoan) {
      alert('You need to meet all requirements to create markets. Please check the requirements section below.')
      return
    }

    if (!formData.loanAmount || !formData.interestRate || !formData.tenorDays || !formData.projectTitle) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Create mock IPFS CID for project data
      const projectData = {
        title: formData.projectTitle,
        description: formData.projectDescription,
        fundingPurpose: formData.fundingPurpose,
        timeline: `${formData.tenorDays} days`,
        created: Date.now()
      }
      
      // In production, this would upload to IPFS
      const mockProjectCID = `QmProject${Date.now()}`
      
      const loanAmountWei = parseUnits(formData.loanAmount, 6) // USDT has 6 decimals
      const interestRateBps = Math.round(parseFloat(formData.interestRate) * 100) // Convert % to basis points
      const tenorSeconds = parseInt(formData.tenorDays) * 24 * 60 * 60 // Convert days to seconds
      
      console.log('Creating market with params:', {
        loanAmountWei: loanAmountWei.toString(),
        interestRateBps,
        tenorSeconds,
        mockProjectCID
      })
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'createMarket',
        args: [
          loanAmountWei,
          interestRateBps,
          tenorSeconds,
          mockProjectCID
        ],
      })
    } catch (err) {
      console.error('Market creation error:', err)
    }
  }

  // Reset form when transaction is confirmed
  if (isConfirmed) {
    setFormData({
      loanAmount: '',
      interestRate: '',
      tenorDays: '',
      projectTitle: '',
      projectDescription: '',
      fundingPurpose: ''
    })
    onSuccess?.()
  }

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">Please connect your wallet to create loan markets.</p>
        </div>
      </div>
    )
  }

  if (requirements.loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking requirements...</p>
        </div>
      </div>
    )
  }

  // Show requirements if not all met
  if (!requirements.canCreateLoan) {
    const profile = profileData as Profile | undefined
    const stakeAmount = stakeInfo && Array.isArray(stakeInfo) ? formatEther(stakeInfo[0] || BigInt(0)) : '0'
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        
        <div className="p-6 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚠️</div>
            <h4 className="text-lg font-semibold text-yellow-300 mb-2">Prerequisites Required</h4>
            <p className="text-yellow-200 mb-4">
              Complete all requirements below to create loan markets:
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {isConnected ? '✓' : '○'}
              </div>
              <span className={isConnected ? 'text-green-300' : 'text-gray-300'}>
                Wallet Connected
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.hasProfile ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.hasProfile ? '✓' : '✗'}
              </div>
              <span className={requirements.hasProfile ? 'text-green-300' : 'text-red-300'}>
                Developer Profile Created
                {profile && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({profile.githubHandle})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.hasStaking ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.hasStaking ? '✓' : '✗'}
              </div>
              <span className={requirements.hasStaking ? 'text-green-300' : 'text-red-300'}>
                Minimum 1.0 tCORE Staked
                <span className="text-xs text-gray-400 ml-2">
                  (Current: {stakeAmount} tCORE)
                </span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.canCreateLoan ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.canCreateLoan ? '✓' : '✗'}
              </div>
              <span className={requirements.canCreateLoan ? 'text-green-300' : 'text-red-300'}>
                Available Stake for Loan Creation
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-yellow-300 mb-4">
              Complete the missing requirements using the other tabs in Actions page.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {!requirements.hasProfile && (
                <button
                  onClick={() => window.location.href = '/actions?tab=profile'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Create Profile
                </button>
              )}
              {!requirements.hasStaking && (
                <button
                  onClick={() => window.location.href = '/actions?tab=staking'}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  Stake tCORE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
      
      {/* Requirements Status Badge */}
      <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            ✓
          </div>
          <span className="text-green-300 font-semibold">All Requirements Met</span>
        </div>
        <p className="text-green-200 text-sm">
          You can create loan markets. Your stake will be locked until loan completion.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
            Loan Terms
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Loan Amount (USDT) *
              </label>
              <input
                type="number"
                step="0.01"
                min="100"
                max="50000"
                value={formData.loanAmount}
                onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                placeholder="1000"
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
                disabled={isPending || isConfirming}
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Interest Rate (% APR) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={formData.interestRate}
                onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                placeholder="12.5"
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
                disabled={isPending || isConfirming}
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Loan Duration (Days) *
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={formData.tenorDays}
                onChange={(e) => setFormData({...formData, tenorDays: e.target.value})}
                placeholder="90"
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
                disabled={isPending || isConfirming}
              />
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
            Project Information
          </h4>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
              placeholder="My Awesome DeFi Project"
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              required
              disabled={isPending || isConfirming}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Project Description
            </label>
            <textarea
              value={formData.projectDescription}
              onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
              placeholder="Describe your project, technology stack, and goals..."
              rows={4}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              disabled={isPending || isConfirming}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Funding Purpose
            </label>
            <textarea
              value={formData.fundingPurpose}
              onChange={(e) => setFormData({...formData, fundingPurpose: e.target.value})}
              placeholder="How will you use the loan funds? (development costs, infrastructure, marketing, etc.)"
              rows={3}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              disabled={isPending || isConfirming}
            />
          </div>
        </div>

        {/* Loan Summary */}
        {formData.loanAmount && formData.interestRate && formData.tenorDays && (
          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Loan Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Principal:</span>
                <span className="text-white ml-2">{formData.loanAmount} USDT</span>
              </div>
              <div>
                <span className="text-gray-300">Interest:</span>
                <span className="text-white ml-2">
                  {((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate) / 100) * (parseFloat(formData.tenorDays) / 365)).toFixed(2)} USDT
                </span>
              </div>
              <div>
                <span className="text-gray-300">Total Repayment:</span>
                <span className="text-white ml-2 font-semibold">
                  {(parseFloat(formData.loanAmount) + ((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate) / 100) * (parseFloat(formData.tenorDays) / 365))).toFixed(2)} USDT
                </span>
              </div>
              <div>
                <span className="text-gray-300">Duration:</span>
                <span className="text-white ml-2">{formData.tenorDays} days</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isPending || 
            isConfirming || 
            !formData.loanAmount || 
            !formData.interestRate || 
            !formData.tenorDays || 
            !formData.projectTitle
          }
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && 'Preparing Transaction...'}
          {isConfirming && 'Creating Market...'}
          {!isPending && !isConfirming && 'Create Loan Market'}
        </button>

        {/* Transaction Status */}
        {hash && (
          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
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
          <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
            <p className="text-red-300 text-sm">
              ❌ Transaction failed: {error.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ Loan market created successfully! Lenders can now fund your project.
            </p>
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
        <p className="text-purple-300 text-sm">
          💡 <strong>How it works:</strong> Your loan market will be open for lenders to fund. 
          Once fully funded, you can withdraw the loan amount and must repay within the specified timeframe.
        </p>
      </div>
    </div>
  )
}
