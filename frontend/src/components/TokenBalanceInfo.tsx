'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { getContractConfig } from '@/lib/contracts'

export function TokenBalanceInfo() {
  const { address, isConnected, chain } = useAccount()
  
  const { address: contractAddress, abi } = getContractConfig('MockUSDT', chain?.id)
  
  // Read token data
  const { data: balance, isLoading: loadingBalance } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddress,
    },
  })

  const { data: symbol, isLoading: loadingSymbol } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'symbol',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: decimals, isLoading: loadingDecimals } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'decimals',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: name, isLoading: loadingName } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'name',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: totalSupply, isLoading: loadingSupply } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress,
    },
  })

  if (!isConnected || !address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Token Balance</h3>
        <p className="text-gray-300">Connect wallet to view token balances</p>
      </div>
    )
  }

  const isLoading = loadingBalance || loadingSymbol || loadingDecimals || loadingName || loadingSupply

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Token Balance</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 bg-gray-300/20 rounded"></div>
        </div>
      </div>
    )
  }

  const tokenDecimals = decimals as number || 6
  const formattedBalance = balance ? formatUnits(balance as bigint, tokenDecimals) : '0'
  const formattedSupply = totalSupply ? formatUnits(totalSupply as bigint, tokenDecimals) : '0'

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">💰 Token Balance</h3>
      
      <div className="space-y-4">
        {/* Token Info */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-2">{name as string}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300">Symbol:</p>
              <p className="text-white font-mono">{symbol as string}</p>
            </div>
            <div>
              <p className="text-gray-300">Decimals:</p>
              <p className="text-white">{tokenDecimals}</p>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-400/20">
          <p className="text-gray-300 text-sm mb-2">Your Balance</p>
          <p className="text-white font-bold text-3xl">
            {parseFloat(formattedBalance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-gray-300 text-lg">{symbol as string}</p>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Total Supply</p>
            <p className="text-white font-bold">
              {parseFloat(formattedSupply).toLocaleString('en-US')} {symbol as string}
            </p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-300 text-sm">Contract Address</p>
            <p className="text-white font-mono text-xs break-all">
              {contractAddress}
            </p>
          </div>
        </div>

        {/* Usage Info */}
        <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            💡 <strong>Usage:</strong> This token is used for lending and borrowing on CoreDev Zero. 
            Lenders deposit {symbol as string} to fund developer projects, and borrowers receive {symbol as string} for their project funding.
          </p>
        </div>

        {/* Balance Status */}
        {parseFloat(formattedBalance) > 0 ? (
          <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ <strong>Ready to lend!</strong> You have {symbol as string} balance available for lending to developer projects.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>No balance:</strong> You need {symbol as string} tokens to participate as a lender. 
              Get some tokens to start lending to developer projects.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
