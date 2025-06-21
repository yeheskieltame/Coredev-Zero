'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { parseEther, formatEther } from 'viem'
import { showSuccess, showError, showLoading } from '@/lib/contract-utils'

interface NFTPosition {
  tokenId: bigint
  loanAmount: bigint
  interestRate: bigint
  repaymentDeadline: bigint
  isActive: boolean
  borrower: string
  metadata?: {
    name: string
    description: string
    image: string
  }
}

export function LoanPositionNFTs() {
  const { address, chain } = useAccount()
  const [positions, setPositions] = useState<NFTPosition[]>([])
  const [selectedPosition, setSelectedPosition] = useState<NFTPosition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [transferAddress, setTransferAddress] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const loanPositionNFTConfig = getContractConfig('LoanPositionNFT', chain?.id)

  // Fetch user's NFT positions
  const { data: contractReads, refetch } = useReadContracts({
    contracts: address ? [
      {
        ...loanPositionNFTConfig,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
    ] : [],
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    if (address && contractReads?.[0]?.result) {
      fetchNFTPositions(contractReads[0].result as bigint)
    } else if (address) {
      // Fallback to mock data if contract not available
      const mockPositions: NFTPosition[] = [
        {
          tokenId: BigInt(1),
          loanAmount: parseEther('1000'),
          interestRate: BigInt(1200), // 12.00%
          repaymentDeadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          borrower: address || '',
          metadata: {
            name: 'Dev Loan Position #1',
            description: 'Developer loan position for 1000 USDT',
            image: '/nft-placeholder-1.png'
          }
        },
        {
          tokenId: BigInt(2),
          loanAmount: parseEther('1500'),
          interestRate: BigInt(1000), // 10.00%
          repaymentDeadline: BigInt(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          isActive: false,
          borrower: address || '',
          metadata: {
            name: 'Dev Loan Position #2',
            description: 'Developer loan position for 1500 USDT (Repaid)',
            image: '/nft-placeholder-2.png'
          }
        }
      ]
      setPositions(mockPositions)
      setIsLoading(false)
    } else {
      setPositions([])
      setIsLoading(false)
    }
  }, [contractReads, address])

  const fetchNFTPositions = async (balance: bigint) => {
    if (!address || balance === BigInt(0)) {
      setIsLoading(false)
      return
    }

    try {
      const positions: NFTPosition[] = []
      
      // Fetch each token owned by user
      for (let i = 0; i < Number(balance); i++) {
        try {
          // Get token ID by index
          const tokenId = BigInt(i + 1) // Simplified - in real implementation, use tokenOfOwnerByIndex
          
          // Fetch position data from contract
          // For now, using mock data structure but ready for real contract calls
          const loanPosition: NFTPosition = {
            tokenId,
            loanAmount: parseEther((1000 + i * 500).toString()),
            interestRate: BigInt(1200 + i * 100), // 12.00% + i%
            repaymentDeadline: BigInt(Date.now() + (30 - i * 5) * 24 * 60 * 60 * 1000),
            isActive: i < 2, // First 2 are active
            borrower: address,
            metadata: {
              name: `Dev Loan Position #${tokenId}`,
              description: `Developer loan position for ${1000 + i * 500} USDT`,
              image: `/nft-placeholder-${(i % 3) + 1}.png`
            }
          }
          
          positions.push(loanPosition)
        } catch (tokenError) {
          console.error(`Error fetching token ${i}:`, tokenError)
        }
      }
      
      setPositions(positions)
    } catch (error) {
      console.error('Error fetching NFT positions:', error)
      setFeedback('Failed to load NFT positions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferNFT = async (tokenId: bigint, toAddress: string) => {
    if (!address) {
      showError('Please connect your wallet')
      return
    }

    try {
      showLoading('Initiating NFT transfer...')
      writeContract({
        ...loanPositionNFTConfig,
        functionName: 'transferFrom',
        args: [address, toAddress as `0x${string}`, tokenId],
      })
    } catch (error: any) {
      showError(`Transfer failed: ${error.message}`)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      showSuccess('NFT transferred successfully!')
      refetch()
      setSelectedPosition(null)
      setTransferAddress('')
    }
  }, [isSuccess, refetch])

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <p className="text-gray-300">Connect wallet to view your Loan Position NFTs</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🎨 Loan Position NFTs</h3>
      
      {feedback && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <p className="text-blue-300 text-sm">{feedback}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Loading NFT positions...</span>
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">No Loan Position NFTs found</p>
          <p className="text-gray-400 text-sm">NFTs are minted when you take out loans</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <div
                key={position.tokenId.toString()}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 cursor-pointer hover:border-purple-400/50 transition-all"
                onClick={() => setSelectedPosition(position)}
              >
                <div className="aspect-square bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl">🏦</span>
                </div>
                
                <h4 className="text-white font-semibold mb-2">
                  {position.metadata?.name || `NFT #${position.tokenId}`}
                </h4>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Loan Amount:</span>
                    <span className="text-white font-mono">
                      {formatEther(position.loanAmount)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Interest Rate:</span>
                    <span className="text-white">
                      {(Number(position.interestRate) / 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`${position.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {position.isActive ? 'Active' : 'Repaid'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Position Detail Modal */}
          {selectedPosition && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {selectedPosition.metadata?.name}
                  </h3>
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Token ID:</span>
                    <span className="text-white font-mono">#{selectedPosition.tokenId.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Loan Amount:</span>
                    <span className="text-white font-mono">
                      {formatEther(selectedPosition.loanAmount)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Interest Rate:</span>
                    <span className="text-white">
                      {(Number(selectedPosition.interestRate) / 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Deadline:</span>
                    <span className="text-white">
                      {new Date(Number(selectedPosition.repaymentDeadline)).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`${selectedPosition.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {selectedPosition.isActive ? 'Active Loan' : 'Repaid'}
                    </span>
                  </div>
                </div>

                {selectedPosition.isActive && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Transfer to address (0x...)"
                      value={transferAddress}
                      onChange={(e) => setTransferAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    <p className="text-gray-400 text-xs">
                      Enter a valid Ethereum address to transfer this NFT
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  {selectedPosition.isActive && (
                    <button
                      onClick={() => {
                        if (transferAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                          handleTransferNFT(selectedPosition.tokenId, transferAddress)
                        } else {
                          setFeedback('Please enter a valid Ethereum address')
                        }
                      }}
                      disabled={isPending || isConfirming || !transferAddress}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Transfer NFT'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{positions.length}</div>
          <div className="text-gray-300 text-sm">Total NFTs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {positions.filter(p => p.isActive).length}
          </div>
          <div className="text-gray-300 text-sm">Active Loans</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {positions.filter(p => !p.isActive).length}
          </div>
          <div className="text-gray-300 text-sm">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {positions.reduce((sum, p) => sum + Number(formatEther(p.loanAmount)), 0).toFixed(0)}
          </div>
          <div className="text-gray-300 text-sm">Total Value</div>
        </div>
      </div>
    </div>
  )
}
