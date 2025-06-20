'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'

interface CreateProfileFormProps {
  onSuccess?: () => void
}

export function CreateProfileForm({ onSuccess }: CreateProfileFormProps) {
  const { address, chain } = useAccount()
  const [formData, setFormData] = useState({
    githubHandle: '',
    profileDataCID: '',
    skillTags: '',
    bio: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { address: contractAddress, abi } = getContractConfig('DeveloperProfile', chain?.id)
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.githubHandle.trim()) {
      alert('GitHub handle is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create mock IPFS CID for profile data
      const profileData = {
        bio: formData.bio,
        skillTags: formData.skillTags.split(',').map(tag => tag.trim()),
        portfolio: [],
        socialLinks: {},
        lastUpdated: Date.now()
      }
      
      // In production, this would upload to IPFS
      const mockCID = `QmProfile${Date.now()}`
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'createProfile',
        args: [
          formData.githubHandle.trim(),
          mockCID,
          [], // skillTags as bytes32[] - simplified for now
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

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">👤 Create Developer Profile</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GitHub Handle */}
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
            disabled={isPending || isConfirming || isSubmitting}
          />
          <p className="text-xs text-gray-400 mt-1">
            This will be used for GitHub verification and trust score calculation
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
                href={`https://localhost:8545/tx/${hash}`} 
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
          💡 <strong>Next Steps:</strong> After creating your profile, you can request GitHub verification 
          to increase your trust score and unlock better loan terms.
        </p>
      </div>
    </div>
  )
}
