'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { formatEther } from 'viem'

interface ContractEvent {
  id: string
  type: 'profile' | 'market' | 'stake' | 'nft' | 'marketplace'
  title: string
  description: string
  timestamp: number
  txHash: string
  address: string
}

export function EventListener() {
  const { address, chain } = useAccount()
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [isListening, setIsListening] = useState(false)

  const developerProfileConfig = getContractConfig('DeveloperProfile', chain?.id)
  const marketFactoryConfig = getContractConfig('MarketFactory', chain?.id)
  const stakingVaultConfig = getContractConfig('StakingVault', chain?.id)
  const loanPositionNFTConfig = getContractConfig('LoanPositionNFT', chain?.id)
  const marketplaceConfig = getContractConfig('LoanPositionMarketplace', chain?.id)

  // Simulate events for demo
  useEffect(() => {
    if (isListening && address) {
      const interval = setInterval(() => {
        const eventTypes = ['profile', 'market', 'stake', 'nft', 'marketplace'] as const
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        
        const eventTitles = {
          profile: '👤 Profile Created',
          market: '🏪 Market Created', 
          stake: '🔒 ETH Staked',
          nft: '🎨 NFT Transferred',
          marketplace: '💰 NFT Listed'
        }
        
        const eventDescriptions = {
          profile: `New developer profile created`,
          market: `New loan market created for ${(Math.random() * 5 + 1).toFixed(1)} ETH`,
          stake: `${(Math.random() * 2 + 0.5).toFixed(2)} ETH staked`,
          nft: `Loan Position NFT #${Math.floor(Math.random() * 100)} transferred`,
          marketplace: `NFT #${Math.floor(Math.random() * 100)} listed for ${(Math.random() * 1000 + 500).toFixed(0)} USDT`
        }
        
        const newEvent: ContractEvent = {
          id: `${randomType}-${Date.now()}-${Math.random()}`,
          type: randomType,
          title: eventTitles[randomType],
          description: eventDescriptions[randomType],
          timestamp: Date.now(),
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          address: `0x${Math.random().toString(16).substr(2, 40)}`
        }
        
        addEvent(newEvent)
      }, Math.random() * 10000 + 5000) // Random interval 5-15 seconds
      
      return () => clearInterval(interval)
    }
  }, [isListening, address])

  const addEvent = (newEvent: ContractEvent) => {
    setEvents(prev => {
      // Avoid duplicates
      if (prev.some(event => event.id === newEvent.id)) return prev
      
      // Keep only last 50 events
      const updated = [newEvent, ...prev].slice(0, 50)
      return updated
    })
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newEvent.title, {
        body: newEvent.description,
        icon: '/logo.png'
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      requestNotificationPermission()
    }
  }

  const getEventIcon = (type: ContractEvent['type']) => {
    switch (type) {
      case 'profile': return '👤'
      case 'market': return '🏪'
      case 'stake': return '🔒'
      case 'nft': return '🎨'
      case 'marketplace': return '💰'
      default: return '📡'
    }
  }

  const getEventColor = (type: ContractEvent['type']) => {
    switch (type) {
      case 'profile': return 'border-blue-400/30 bg-blue-500/10'
      case 'market': return 'border-green-400/30 bg-green-500/10'
      case 'stake': return 'border-purple-400/30 bg-purple-500/10'
      case 'nft': return 'border-pink-400/30 bg-pink-500/10'
      case 'marketplace': return 'border-yellow-400/30 bg-yellow-500/10'
      default: return 'border-gray-400/30 bg-gray-500/10'
    }
  }

  useEffect(() => {
    if (address) {
      setIsListening(true)
      requestNotificationPermission()
    }
  }, [address])

  // Real contract event listeners
  useWatchContractEvent({
    ...developerProfileConfig,
    eventName: 'ProfileCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args && address) {
          const event: ContractEvent = {
            id: `profile-${log.transactionHash}-${log.logIndex}`,
            type: 'profile',
            title: '👤 Profile Created',
            description: `Developer profile created by ${log.args.developer || 'unknown'}`,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
            address: log.args.developer || ''
          }
          addEvent(event)
        }
      })
    },
    enabled: isListening && !!address,
  })

  useWatchContractEvent({
    ...marketFactoryConfig,
    eventName: 'MarketCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args && address) {
          const event: ContractEvent = {
            id: `market-${log.transactionHash}-${log.logIndex}`,
            type: 'market',
            title: '🏪 Market Created',
            description: `New loan market created`,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
            address: log.args.market || ''
          }
          addEvent(event)
        }
      })
    },
    enabled: isListening && !!address,
  })

  useWatchContractEvent({
    ...stakingVaultConfig,
    eventName: 'Staked',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args && address) {
          const amount = log.args.amount ? formatEther(log.args.amount) : '0'
          const event: ContractEvent = {
            id: `stake-${log.transactionHash}-${log.logIndex}`,
            type: 'stake',
            title: '🔒 ETH Staked',
            description: `${amount} ETH staked by ${log.args.user || 'unknown'}`,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
            address: log.args.user || ''
          }
          addEvent(event)
        }
      })
    },
    enabled: isListening && !!address,
  })

  useWatchContractEvent({
    ...loanPositionNFTConfig,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args && address) {
          const tokenId = log.args.tokenId ? log.args.tokenId.toString() : '0'
          const event: ContractEvent = {
            id: `nft-${log.transactionHash}-${log.logIndex}`,
            type: 'nft',
            title: '🎨 NFT Transferred',
            description: `Loan Position NFT #${tokenId} transferred from ${log.args.from || 'unknown'} to ${log.args.to || 'unknown'}`,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
            address: log.args.to || ''
          }
          addEvent(event)
        }
      })
    },
    enabled: isListening && !!address,
  })

  useWatchContractEvent({
    ...marketplaceConfig,
    eventName: 'ListingCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args && address) {
          const price = log.args.price ? formatEther(log.args.price) : '0'
          const tokenId = log.args.tokenId ? log.args.tokenId.toString() : '0'
          const event: ContractEvent = {
            id: `marketplace-${log.transactionHash}-${log.logIndex}`,
            type: 'marketplace',
            title: '💰 NFT Listed',
            description: `NFT #${tokenId} listed for ${price} ETH`,
            timestamp: Date.now(),
            txHash: log.transactionHash || '',
            address: log.args.seller || ''
          }
          addEvent(event)
        }
      })
    },
    enabled: isListening && !!address,
  })

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <p className="text-gray-300">Connect wallet to view real-time events</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">📡 Live Events</h3>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm">{isListening ? 'Listening' : 'Stopped'}</span>
          </div>
          
          <button
            onClick={toggleListening}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              isListening 
                ? 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30' 
                : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
            }`}
          >
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-2">No events yet</p>
          <p className="text-gray-400 text-sm">
            {isListening ? 'Listening for blockchain events...' : 'Start listening to see real-time updates'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-xl">{getEventIcon(event.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-semibold text-sm">{event.title}</h4>
                    <span className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Address: {`${event.address.slice(0, 6)}...${event.address.slice(-4)}`}</span>
                    <a
                      href={`https://etherscan.io/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View Tx ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {(['profile', 'market', 'stake', 'nft', 'marketplace'] as const).map((type) => {
            const count = events.filter(e => e.type === type).length
            return (
              <div key={type} className="space-y-1">
                <div className="text-lg">{getEventIcon(type)}</div>
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-xs text-gray-400 capitalize">{type}</div>
              </div>
            )
          })}
          <div className="space-y-1">
            <div className="text-lg">📊</div>
            <div className="text-xl font-bold text-white">{events.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Recent activity summary */}
      {events.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-cyan-400">⚡</span>
            <h4 className="text-white font-semibold text-sm">Recent Activity</h4>
          </div>
          <p className="text-gray-300 text-sm">
            Last event: {events[0]?.title} • {new Date(events[0]?.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
