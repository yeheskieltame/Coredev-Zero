'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'

interface GitHubVerificationProps {
  onSuccess?: () => void
}

export function GitHubVerification({ onSuccess }: GitHubVerificationProps) {
  const { address, isConnected, chain } = useAccount()
  const [githubUsername, setGithubUsername] = useState('')
  const [githubGist, setGithubGist] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<any>(null)

  const { address: profileAddress, abi: profileAbi } = getContractConfig('DeveloperProfile', chain?.id)
  const { address: oracleAddress, abi: oracleAbi } = getContractConfig('GitHubVerificationOracle', chain?.id)

  // Read current profile data
  const { data: profileData } = useReadContract({
    address: profileAddress,
    abi: profileAbi,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!profileAddress,
    },
  })

  // Read verification status
  const { data: verificationData, refetch: refetchVerification } = useReadContract({
    address: oracleAddress,
    abi: oracleAbi,
    functionName: 'getVerificationStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!oracleAddress,
    },
  })

  // Write contract hook for verification
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Load profile data
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
        
        if (githubUsername) {
          setGithubUsername(githubUsername)
        }
      }
    }
  }, [profileData])

  // Load verification status
  useEffect(() => {
    if (verificationData) {
      setVerificationStatus(verificationData)
    }
  }, [verificationData])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      setFeedback({ type: 'success', message: 'GitHub verification submitted! Please wait for oracle verification. 🎉' })
      setLoading(false)
      refetchVerification()
      onSuccess?.()
    }
  }, [isSuccess, onSuccess, refetchVerification])

  // Handle error
  useEffect(() => {
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to submit verification: ' + error.message })
      setLoading(false)
    }
  }, [error])

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      setFeedback({ type: 'error', message: 'Please connect your wallet' })
      return
    }

    if (!currentProfile) {
      setFeedback({ type: 'error', message: 'Please create a profile first before verifying GitHub.' })
      return
    }

    if (!githubUsername.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your GitHub username' })
      return
    }

    if (!githubGist.trim()) {
      setFeedback({ type: 'error', message: 'Please provide GitHub gist ID or proof' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      await writeContract({
        address: oracleAddress,
        abi: oracleAbi,
        functionName: 'requestVerification',
        args: [githubUsername, githubGist],
      })
    } catch (err: any) {
      console.error('GitHub verification error:', err)
      setFeedback({ type: 'error', message: 'Failed to submit verification: ' + (err.message || 'Unknown error') })
      setLoading(false)
    }
  }

  const generateVerificationText = () => {
    if (!address) return ''
    return `Verifying GitHub account for CoreDev Zero DeFi platform. Wallet: ${address}`
  }

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">🔌</div>
        <p className="text-gray-300">Please connect your wallet to verify your GitHub account</p>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="text-center p-8">
        <div className="text-yellow-400 mb-4 text-4xl">👤</div>
        <h3 className="text-xl font-semibold text-white mb-2">Profile Required</h3>
        <p className="text-gray-300 mb-4">You need to create a profile first before verifying your GitHub account.</p>
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
        <h2 className="text-2xl font-bold text-white mb-6">🔗 GitHub Verification</h2>
        
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

        {/* Current Status */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Current Status</h3>
          <div className="text-sm text-blue-300 space-y-1">
            <div><strong>Profile GitHub:</strong> {currentProfile.githubUsername || 'Not set'}</div>
            <div><strong>Verification:</strong> {
              verificationStatus ? (
                Array.isArray(verificationStatus) && verificationStatus[1] ? 
                  <span className="text-green-400">✅ Verified</span> : 
                  <span className="text-yellow-400">⏳ Pending/Not Verified</span>
              ) : (
                <span className="text-gray-400">❌ Not Started</span>
              )
            }</div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
          <h3 className="text-white font-semibold mb-3">📋 Verification Steps</h3>
          <div className="text-sm text-purple-300 space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span>Create a public GitHub gist with the verification text below</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Copy the gist ID from the URL (the random string after your username)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span>Paste the gist ID in the form below and submit for verification</span>
            </div>
          </div>
        </div>

        {/* Verification Text */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            📝 Copy this text to your GitHub gist:
          </label>
          <div className="p-3 bg-gray-900/50 border border-gray-600 rounded-lg">
            <code className="text-green-400 text-sm break-all">
              {generateVerificationText()}
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(generateVerificationText())}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            📋 Copy Text
          </button>
        </div>

        <form onSubmit={handleSubmitVerification} className="space-y-4">
          {/* GitHub Username */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              GitHub Username
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="your-github-username"
              required
            />
          </div>

          {/* GitHub Gist ID */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              GitHub Gist ID
            </label>
            <input
              type="text"
              value={githubGist}
              onChange={(e) => setGithubGist(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="e.g., 1234567890abcdef..."
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              The gist ID is the random string in your gist URL after your username
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isPending || isConfirming}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isPending || isConfirming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>
                  {isPending ? 'Waiting for approval...' : 
                   isConfirming ? 'Submitting verification...' : 'Processing...'}
                </span>
              </div>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </form>

        {/* Helper Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://gist.github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-500/10 border border-gray-400/20 rounded-lg hover:bg-gray-500/20 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-white font-medium">Create GitHub Gist</div>
            <div className="text-gray-400 text-sm">Open GitHub Gist</div>
          </a>
          
          <a
            href={`https://github.com/${githubUsername || 'your-username'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-500/10 border border-gray-400/20 rounded-lg hover:bg-gray-500/20 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="text-white font-medium">Your GitHub Profile</div>
            <div className="text-gray-400 text-sm">View your profile</div>
          </a>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <div className="text-blue-300 text-sm">
              <div className="font-medium mb-1">Transaction Submitted</div>
              <div className="break-all">Hash: {hash}</div>
              {isConfirming && <div className="mt-1">⏳ Waiting for confirmation...</div>}
              {isSuccess && <div className="mt-1">✅ Verification submitted successfully!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
