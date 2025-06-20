'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'

interface UpdateProfileFormProps {
  onSuccess?: () => void
}

export function UpdateProfileForm({ onSuccess }: UpdateProfileFormProps) {
  const { address, isConnected, chain } = useAccount()
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    githubUsername: '',
    websiteUrl: '',
    skillsString: '',
    ipfsHash: ''
  })
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  const { address: contractAddress, abi } = getContractConfig('DeveloperProfile', chain?.id)

  // Read current profile data
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // Write contract hook
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Load current profile data when component mounts
  useEffect(() => {
    if (profileData && Array.isArray(profileData) && profileData.length >= 7) {
      const [name, bio, githubUsername, websiteUrl, skillsString, ipfsHash, isActive] = profileData
      if (isActive) {
        setCurrentProfile({
          name: name || '',
          bio: bio || '',
          githubUsername: githubUsername || '',
          websiteUrl: websiteUrl || '',
          skillsString: skillsString || '',
          ipfsHash: ipfsHash || ''
        })
        
        setFormData({
          name: name || '',
          bio: bio || '',
          githubUsername: githubUsername || '',
          websiteUrl: websiteUrl || '',
          skillsString: skillsString || '',
          ipfsHash: ipfsHash || ''
        })
      }
    }
  }, [profileData])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      setFeedback({ type: 'success', message: 'Profile updated successfully! 🎉' })
      setLoading(false)
      refetchProfile()
      onSuccess?.()
    }
  }, [isSuccess, onSuccess, refetchProfile])

  // Handle error
  useEffect(() => {
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to update profile: ' + error.message })
      setLoading(false)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      setFeedback({ type: 'error', message: 'Please connect your wallet' })
      return
    }

    if (!currentProfile) {
      setFeedback({ type: 'error', message: 'No profile found to update. Please create a profile first.' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'updateProfile',
        args: [
          formData.name,
          formData.bio,
          formData.githubUsername,
          formData.websiteUrl,
          formData.skillsString,
          formData.ipfsHash
        ],
      })
    } catch (err: any) {
      console.error('Update profile error:', err)
      setFeedback({ type: 'error', message: 'Failed to update profile: ' + (err.message || 'Unknown error') })
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">🔌</div>
        <p className="text-gray-300">Please connect your wallet to update your profile</p>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="text-center p-8">
        <div className="text-yellow-400 mb-4 text-4xl">👤</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Profile Found</h3>
        <p className="text-gray-300 mb-4">You need to create a profile first before updating it.</p>
        <button
          onClick={() => window.location.href = '/actions?tab=profile'}
          className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Create Profile
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 bg-white/5 rounded-lg border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">✏️ Update Developer Profile</h2>
        
        {/* Feedback Message */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border ${
            feedback.type === 'success' ? 'bg-green-500/10 border-green-400/20 text-green-300' :
            feedback.type === 'error' ? 'bg-red-500/10 border-red-400/20 text-red-300' :
            'bg-blue-500/10 border-blue-400/20 text-blue-300'
          }`}>
            {feedback.message}
          </div>
        )}
        
        {/* Current Profile Info */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Current Profile</h3>
          <div className="text-sm text-blue-300 space-y-1">
            <div><strong>Name:</strong> {currentProfile.name || 'Not set'}</div>
            <div><strong>GitHub:</strong> {currentProfile.githubUsername || 'Not set'}</div>
            <div><strong>Skills:</strong> {currentProfile.skillsString || 'Not set'}</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Developer Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="Your display name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-vertical"
              placeholder="Tell us about yourself..."
              required
            />
          </div>

          {/* GitHub Username */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              GitHub Username
            </label>
            <input
              type="text"
              name="githubUsername"
              value={formData.githubUsername}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="your-github-username"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="https://your-website.com"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skillsString"
              value={formData.skillsString}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="React, TypeScript, Solidity, Python"
            />
          </div>

          {/* IPFS Hash */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              IPFS Hash (optional)
            </label>
            <input
              type="text"
              name="ipfsHash"
              value={formData.ipfsHash}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="QmXXXXXXXXXX... (for additional profile data)"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isPending || isConfirming}
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isPending || isConfirming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>
                  {isPending ? 'Waiting for approval...' : 
                   isConfirming ? 'Updating profile...' : 'Processing...'}
                </span>
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>

        {/* Transaction Status */}
        {hash && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <div className="text-blue-300 text-sm">
              <div className="font-medium mb-1">Transaction Submitted</div>
              <div className="break-all">Hash: {hash}</div>
              {isConfirming && <div className="mt-1">⏳ Waiting for confirmation...</div>}
              {isSuccess && <div className="mt-1">✅ Profile updated successfully!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
