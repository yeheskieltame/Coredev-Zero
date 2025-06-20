'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-white text-2xl font-bold">CoreDev Zero</h1>
        </div>
        <ConnectButton />
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Decentralized
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Developer </span>
            Lending Protocol
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform lending protokol DeFi yang revolusioner untuk developer dan tech entrepreneur. 
            Ubah reputasi GitHub Anda menjadi akses kredit yang fair dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a 
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Mulai Lending
            </a>
            <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
              Jelajahi Dokumentasi
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-2">100%</h3>
              <p className="text-gray-300">Test Coverage</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-2">51</h3>
              <p className="text-gray-300">Passing Tests</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-2">🚀</h3>
              <p className="text-gray-300">Production Ready</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Fitur Utama Platform</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">GitHub Integration</h3>
              <p className="text-gray-300">Verifikasi otomatis dan analisis metrics dari GitHub API untuk membangun trust score berbasis aktivitas developer.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Risk Assessment</h3>
              <p className="text-gray-300">Risk engine bertenaga AI yang menganalisis multi-factor untuk memberikan suku bunga yang akurat dan fair.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">NFT Marketplace</h3>
              <p className="text-gray-300">Tokenisasi loan positions menjadi NFT yang dapat diperdagangkan di secondary marketplace untuk likuiditas.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
