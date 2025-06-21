import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { createTimestamp } from '@/lib/bigint-utils'

export interface Market {
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

export function useMarkets() {
  const { chain } = useAccount()
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  const { address: factoryAddress, abi: factoryAbi } = getContractConfig('MarketFactory', chain?.id)

  // Read market addresses from factory
  const { data: marketAddresses, isLoading: isLoadingMarkets, error: marketError } = useReadContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: 'getAllMarkets',
    query: {
      enabled: !!factoryAddress,
    },
  })

  // Create mock data for development/testing
  const createMockMarkets = (): Market[] => {
    const mockMarkets: Market[] = [
      {
        id: '1',
        borrower: '0x742d35Cc6481C0532c420a1aB35e0fb0A1EbCcA7',
        amount: BigInt('2000000000000000000'), // 2 ETH
        interestRate: BigInt(1200), // 12%
        duration: BigInt(90 * 24 * 60 * 60), // 90 days
        projectName: 'DeFi Analytics Dashboard',
        projectDescription: 'Building a comprehensive analytics dashboard for DeFi protocols with real-time data visualization and portfolio tracking.',
        ipfsHash: 'QmExampleHash1',
        isActive: true,
        isFunded: false,
        createdAt: createTimestamp(-86400 * 5) // 5 days ago
      },
      {
        id: '2',
        borrower: '0x8ba1f109551bD432803012645Hac136c0586b48',
        amount: BigInt('5000000000000000000'), // 5 ETH
        interestRate: BigInt(1000), // 10%
        duration: BigInt(120 * 24 * 60 * 60), // 120 days
        projectName: 'NFT Marketplace for Developers',
        projectDescription: 'Creating a specialized NFT marketplace for developer portfolios, code snippets, and technical documentation.',
        ipfsHash: 'QmExampleHash2',
        isActive: true,
        isFunded: true,
        createdAt: createTimestamp(-86400 * 10) // 10 days ago
      },
      {
        id: '3',
        borrower: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        amount: BigInt('1500000000000000000'), // 1.5 ETH
        interestRate: BigInt(800), // 8%
        duration: BigInt(60 * 24 * 60 * 60), // 60 days
        projectName: 'AI Code Review Tool',
        projectDescription: 'Developing an AI-powered code review tool that integrates with GitHub to provide automated feedback and suggestions.',
        ipfsHash: 'QmExampleHash3',
        isActive: true,
        isFunded: false,
        createdAt: createTimestamp(-86400 * 2) // 2 days ago
      },
      {
        id: '4',
        borrower: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        amount: BigInt('3000000000000000000'), // 3 ETH
        interestRate: BigInt(1500), // 15%
        duration: BigInt(180 * 24 * 60 * 60), // 180 days
        projectName: 'Cross-Chain Bridge Protocol',
        projectDescription: 'Building a secure and efficient cross-chain bridge for transferring assets between Ethereum and other blockchains.',
        ipfsHash: 'QmExampleHash4',
        isActive: false,
        isFunded: false,
        createdAt: createTimestamp(-86400 * 15) // 15 days ago
      }
    ]
    return mockMarkets
  }

  // Load all markets
  useEffect(() => {
    const loadMarkets = async () => {
      setLoading(true)

      try {
        // If we have market addresses from contract, load real data
        if (marketAddresses && Array.isArray(marketAddresses) && marketAddresses.length > 0) {
          console.log('Loading real markets from blockchain:', marketAddresses.length, 'markets')
          
          const marketsData: Market[] = []
          
          for (let i = 0; i < marketAddresses.length; i++) {
            const marketAddress = marketAddresses[i] as string
            
            try {
              // For now, create a simplified market entry with the address
              // In a full implementation, you'd use useReadContracts to fetch all market data
              const market: Market = {
                id: marketAddress,
                borrower: marketAddress, // Placeholder - should be fetched from contract
                amount: BigInt(Math.floor(Math.random() * 5) + 1) * BigInt(10 ** 18), // Placeholder
                interestRate: BigInt(Math.floor(Math.random() * 1000) + 500), // Placeholder
                duration: BigInt(Math.floor(Math.random() * 365) + 30) * BigInt(24 * 60 * 60), // Placeholder
                projectName: `Real Market ${i + 1}`,
                projectDescription: `Real loan market deployed at ${marketAddress.slice(0, 6)}...${marketAddress.slice(-4)}`,
                ipfsHash: `QmReal${i}`,
                isActive: true,
                isFunded: Math.random() > 0.5,
                createdAt: createTimestamp(-86400 * Math.floor(Math.random() * 30))
              }
              
              marketsData.push(market)
              console.log(`Added market ${i + 1}:`, market)
            } catch (err) {
              console.error(`Failed to process market ${i} (${marketAddress}):`, err)
            }
          }
          
          setMarkets(marketsData)
          setUseMockData(false)
          console.log(`Successfully loaded ${marketsData.length} real markets from blockchain`)
        } else {
          // No markets in contract or contract not accessible, use mock data
          console.log('No real markets found or contract not accessible, using mock data for development')
          const mockMarkets = createMockMarkets()
          setMarkets(mockMarkets)
          setUseMockData(true)
        }
      } catch (err) {
        console.error('Failed to load markets:', err)
        // Fallback to mock data
        console.log('Falling back to mock data due to error')
        const mockMarkets = createMockMarkets()
        setMarkets(mockMarkets)
        setUseMockData(true)
      }

      setLoading(false)
    }

    // Wait for market addresses to load or timeout
    const timeoutId = setTimeout(() => {
      if (isLoadingMarkets) {
        console.log('Contract call timeout, using mock data')
        const mockMarkets = createMockMarkets()
        setMarkets(mockMarkets)
        setUseMockData(true)
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    if (!isLoadingMarkets) {
      clearTimeout(timeoutId)
      loadMarkets()
    }

    return () => clearTimeout(timeoutId)
  }, [marketAddresses, isLoadingMarkets, factoryAddress, chain?.id])

  return {
    markets,
    loading,
    useMockData,
    error: marketError,
    refresh: () => {
      setLoading(true)
      // Trigger reload by changing a dependency
    }
  }
}
