'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { getContractConfig } from '@/lib/contracts'

// Utility functions
const formatInterestRate = (rate: bigint): string => {
  return `${(Number(rate) / 100).toFixed(2)}%`
}

const formatDuration = (duration: bigint): string => {
  const days = Number(duration) / 86400 // Convert seconds to days
  return `${Math.round(days)} days`
}

interface Market {
  id: string
  borrower: string
  amount: bigint
  interestRate: bigint
  duration: bigint
  projectName: string
  projectDescription: string
  ipfsHash: string
  isActive: boolean
  isFunded: boolean
  createdAt: bigint
}

interface MarketListProps {
  onMarketSelect?: (market: Market) => void
}

export function MarketList({ onMarketSelect }: MarketListProps) {
  const { address, chain } = useAccount()
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const { address: factoryAddress, abi: factoryAbi } = getContractConfig('MarketFactory', chain?.id)

  // Read total markets count
  const { data: marketCount } = useReadContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: 'marketCount',
    query: {
      enabled: !!factoryAddress,
    },
  })

  // Load all markets
  useEffect(() => {
    const loadMarkets = async () => {
      if (!marketCount || !factoryAddress || !factoryAbi) return

      setLoading(true)
      const marketsData: Market[] = []

      try {
        const count = Number(marketCount)
        for (let i = 1; i <= count; i++) {
          try {
            // Get market address
            const marketAddress = await factoryAddress // This would need proper implementation
            
            // For now, let's use mock data structure similar to what would come from contract
            const mockMarket: Market = {
              id: i.toString(),
              borrower: `0x${Math.random().toString(16).substr(2, 40)}`,
              amount: BigInt(Math.floor(Math.random() * 10) + 1) * BigInt(10 ** 18), // 1-10 ETH
              interestRate: BigInt(Math.floor(Math.random() * 1000) + 500), // 5-15%
              duration: BigInt(Math.floor(Math.random() * 365) + 30) * BigInt(24 * 60 * 60), // 30-365 days
              projectName: `Project ${i}`,
              projectDescription: `Description for project ${i}`,
              ipfsHash: `QmExample${i}`,
              isActive: Math.random() > 0.3,
              isFunded: Math.random() > 0.7,
              createdAt: BigInt(Date.now() / 1000 - Math.floor(Math.random() * 86400 * 30))
            }
            marketsData.push(mockMarket)
          } catch (err) {
            console.error(`Failed to load market ${i}:`, err)
          }
        }
      } catch (err) {
        console.error('Failed to load markets:', err)
      }

      setMarkets(marketsData)
      setLoading(false)
    }

    loadMarkets()
  }, [marketCount, factoryAddress, factoryAbi])

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market)
    onMarketSelect?.(market)
  }

  const formatDuration = (duration: bigint) => {
    const days = Number(duration) / (24 * 60 * 60)
    return `${Math.floor(days)} days`
  }

  const formatInterestRate = (rate: bigint) => {
    return `${Number(rate) / 100}%`
  }

  const getStatusBadge = (market: Market) => {
    if (market.isFunded) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">✅ Funded</span>
    } else if (market.isActive) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">🔄 Active</span>
    } else {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">⏸️ Inactive</span>
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">💰 Loan Markets</h2>
          <p className="text-gray-300">Browse available loan opportunities for developers</p>
        </div>
        <div className="text-gray-300">
          <span className="text-cyan-400 font-semibold">{markets.length}</span> markets available
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading markets...</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Markets Available</h3>
          <p className="text-gray-300 mb-6">Be the first to create a loan market!</p>
          <button
            onClick={() => window.location.href = '/actions?tab=market'}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Create Market
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <div
              key={market.id}
              onClick={() => handleMarketClick(market)}
              className="p-6 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {market.projectName}
                  </h3>
                  <p className="text-gray-400 text-sm">Market #{market.id}</p>
                </div>
                {getStatusBadge(market)}
              </div>

              {/* Amount & Rate */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Loan Amount:</span>
                  <span className="text-white font-semibold">{formatEther(market.amount)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Interest Rate:</span>
                  <span className="text-green-400 font-semibold">{formatInterestRate(market.interestRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Duration:</span>
                  <span className="text-blue-400 font-semibold">{formatDuration(market.duration)}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {market.projectDescription}
              </p>

              {/* Borrower */}
              <div className="text-xs text-gray-400 border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <span>Borrower:</span>
                  <span className="font-mono">{market.borrower.slice(0, 6)}...{market.borrower.slice(-4)}</span>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-3 text-center">
                <span className="text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Market Detail Modal */}
      {selectedMarket && (
        <MarketDetailModal 
          market={selectedMarket} 
          onClose={() => setSelectedMarket(null)}
        />
      )}
    </div>
  )
}

interface MarketDetailModalProps {
  market: Market
  onClose: () => void
}

function MarketDetailModal({ market, onClose }: MarketDetailModalProps) {
  const { address, isConnected } = useAccount()
  const isOwner = address && address.toLowerCase() === market.borrower.toLowerCase()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{market.projectName}</h2>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">Market #{market.id}</span>
              {market.isFunded ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">✅ Funded</span>
              ) : market.isActive ? (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">🔄 Active</span>
              ) : (
                <span className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full">⏸️ Inactive</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Financial Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Loan Amount</div>
              <div className="text-white text-xl font-semibold">{formatEther(market.amount)} ETH</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Interest Rate</div>
              <div className="text-green-400 text-xl font-semibold">{formatInterestRate(market.interestRate)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Duration</div>
              <div className="text-blue-400 text-xl font-semibold">{formatDuration(market.duration)}</div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">📝 Project Description</h3>
            <p className="text-gray-300 leading-relaxed">{market.projectDescription}</p>
          </div>

          {/* Borrower Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">👤 Borrower Information</h3>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Wallet Address:</span>
                <span className="text-white font-mono">{market.borrower}</span>
              </div>
              {isOwner && (
                <div className="mt-2 text-cyan-400 text-sm">
                  ✨ This is your market
                </div>
              )}
            </div>
          </div>

          {/* IPFS Data */}
          {market.ipfsHash && (
            <div>
              <h3 className="text-white text-lg font-semibold mb-3">🌐 Additional Data</h3>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">IPFS Hash:</span>
                  <span className="text-white font-mono text-sm">{market.ipfsHash}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {isConnected && !isOwner && market.isActive && !market.isFunded && (
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-white text-lg font-semibold mb-3">💰 Lender Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300">
                  Fund This Market
                </button>
                <p className="text-gray-400 text-sm text-center">
                  By funding this market, you&apos;ll lend {formatEther(market.amount)} ETH and earn {formatInterestRate(market.interestRate)} interest
                </p>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-white text-lg font-semibold mb-3">⚙️ Market Management</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 px-4 bg-blue-500/20 text-blue-300 border border-blue-400/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                  Edit Market
                </button>
                <button className="py-2 px-4 bg-red-500/20 text-red-300 border border-red-400/20 rounded-lg hover:bg-red-500/30 transition-colors">
                  Cancel Market
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
