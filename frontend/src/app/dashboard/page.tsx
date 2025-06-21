'use client'

import { Header } from '@/components/Header'
import { DeveloperDashboard } from '@/components/DeveloperDashboard'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <DeveloperDashboard />
      </main>
    </div>
  )
}
