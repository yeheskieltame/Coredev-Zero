'use client'

import { useState } from 'react'
import { formatEther } from 'viem'
import { useMarkets, Market } from '@/hooks/useMarkets'

interface MarketListProps {
  onMarketSelect?: (market: Market) => void
}

export function MarketList({ onMarketSelect }: MarketListProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const { markets, loading, useMockData, error } = useMarkets()

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
          {useMockData ? (
            <p className="text-yellow-400 text-sm mt-1">
              🧪 Development Mode: Showing mock data for testing
            </p>
          ) : (
            <p className="text-green-400 text-sm mt-1">
              🌐 Live Data: Showing real markets from blockchain
            </p>
          )}
        </div>
        <div className="text-gray-300">
          <span className="text-cyan-400 font-semibold">{markets.length}</span> markets available
          {error && (
            <div className="text-red-400 text-xs mt-1">
              Contract error: {error.message}
            </div>
          )}
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
              className={`p-6 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-all cursor-pointer ${
                selectedMarket?.id === market.id ? 'ring-2 ring-cyan-400/50 bg-cyan-500/10' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{market.projectName}</h3>
                  <p className="text-sm text-gray-400">
                    {market.borrower.slice(0, 6)}...{market.borrower.slice(-4)}
                  </p>
                </div>
                {getStatusBadge(market)}
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {market.projectDescription}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-semibold">
                    {formatEther(market.amount)} tCORE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interest:</span>
                  <span className="text-green-400 font-semibold">
                    {formatInterestRate(market.interestRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-blue-400 font-semibold">
                    {formatDuration(market.duration)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Created {new Date(Number(market.createdAt) * 1000).toLocaleDateString()}
                  </span>
                  {market.isActive && !market.isFunded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle lending action
                        console.log('Lend to market:', market.id)
                        window.location.href = '/actions?tab=lending'
                      }}
                      className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full hover:bg-green-500/30 transition-colors"
                    >
                      💰 Lend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Market Details */}
      {selectedMarket && (
        <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">📋 Market Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-cyan-300 mb-2">Project Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Project Name:</span>
                  <span className="text-white ml-2">{selectedMarket.projectName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-white mt-1">{selectedMarket.projectDescription}</p>
                </div>
                <div>
                  <span className="text-gray-400">IPFS Hash:</span>
                  <span className="text-cyan-300 ml-2 font-mono text-xs">{selectedMarket.ipfsHash}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-cyan-300 mb-2">Loan Terms</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Borrower:</span>
                  <span className="text-white ml-2 font-mono text-xs">{selectedMarket.borrower}</span>
                </div>
                <div>
                  <span className="text-gray-400">Loan Amount:</span>
                  <span className="text-white ml-2 font-semibold">
                    {formatEther(selectedMarket.amount)} tCORE
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Interest Rate:</span>
                  <span className="text-green-400 ml-2 font-semibold">
                    {formatInterestRate(selectedMarket.interestRate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-blue-400 ml-2 font-semibold">
                    {formatDuration(selectedMarket.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {selectedMarket.isActive && !selectedMarket.isFunded && (
            <div className="mt-6 pt-4 border-t border-cyan-400/20">
              <button
                onClick={() => {
                  // Handle lending action
                  console.log('Start lending process for:', selectedMarket.id)
                  window.location.href = '/actions?tab=lending'
                }}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                💰 Start Lending Process
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
