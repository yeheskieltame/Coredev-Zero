'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { formatEther } from 'viem'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Award } from 'lucide-react'

interface AnalyticsData {
  portfolioValue: number
  totalLoans: number
  activeNFTs: number
  repaymentRate: number
  platformActivity: Array<{
    date: string
    loans: number
    volume: number
    users: number
  }>
  portfolioHistory: Array<{
    date: string
    value: number
    nftCount: number
  }>
  riskDistribution: Array<{
    category: string
    value: number
    color: string
  }>
  topPerformers: Array<{
    developer: string
    returns: number
    riskScore: number
    totalLoans: number
  }>
}

export function AnalyticsDashboard() {
  const { address } = useAccount()
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeframe, address])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    
    // Simulate API call - replace with real analytics endpoint
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockData: AnalyticsData = {
      portfolioValue: 12500.75,
      totalLoans: 23,
      activeNFTs: 8,
      repaymentRate: 94.5,
      platformActivity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loans: Math.floor(Math.random() * 50) + 20,
        volume: Math.floor(Math.random() * 10000) + 5000,
        users: Math.floor(Math.random() * 100) + 50
      })),
      portfolioHistory: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 10000 + Math.random() * 5000 + i * 100,
        nftCount: Math.floor(Math.random() * 3) + 5 + Math.floor(i / 10)
      })),
      riskDistribution: [
        { category: 'Low Risk', value: 35, color: '#10B981' },
        { category: 'Medium Risk', value: 45, color: '#F59E0B' },
        { category: 'High Risk', value: 20, color: '#EF4444' }
      ],
      topPerformers: [
        { developer: 'alex_dev', returns: 18.5, riskScore: 85, totalLoans: 12 },
        { developer: 'sarah_codes', returns: 16.2, riskScore: 92, totalLoans: 8 },
        { developer: 'mike_blockchain', returns: 14.8, riskScore: 78, totalLoans: 15 },
        { developer: 'jane_smart', returns: 13.9, riskScore: 88, totalLoans: 6 },
        { developer: 'crypto_bob', returns: 12.1, riskScore: 73, totalLoans: 9 }
      ]
    }
    
    setAnalyticsData(mockData)
    setIsLoading(false)
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string
    value: string | number
    change?: number
    icon: any
    color?: string
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500'
    }

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center space-x-1 mt-1">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/20 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-300">Track your portfolio performance and platform metrics</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                timeframe === period
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Value"
          value={`$${analyticsData.portfolioValue.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Loans"
          value={analyticsData.totalLoans}
          change={8.3}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active NFTs"
          value={analyticsData.activeNFTs}
          change={-2.1}
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Repayment Rate"
          value={`${analyticsData.repaymentRate}%`}
          change={1.2}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.portfolioHistory}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#06B6D4" 
                fillOpacity={1}
                fill="url(#portfolioGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Platform Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.platformActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="loans" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Top Performers</h3>
          <div className="space-y-3">
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={performer.developer} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{performer.developer}</p>
                    <p className="text-gray-400 text-sm">{performer.totalLoans} loans</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{performer.returns}% APY</p>
                  <p className="text-gray-400 text-sm">Risk: {performer.riskScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Trading Volume</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyticsData.platformActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="volume" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
