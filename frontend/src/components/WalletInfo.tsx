'use client'

import { useAccount, useBalance, useEnsName } from 'wagmi'
import { formatEther } from 'viem'

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: balance } = useBalance({ address })

  if (!isConnected || !address) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <p className="text-gray-300">Wallet not connected</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Wallet Information</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-gray-300 text-sm">Address:</p>
          <p className="text-white font-mono text-sm break-all">
            {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        
        <div>
          <p className="text-gray-300 text-sm">Network:</p>
          <p className="text-white">{chain?.name || 'Unknown'}</p>
        </div>
        
        <div>
          <p className="text-gray-300 text-sm">Balance:</p>
          <p className="text-white">
            {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
          </p>
        </div>
      </div>
    </div>
  )
}
