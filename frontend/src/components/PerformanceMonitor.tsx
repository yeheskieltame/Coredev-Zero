'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, Clock, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { showToast } from '@/lib/contract-utils'

interface TransactionMetrics {
  id: string
  hash: string
  type: 'stake' | 'createProfile' | 'createLoan' | 'repay' | 'nftMint'
  gasUsed: number
  gasPrice: number
  duration: number
  success: boolean
  timestamp: Date
  errorMessage?: string
}

interface PerformanceStats {
  totalTransactions: number
  successRate: number
  averageGasUsed: number
  averageDuration: number
  totalGasCost: number
  errorCount: number
}

// Mock data - replace with real transaction monitoring
const mockTransactions: TransactionMetrics[] = [
  {
    id: '1',
    hash: '0x1234...5678',
    type: 'createProfile',
    gasUsed: 85000,
    gasPrice: 20,
    duration: 15000,
    success: true,
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    hash: '0x2345...6789',
    type: 'stake',
    gasUsed: 65000,
    gasPrice: 25,
    duration: 12000,
    success: true,
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: '3',
    hash: '0x3456...7890',
    type: 'createLoan',
    gasUsed: 120000,
    gasPrice: 30,
    duration: 25000,
    success: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    errorMessage: 'Insufficient collateral'
  },
  {
    id: '4',
    hash: '0x4567...8901',
    type: 'nftMint',
    gasUsed: 95000,
    gasPrice: 22,
    duration: 18000,
    success: true,
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  }
]

export function PerformanceMonitor() {
  const [transactions, setTransactions] = useState<TransactionMetrics[]>(mockTransactions)
  const [isExpanded, setIsExpanded] = useState(false)
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h')

  const calculateStats = useCallback((): PerformanceStats => {
    const now = Date.now()
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeframe]

    const filteredTxs = transactions.filter(
      tx => now - tx.timestamp.getTime() <= timeframeMs
    )

    const successfulTxs = filteredTxs.filter(tx => tx.success)
    
    return {
      totalTransactions: filteredTxs.length,
      successRate: filteredTxs.length > 0 ? (successfulTxs.length / filteredTxs.length) * 100 : 0,
      averageGasUsed: filteredTxs.reduce((sum, tx) => sum + tx.gasUsed, 0) / (filteredTxs.length || 1),
      averageDuration: filteredTxs.reduce((sum, tx) => sum + tx.duration, 0) / (filteredTxs.length || 1),
      totalGasCost: filteredTxs.reduce((sum, tx) => sum + (tx.gasUsed * tx.gasPrice), 0) / 1e9, // Convert to ETH
      errorCount: filteredTxs.filter(tx => !tx.success).length
    }
  }, [transactions, timeframe])

  const stats = calculateStats()

  const getTransactionColor = (type: TransactionMetrics['type']) => {
    switch (type) {
      case 'createProfile': return 'text-blue-400'
      case 'stake': return 'text-green-400'
      case 'createLoan': return 'text-purple-400'
      case 'repay': return 'text-orange-400'
      case 'nftMint': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatGasPrice = (gwei: number) => {
    return `${gwei} gwei`
  }

  // Monitor for performance issues
  useEffect(() => {
    const checkPerformanceIssues = () => {
      if (stats.successRate < 80 && stats.totalTransactions > 0) {
        showToast('warning', `Low success rate: ${stats.successRate.toFixed(1)}%`)
      }
      
      if (stats.averageDuration > 30000) { // > 30 seconds
        showToast('warning', 'Transactions taking longer than usual')
      }
      
      if (stats.totalGasCost > 0.1) { // > 0.1 ETH in gas
        showToast('info', `High gas usage: ${stats.totalGasCost.toFixed(4)} ETH`)
      }
    }

    const interval = setInterval(checkPerformanceIssues, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [stats])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new transaction
      if (Math.random() < 0.1) { // 10% chance
        const newTx: TransactionMetrics = {
          id: Date.now().toString(),
          hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          type: ['stake', 'createProfile', 'createLoan', 'repay', 'nftMint'][Math.floor(Math.random() * 5)] as any,
          gasUsed: 50000 + Math.floor(Math.random() * 100000),
          gasPrice: 15 + Math.floor(Math.random() * 20),
          duration: 5000 + Math.floor(Math.random() * 20000),
          success: Math.random() > 0.2, // 80% success rate
          timestamp: new Date(),
          errorMessage: Math.random() > 0.8 ? 'Random error for testing' : undefined
        }
        
        setTransactions(prev => [newTx, ...prev.slice(0, 19)]) // Keep only last 20
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Performance Monitor</h3>
            {stats.errorCount > 0 && (
              <div className="flex items-center space-x-1 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{stats.errorCount} errors</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {stats.successRate >= 90 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                {stats.successRate.toFixed(1)}% success
              </span>
            </div>
            <button className="text-gray-400 hover:text-white">
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6">
          {/* Timeframe Selector */}
          <div className="flex space-x-2">
            {(['1h', '24h', '7d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  timeframe === period
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Total Txs</span>
              </div>
              <p className="text-lg font-semibold text-white">{stats.totalTransactions}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Avg Duration</span>
              </div>
              <p className="text-lg font-semibold text-white">{formatDuration(stats.averageDuration)}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Gas Used</span>
              </div>
              <p className="text-lg font-semibold text-white">{Math.floor(stats.averageGasUsed).toLocaleString()}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Total Cost</span>
              </div>
              <p className="text-lg font-semibold text-white">{stats.totalGasCost.toFixed(4)} ETH</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Recent Transactions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border ${
                    tx.success 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getTransactionColor(tx.type)}`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-gray-400">{tx.hash}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDuration(tx.timestamp.getTime() - Date.now() + 60000)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Gas: {tx.gasUsed.toLocaleString()} @ {formatGasPrice(tx.gasPrice)}</span>
                    <span>Duration: {formatDuration(tx.duration)}</span>
                  </div>
                  
                  {tx.errorMessage && (
                    <p className="text-xs text-red-400 mt-1">{tx.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Optimization Tips</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              {stats.averageDuration > 20000 && (
                <li>• Consider using faster gas prices during peak hours</li>
              )}
              {stats.successRate < 95 && (
                <li>• Review transaction parameters to reduce failure rate</li>
              )}
              {stats.totalGasCost > 0.05 && (
                <li>• Batch multiple operations to save on gas costs</li>
              )}
              <li>• Use gas estimation tools for optimal pricing</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
