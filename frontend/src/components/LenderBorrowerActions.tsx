'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

interface LenderBorrowerActionsProps {
  onSuccess?: () => void
}

interface MarketData {
  id: string
  borrower: string
  amount: bigint
  interestRate: bigint
  duration: bigint
  projectName: string
  isActive: boolean
  isFunded: boolean
}

export function LenderBorrowerActions({ onSuccess }: LenderBorrowerActionsProps) {
  const { address, isConnected, chain } = useAccount()
  const [activeTab, setActiveTab] = useState<'lend' | 'borrow' | 'manage'>('lend')
  const [selectedMarket, setSelectedMarket] = useState<string>('')
  const [lendAmount, setLendAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [markets, setMarkets] = useState<MarketData[]>([])

  // Get user's ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  })

  // Get user's staking info
  const { address: stakingAddress, abi: stakingAbi } = getContractConfig('StakingVault', chain?.id)
  const { data: stakingData } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingAddress,
    },
  })

  // Write contract hooks
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Mock markets data (in real app, this would come from contract)
  useEffect(() => {
    const mockMarkets: MarketData[] = [
      {
        id: '1',
        borrower: '0x1234567890123456789012345678901234567890',
        amount: parseEther('5'),
        interestRate: BigInt(1200), // 12%
        duration: BigInt(180 * 24 * 60 * 60), // 180 days
        projectName: 'DeFi Portfolio Tracker',
        isActive: true,
        isFunded: false,
      },
      {
        id: '2',
        borrower: '0x0987654321098765432109876543210987654321',
        amount: parseEther('2'),
        interestRate: BigInt(800), // 8%
        duration: BigInt(90 * 24 * 60 * 60), // 90 days
        projectName: 'NFT Marketplace',
        isActive: true,
        isFunded: false,
      },
      {
        id: '3',
        borrower: address || '',
        amount: parseEther('3'),
        interestRate: BigInt(1000), // 10%
        duration: BigInt(120 * 24 * 60 * 60), // 120 days
        projectName: 'My Project',
        isActive: true,
        isFunded: true,
      },
    ]
    setMarkets(mockMarkets)
  }, [address])

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      setFeedback({ type: 'success', message: 'Transaction completed successfully! 🎉' })
      setLoading(false)
      setLendAmount('')
      onSuccess?.()
    }
  }, [isSuccess, onSuccess])

  // Handle error
  useEffect(() => {
    if (error) {
      setFeedback({ type: 'error', message: 'Transaction failed: ' + error.message })
      setLoading(false)
    }
  }, [error])

  const handleLendToMarket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      setFeedback({ type: 'error', message: 'Please connect your wallet' })
      return
    }

    if (!selectedMarket) {
      setFeedback({ type: 'error', message: 'Please select a market to fund' })
      return
    }

    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount' })
      return
    }

    const market = markets.find(m => m.id === selectedMarket)
    if (!market) {
      setFeedback({ type: 'error', message: 'Market not found' })
      return
    }

    const amount = parseEther(lendAmount)
    if (amount > market.amount) {
      setFeedback({ type: 'error', message: 'Amount exceeds market requirement' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      // This would call the actual lending function on the market contract
      // For demo purposes, we'll simulate the transaction
      setFeedback({ type: 'info', message: 'Simulating lending transaction...' })
      
      // Simulate delay
      setTimeout(() => {
        setFeedback({ type: 'success', message: `Successfully lent ${lendAmount} ETH to ${market.projectName}! 🎉` })
        setLoading(false)
        setLendAmount('')
        onSuccess?.()
      }, 2000)

    } catch (err: any) {
      console.error('Lending error:', err)
      setFeedback({ type: 'error', message: 'Failed to lend: ' + (err.message || 'Unknown error') })
      setLoading(false)
    }
  }

  const handleRepayLoan = async (marketId: string) => {
    if (!isConnected) {
      setFeedback({ type: 'error', message: 'Please connect your wallet' })
      return
    }

    const market = markets.find(m => m.id === marketId)
    if (!market) {
      setFeedback({ type: 'error', message: 'Market not found' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      // This would call the repayment function
      setFeedback({ type: 'info', message: 'Simulating loan repayment...' })
      
      setTimeout(() => {
        setFeedback({ type: 'success', message: `Successfully repaid loan for ${market.projectName}! 🎉` })
        setLoading(false)
        onSuccess?.()
      }, 2000)

    } catch (err: any) {
      console.error('Repayment error:', err)
      setFeedback({ type: 'error', message: 'Failed to repay: ' + (err.message || 'Unknown error') })
      setLoading(false)
    }
  }

  const formatDuration = (duration: bigint) => {
    const days = Number(duration) / (24 * 60 * 60)
    return `${Math.floor(days)} days`
  }

  const formatInterestRate = (rate: bigint) => {
    return `${Number(rate) / 100}%`
  }

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">🔌</div>
        <p className="text-gray-300">Please connect your wallet to access lending and borrowing features</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">💼 Lending & Borrowing</h2>
        <p className="text-gray-300">Manage your lending and borrowing activities</p>
      </div>

      {/* Account Overview */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">ETH Balance</div>
          <div className="text-white text-xl font-semibold">
            {ethBalance ? formatEther(ethBalance.value) : '0.00'} ETH
          </div>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Staked Amount</div>
          <div className="text-green-400 text-xl font-semibold">
            {stakingData && Array.isArray(stakingData) ? formatEther(stakingData[0] || BigInt(0)) : '0.00'} ETH
          </div>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Active Loans</div>
          <div className="text-blue-400 text-xl font-semibold">
            {markets.filter(m => m.borrower.toLowerCase() === address?.toLowerCase() && m.isFunded).length}
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-lg border ${
          feedback.type === 'success' ? 'bg-green-500/10 border-green-400/20 text-green-300' :
          feedback.type === 'error' ? 'bg-red-500/10 border-red-400/20 text-red-300' :
          'bg-blue-500/10 border-blue-400/20 text-blue-300'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
          {[
            { id: 'lend' as const, label: '💰 Lend', description: 'Fund loan markets' },
            { id: 'borrow' as const, label: '📈 Borrow', description: 'Manage your loans' },
            { id: 'manage' as const, label: '⚙️ Manage', description: 'Portfolio overview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold">{tab.label}</div>
              <div className="text-xs opacity-80">{tab.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        {activeTab === 'lend' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">💰 Lend to Markets</h3>
            
            <form onSubmit={handleLendToMarket} className="space-y-4">
              {/* Market Selection */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Select Market
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  required
                >
                  <option value="">Choose a market to fund...</option>
                  {markets.filter(m => m.isActive && !m.isFunded && m.borrower.toLowerCase() !== address?.toLowerCase()).map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.projectName} - {formatEther(market.amount)} ETH at {formatInterestRate(market.interestRate)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Amount to Lend (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="0.00"
                  required
                />
                {selectedMarket && (
                  <p className="text-gray-400 text-sm mt-1">
                    Market needs: {formatEther(markets.find(m => m.id === selectedMarket)?.amount || BigInt(0))} ETH
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || isPending || isConfirming}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Lend ETH'}
              </button>
            </form>

            {/* Available Markets */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Available Markets</h4>
              <div className="space-y-3">
                {markets.filter(m => m.isActive && !m.isFunded && m.borrower.toLowerCase() !== address?.toLowerCase()).map((market) => (
                  <div key={market.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-white font-medium">{market.projectName}</h5>
                        <p className="text-gray-400 text-sm">Amount: {formatEther(market.amount)} ETH</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{formatInterestRate(market.interestRate)}</div>
                        <div className="text-gray-400 text-sm">{formatDuration(market.duration)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'borrow' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">📈 Your Loans</h3>
            
            {/* Your Markets */}
            <div className="space-y-4">
              {markets.filter(m => m.borrower.toLowerCase() === address?.toLowerCase()).map((market) => (
                <div key={market.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="text-white font-medium">{market.projectName}</h5>
                      <p className="text-gray-400 text-sm">Loan Amount: {formatEther(market.amount)} ETH</p>
                      <p className="text-gray-400 text-sm">Interest: {formatInterestRate(market.interestRate)} for {formatDuration(market.duration)}</p>
                    </div>
                    <div className="text-right">
                      {market.isFunded ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">✅ Funded</span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">⏳ Seeking Funding</span>
                      )}
                    </div>
                  </div>
                  
                  {market.isFunded && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-300">Total to Repay:</span>
                        <span className="text-red-400 font-semibold">
                          {formatEther(market.amount + (market.amount * market.interestRate / BigInt(10000)))} ETH
                        </span>
                      </div>
                      <button
                        onClick={() => handleRepayLoan(market.id)}
                        disabled={loading}
                        className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
                      >
                        Repay Loan
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {markets.filter(m => m.borrower.toLowerCase() === address?.toLowerCase()).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-white font-semibold mb-2">No Loans Yet</h4>
                  <p className="text-gray-300 mb-4">Create your first loan market to get started</p>
                  <button
                    onClick={() => window.location.href = '/actions?tab=market'}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Create Market
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Portfolio Overview</h3>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg text-center">
                <div className="text-green-400 text-2xl font-bold">
                  {markets.filter(m => m.borrower.toLowerCase() !== address?.toLowerCase() && m.isFunded).length}
                </div>
                <div className="text-green-300 text-sm">Loans Given</div>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg text-center">
                <div className="text-blue-400 text-2xl font-bold">
                  {markets.filter(m => m.borrower.toLowerCase() === address?.toLowerCase() && m.isFunded).length}
                </div>
                <div className="text-blue-300 text-sm">Loans Taken</div>
              </div>
              
              <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg text-center">
                <div className="text-purple-400 text-2xl font-bold">
                  {formatEther(
                    markets
                      .filter(m => m.borrower.toLowerCase() !== address?.toLowerCase() && m.isFunded)
                      .reduce((sum, m) => sum + m.amount, BigInt(0))
                  )}
                </div>
                <div className="text-purple-300 text-sm">ETH Lent</div>
              </div>
              
              <div className="p-4 bg-orange-500/10 border border-orange-400/20 rounded-lg text-center">
                <div className="text-orange-400 text-2xl font-bold">
                  {formatEther(
                    markets
                      .filter(m => m.borrower.toLowerCase() === address?.toLowerCase() && m.isFunded)
                      .reduce((sum, m) => sum + m.amount, BigInt(0))
                  )}
                </div>
                <div className="text-orange-300 text-sm">ETH Borrowed</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                  <span className="text-gray-300">Market creation activity will appear here</span>
                  <span className="text-gray-400 text-sm">Soon™</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
