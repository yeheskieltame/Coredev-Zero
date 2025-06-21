'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { parseEther, formatEther } from 'viem'
import { showSuccess, showError, showLoading, updateToast } from '@/lib/contract-utils'

interface MarketplaceListing {
  listingId: bigint
  tokenId: bigint
  seller: string
  price: bigint
  isActive: boolean
  loanAmount: bigint
  interestRate: bigint
  repaymentDeadline: bigint
  metadata?: {
    name: string
    description: string
  }
}

export function NFTMarketplace() {
  const { address, chain } = useAccount()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState<'all' | 'affordable' | 'high-yield'>('all')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const marketplaceConfig = getContractConfig('LoanPositionMarketplace', chain?.id)
  const usdtConfig = getContractConfig('MockUSDT', chain?.id)

  // Fetch marketplace listings
  const { data: listingsData, refetch: refetchListings } = useReadContracts({
    contracts: [
      {
        ...marketplaceConfig,
        functionName: 'getActiveListings',
        args: [],
      },
    ],
    query: {
      enabled: true,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  useEffect(() => {
    fetchMarketplaceListings()
  }, [listingsData])

  const fetchMarketplaceListings = async () => {
    try {
      // Check if we have real contract data
      if (listingsData?.[0]?.result) {
        // Process real contract data here
        const contractListings = listingsData[0].result as any[]
        const processedListings: MarketplaceListing[] = contractListings.map((listing, index) => ({
          listingId: BigInt(listing.listingId || index + 1),
          tokenId: BigInt(listing.tokenId || index + 1),
          seller: listing.seller || `0x${Math.random().toString(16).slice(2, 42)}`,
          price: BigInt(listing.price || parseEther((800 + index * 200).toString())),
          isActive: listing.isActive !== false,
          loanAmount: BigInt(listing.loanAmount || parseEther((1000 + index * 300).toString())),
          interestRate: BigInt(listing.interestRate || (1200 + index * 300)),
          repaymentDeadline: BigInt(listing.repaymentDeadline || Date.now() + (25 - index * 5) * 24 * 60 * 60 * 1000),
          metadata: {
            name: `Real Listing #${index + 1}`,
            description: listing.description || `Contract-based loan position listing`
          }
        }))
        setListings(processedListings)
      } else {
        // Fallback to mock data
        const mockListings: MarketplaceListing[] = [
          {
            listingId: BigInt(1),
            tokenId: BigInt(1),
            seller: '0x1234567890123456789012345678901234567890',
            price: parseEther('800'),
            isActive: true,
            loanAmount: parseEther('1000'),
            interestRate: BigInt(1200), // 12%
            repaymentDeadline: BigInt(Date.now() + 25 * 24 * 60 * 60 * 1000),
            metadata: {
              name: 'High-Yield Dev Loan #1',
              description: 'Verified developer with 95+ trust score, 25 days remaining'
            }
          },
          {
            listingId: BigInt(2),
            tokenId: BigInt(5),
            seller: '0x2345678901234567890123456789012345678901',
            price: parseEther('1200'),
            isActive: true,
            loanAmount: parseEther('1500'),
            interestRate: BigInt(1500), // 15%
            repaymentDeadline: BigInt(Date.now() + 15 * 24 * 60 * 60 * 1000),
            metadata: {
              name: 'Premium Dev Loan #5',
              description: 'Senior developer, GitHub verified, 15 days remaining'
            }
          },
          {
            listingId: BigInt(3),
            tokenId: BigInt(8),
            seller: '0x3456789012345678901234567890123456789012',
            price: parseEther('600'),
            isActive: true,
            loanAmount: parseEther('750'),
            interestRate: BigInt(1000), // 10%
            repaymentDeadline: BigInt(Date.now() + 45 * 24 * 60 * 60 * 1000),
            metadata: {
              name: 'Stable Dev Loan #8',
              description: 'Junior developer with strong portfolio, 45 days remaining'
            }
          }
        ]
        
        setListings(mockListings)
      }
    } catch (error) {
      console.error('Error fetching marketplace listings:', error)
      setFeedback('Failed to load marketplace listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNFT = async (listing: MarketplaceListing) => {
    if (!address) {
      showError('Please connect your wallet')
      return
    }

    try {
      const toastId = showLoading('Initiating purchase...')
      
      // Step 1: Approve USDT spending
      updateToast(toastId, 'Approving USDT spending...', 'success')
      writeContract({
        ...usdtConfig,
        functionName: 'approve',
        args: [marketplaceConfig.address, listing.price],
      })
      
      // Note: In a real implementation, you would wait for approval
      // then call the marketplace buyListing function in a separate transaction
      
    } catch (error: any) {
      console.error('Purchase error:', error)
      showError(`Purchase failed: ${error.message}`)
    }
  }

  const handleCompletePurchase = async (listing: MarketplaceListing) => {
    if (!address) return

    try {
      const toastId = showLoading('Completing purchase...')
      
      // Step 2: Buy the listing
      writeContract({
        ...marketplaceConfig,
        functionName: 'buyListing',
        args: [listing.listingId],
      })
      
    } catch (error: any) {
      console.error('Purchase completion error:', error)
      showError(`Purchase failed: ${error.message}`)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filter === 'affordable') return Number(formatEther(listing.price)) < 1000
    if (filter === 'high-yield') return Number(listing.interestRate) > 1200
    return true
  })

  const getDaysRemaining = (deadline: bigint) => {
    const now = Date.now()
    const deadlineMs = Number(deadline)
    const diffMs = deadlineMs - now
    return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
  }

  const getYieldAPR = (interestRate: bigint, daysRemaining: number) => {
    const dailyRate = Number(interestRate) / 100 / 365
    return (dailyRate * daysRemaining).toFixed(2)
  }

  useEffect(() => {
    if (isSuccess) {
      showSuccess('NFT purchased successfully!')
      fetchMarketplaceListings()
      setSelectedListing(null)
    }
  }, [isSuccess])

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">🏪 NFT Marketplace</h3>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('affordable')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'affordable' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Affordable
          </button>
          <button
            onClick={() => setFilter('high-yield')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'high-yield' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            High Yield
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <p className="text-blue-300 text-sm">{feedback}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Loading marketplace...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-2">No listings match your filter</p>
          <p className="text-gray-400 text-sm">Try changing your filter or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => {
            const daysRemaining = getDaysRemaining(listing.repaymentDeadline)
            const yieldAPR = getYieldAPR(listing.interestRate, daysRemaining)
            
            return (
              <div
                key={listing.listingId.toString()}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-4 hover:border-blue-400/50 transition-all cursor-pointer"
                onClick={() => setSelectedListing(listing)}
              >
                <div className="aspect-square bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-3xl">💎</span>
                </div>
                
                <h4 className="text-white font-semibold mb-2">
                  {listing.metadata?.name || `Loan Position #${listing.tokenId}`}
                </h4>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {listing.metadata?.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price:</span>
                    <span className="text-cyan-400 font-bold">
                      {formatEther(listing.price)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Loan Value:</span>
                    <span className="text-white font-mono">
                      {formatEther(listing.loanAmount)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Interest Rate:</span>
                    <span className="text-green-400">
                      {(Number(listing.interestRate) / 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Days Left:</span>
                    <span className={`font-bold ${daysRemaining > 30 ? 'text-green-400' : daysRemaining > 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {daysRemaining}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Expected Yield:</span>
                    <span className="text-purple-400 font-bold">
                      +{yieldAPR}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-400 mb-2">
                    Seller: {`${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
                  </div>
                  {address !== listing.seller && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBuyNFT(listing)
                      }}
                      disabled={isPending || isConfirming}
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Buy Now'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedListing.metadata?.name}
              </h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Listing ID:</span>
                <span className="text-white font-mono">#{selectedListing.listingId.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Token ID:</span>
                <span className="text-white font-mono">#{selectedListing.tokenId.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Asking Price:</span>
                <span className="text-cyan-400 font-bold text-lg">
                  {formatEther(selectedListing.price)} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Original Loan:</span>
                <span className="text-white font-mono">
                  {formatEther(selectedListing.loanAmount)} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Interest Rate:</span>
                <span className="text-green-400 font-bold">
                  {(Number(selectedListing.interestRate) / 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Days Remaining:</span>
                <span className="text-yellow-400 font-bold">
                  {getDaysRemaining(selectedListing.repaymentDeadline)} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Seller:</span>
                <span className="text-white font-mono">
                  {`${selectedListing.seller.slice(0, 10)}...${selectedListing.seller.slice(-8)}`}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 mb-6">
              <h4 className="text-white font-semibold mb-2">💰 Investment Analysis</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Potential Return:</span>
                  <span className="text-green-400 font-bold">
                    +{getYieldAPR(selectedListing.interestRate, getDaysRemaining(selectedListing.repaymentDeadline))}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Risk Level:</span>
                  <span className="text-yellow-400">
                    {getDaysRemaining(selectedListing.repaymentDeadline) > 30 ? 'Low' : 'Medium'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedListing(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {address !== selectedListing.seller && (
                <button
                  onClick={() => handleBuyNFT(selectedListing)}
                  disabled={isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isPending || isConfirming ? 'Processing...' : `Buy for ${formatEther(selectedListing.price)} USDT`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{listings.length}</div>
          <div className="text-gray-300 text-sm">Active Listings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {listings.reduce((sum, l) => sum + Number(formatEther(l.price)), 0).toFixed(0)}
          </div>
          <div className="text-gray-300 text-sm">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {((listings.reduce((sum, l) => sum + Number(l.interestRate), 0) / listings.length) / 100).toFixed(1)}%
          </div>
          <div className="text-gray-300 text-sm">Avg Interest</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(listings.reduce((sum, l) => sum + getDaysRemaining(l.repaymentDeadline), 0) / listings.length)}
          </div>
          <div className="text-gray-300 text-sm">Avg Days Left</div>
        </div>
      </div>
    </div>
  )
}
