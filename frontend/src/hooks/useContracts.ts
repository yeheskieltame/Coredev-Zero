import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useState, useEffect } from 'react'
import { showSuccess, showError, showLoading } from '@/lib/contract-utils'

// Hook for reading NFT balance and token details
export function useNFTPositions() {
  const { address, chain } = useAccount()
  const [positions, setPositions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loanPositionNFTConfig = getContractConfig('LoanPositionNFT', chain?.id)

  const { data: contractReads, refetch } = useReadContracts({
    contracts: address ? [
      {
        ...loanPositionNFTConfig,
        functionName: 'balanceOf',
        args: [address],
      },
    ] : [],
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    const fetchPositions = async () => {
      if (!address || !contractReads?.[0]?.result) {
        setIsLoading(false)
        return
      }

      const balance = contractReads[0].result as bigint
      if (balance === BigInt(0)) {
        setPositions([])
        setIsLoading(false)
        return
      }

      // Here you would fetch individual token data
      // For now, using mock data structure
      const mockPositions = Array.from({ length: Number(balance) }, (_, i) => ({
        tokenId: BigInt(i + 1),
        loanAmount: BigInt(1000 + i * 500) * BigInt(10 ** 18),
        interestRate: BigInt(1200 + i * 100),
        repaymentDeadline: BigInt(Date.now() + (30 - i * 5) * 24 * 60 * 60 * 1000),
        isActive: i < 2,
        borrower: address,
        metadata: {
          name: `Dev Loan Position #${i + 1}`,
          description: `Developer loan position for ${1000 + i * 500} USDT`,
          image: `/nft-placeholder-${(i % 3) + 1}.png`
        }
      }))

      setPositions(mockPositions)
      setIsLoading(false)
    }

    fetchPositions()
  }, [contractReads, address])

  return { positions, isLoading, refetch }
}

// Hook for reading marketplace listings
export function useMarketplaceListings() {
  const { chain } = useAccount()
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const marketplaceConfig = getContractConfig('LoanPositionMarketplace', chain?.id)

  const { data: contractReads, refetch } = useReadContracts({
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
    const fetchListings = async () => {
      // Mock data for now - replace with real contract data processing
      const mockListings = [
        {
          listingId: BigInt(1),
          tokenId: BigInt(1),
          seller: '0x1234567890123456789012345678901234567890',
          price: BigInt(800) * BigInt(10 ** 18),
          isActive: true,
          loanAmount: BigInt(1000) * BigInt(10 ** 18),
          interestRate: BigInt(1200),
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
          price: BigInt(1200) * BigInt(10 ** 18),
          isActive: true,
          loanAmount: BigInt(1500) * BigInt(10 ** 18),
          interestRate: BigInt(1500),
          repaymentDeadline: BigInt(Date.now() + 15 * 24 * 60 * 60 * 1000),
          metadata: {
            name: 'Premium Dev Loan #5',
            description: 'Senior developer, GitHub verified, 15 days remaining'
          }
        }
      ]

      setListings(mockListings)
      setIsLoading(false)
    }

    fetchListings()
  }, [contractReads])

  return { listings, isLoading, refetch }
}

// Hook for NFT transfers
export function useNFTTransfer() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const transferNFT = async (tokenId: bigint, toAddress: string) => {
    if (!address) {
      showError('Please connect your wallet')
      return
    }

    try {
      const loanPositionNFTConfig = getContractConfig('LoanPositionNFT')
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
    }
  }, [isSuccess])

  return { transferNFT, isPending, isConfirming, isSuccess }
}

// Hook for marketplace purchases
export function useMarketplacePurchase() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const purchaseNFT = async (listingId: bigint, price: bigint) => {
    if (!address) {
      showError('Please connect your wallet')
      return
    }

    try {
      const marketplaceConfig = getContractConfig('LoanPositionMarketplace')
      const usdtConfig = getContractConfig('MockUSDT')
      
      // Step 1: Approve USDT spending
      const toastId = showLoading('Approving USDT spending...')
      
      writeContract({
        ...usdtConfig,
        functionName: 'approve',
        args: [marketplaceConfig.address, price],
      })

      // Note: In a real implementation, you would wait for approval transaction
      // then proceed with the purchase in a separate transaction
      
    } catch (error: any) {
      showError(`Purchase failed: ${error.message}`)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      showSuccess('NFT purchased successfully!')
    }
  }, [isSuccess])

  return { purchaseNFT, isPending, isConfirming, isSuccess }
}
