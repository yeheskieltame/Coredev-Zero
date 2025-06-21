'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { Github, CheckCircle, ArrowLeft, Shield } from 'lucide-react'
import GitHubVerification from './GitHubVerification'
import { GitHubVerificationData } from '@/lib/githubIntegration'

interface CreateProfileFormProps {
  onSuccess?: () => void
}

export function CreateProfileForm({ onSuccess }: CreateProfileFormProps) {
  const { chain } = useAccount()
  const [currentStep, setCurrentStep] = useState<'github' | 'profile'>('github')
  const [githubData, setGithubData] = useState<GitHubVerificationData | null>(null)
  const [skipGitHub, setSkipGitHub] = useState(false)
  const [formData, setFormData] = useState({
    githubHandle: '',
    profileDataCID: '',
    skillTags: '',
    bio: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { address: contractAddress, abi } = getContractConfig('MarketFactory', chain?.id)
  
  const { 
    data: hash,
    error,
    isPending,
    writeContract 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const handleGitHubVerificationComplete = (data: GitHubVerificationData) => {
    setGithubData(data)
    setFormData(prev => ({
      ...prev,
      githubHandle: data.githubHandle,
      skillTags: data.topLanguages.join(', ')
    }))
    setCurrentStep('profile')
  }

  const handleSkipGitHub = () => {
    setSkipGitHub(true)
    setCurrentStep('profile')
  }

  const handleBackToGitHub = () => {
    setCurrentStep('github')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.githubHandle.trim()) {
      alert('GitHub handle is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create enhanced profile data with GitHub information
      const profileData = {
        bio: formData.bio,
        skillTags: formData.skillTags.split(',').map(tag => tag.trim()),
        portfolio: [],
        socialLinks: {
          github: `https://github.com/${formData.githubHandle}`
        },
        githubVerification: githubData ? {
          verified: githubData.verified,
          trustScore: githubData.trustScore,
          publicRepos: githubData.publicRepos,
          followers: githubData.followers,
          accountAgeMonths: githubData.accountAgeMonths,
          totalContributions: githubData.totalContributions,
          topLanguages: githubData.topLanguages
        } : null,
        lastUpdated: Date.now()
      }
      
      // In production, this would upload to IPFS
      const mockCID = `QmProfile${Date.now()}`
      
      // Convert skill tags to bytes32[] format for smart contract
      const skillTagsBytes32 = formData.skillTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10) // Limit to 10 skills
        .map(tag => {
          // Convert string to bytes32 (simplified - in production use proper conversion)
          const bytes = new TextEncoder().encode(tag.substring(0, 31))
          const hex = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0')
          return hex
        })
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'createProfile',
        args: [
          formData.githubHandle.trim(),
          mockCID,
          skillTagsBytes32,
          formData.bio || 'Developer on CoreDev Zero'
        ],
      })
    } catch (err) {
      console.error('Profile creation error:', err)
      setIsSubmitting(false)
    }
  }

  // Reset form and call success callback when transaction is confirmed
  if (isConfirmed && isSubmitting) {
    setIsSubmitting(false)
    setFormData({
      githubHandle: '',
      profileDataCID: '',
      skillTags: '',
      bio: ''
    })
    onSuccess?.()
  }

  // Show GitHub verification step first
  if (currentStep === 'github') {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <GitHubVerification
          onVerificationComplete={handleGitHubVerificationComplete}
          onSkip={handleSkipGitHub}
          useMockData={true}
        />
      </div>
    )
  }

  // Show profile creation form after GitHub verification
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">👤 Create Developer Profile</h3>
        <button
          onClick={handleBackToGitHub}
          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to GitHub
        </button>
      </div>

      {/* GitHub Data Summary */}
      {githubData && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
          <div className="flex items-center mb-2">
            <Github className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-green-400 font-medium">GitHub Verified</span>
            {githubData.verified && <CheckCircle className="w-4 h-4 ml-2 text-green-400" />}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Handle:</span>
              <span className="text-white ml-2">{githubData.githubHandle}</span>
            </div>
            <div>
              <span className="text-gray-400">Repos:</span>
              <span className="text-white ml-2">{githubData.publicRepos}</span>
            </div>
            <div>
              <span className="text-gray-400">Trust Score:</span>
              <span className="text-cyan-400 ml-2 font-bold">{githubData.trustScore}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 ${githubData.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                {githubData.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      )}

      {skipGitHub && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-yellow-400">Creating basic profile without GitHub verification</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            You can verify your GitHub account later to improve your trust score
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GitHub Handle (read-only if verified) */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            GitHub Handle *
          </label>
          <input
            type="text"
            value={formData.githubHandle}
            onChange={(e) => setFormData({...formData, githubHandle: e.target.value})}
            placeholder="your-github-username"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            required
            disabled={isPending || isConfirming || isSubmitting || !!githubData}
            readOnly={!!githubData}
          />
          <p className="text-xs text-gray-400 mt-1">
            {githubData ? 
              'This is your verified GitHub handle' : 
              'This will be used for GitHub verification and trust score calculation'
            }
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell us about yourself and your development experience..."
            rows={3}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            disabled={isPending || isConfirming || isSubmitting}
          />
        </div>

        {/* Skill Tags */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Skills (comma separated)
          </label>
          <input
            type="text"
            value={formData.skillTags}
            onChange={(e) => setFormData({...formData, skillTags: e.target.value})}
            placeholder="JavaScript, React, Solidity, Python"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            disabled={isPending || isConfirming || isSubmitting}
          />
          {githubData && githubData.topLanguages.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Suggested from GitHub: {githubData.topLanguages.join(', ')}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isConfirming || isSubmitting || !formData.githubHandle.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && 'Preparing Transaction...'}
          {isConfirming && 'Creating Profile...'}
          {isSubmitting && !isPending && !isConfirming && 'Processing...'}
          {!isPending && !isConfirming && !isSubmitting && 'Create Profile'}
        </button>

        {/* Transaction Status */}
        {hash && (
          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              📝 Transaction submitted: 
              <a 
                href={`https://scan.test2.btcs.network/tx/${hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline ml-1 font-mono text-xs"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
            <p className="text-red-300 text-sm">
              ❌ Transaction failed: {error.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ Profile created successfully! Your developer profile is now active.
            </p>
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
        <p className="text-purple-300 text-sm">
          💡 <strong>Next Steps:</strong> After creating your profile, you&apos;ll be able to create markets, 
          request loans, and participate in the CoreDev Zero ecosystem. 
          {!githubData && ' Consider verifying your GitHub account to increase your trust score.'}
        </p>
      </div>
    </div>
  )
}
