'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'

// Type definition for Profile struct from smart contract
interface Profile {
  githubHandle: string
  profileDataCID: string
  trustScore: bigint
  completedProjects: bigint
  successfulLoans: bigint
  defaultedLoans: bigint
  totalBorrowed: bigint
  totalRepaid: bigint
  isVerified: boolean
  isActive: boolean
  verificationTimestamp: bigint
  lastActivityTimestamp: bigint
}

interface UpdateProfileFormProps {
  onSuccess?: () => void
}

export function UpdateProfileForm({ onSuccess }: UpdateProfileFormProps) {
  const { address, isConnected, chain } = useAccount()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  const { address: contractAddress, abi } = getContractConfig('DeveloperProfile', chain?.id)

  // Read current profile data
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getDeveloperProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // Type cast profile data
  const profile = profileData as Profile | undefined
  const profileExists = profile && profile.githubHandle && profile.githubHandle.length > 0

  useEffect(() => {
    if (!profileExists) {
      setFeedback({ 
        type: 'info', 
        message: 'No profile found. Please create a profile first before updating.' 
      })
    } else {
      setFeedback(null)
    }
  }, [profileExists])

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">✏️ Update Profile</h3>
        <p className="text-gray-300">Please connect your wallet to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">✏️ Profile Information</h3>
      
      {feedback && (
        <div className={`p-4 rounded-lg mb-4 ${
          feedback.type === 'success' ? 'bg-green-500/10 border border-green-400/20 text-green-300' :
          feedback.type === 'error' ? 'bg-red-500/10 border border-red-400/20 text-red-300' :
          'bg-blue-500/10 border border-blue-400/20 text-blue-300'
        }`}>
          {feedback.message}
        </div>
      )}

      {profileExists && profile ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">GitHub Handle</h4>
              <p className="text-white">{profile.githubHandle}</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Trust Score</h4>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(Number(profile.trustScore) / 1000 * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-white">{Number(profile.trustScore)}/1000</span>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Completed Projects</h4>
              <p className="text-white">{Number(profile.completedProjects)}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Successful Loans</h4>
              <p className="text-white">{Number(profile.successfulLoans)}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Total Borrowed</h4>
              <p className="text-white">{Number(profile.totalBorrowed)} wei</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Total Repaid</h4>
              <p className="text-white">{Number(profile.totalRepaid)} wei</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Verification Status</h4>
              <p className={`${profile.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                {profile.isVerified ? '✅ Verified' : '⏳ Unverified'}
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-cyan-400 font-semibold mb-2">Account Status</h4>
              <p className={`${profile.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {profile.isActive ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="text-cyan-400 font-semibold mb-2">Profile Data CID</h4>
            <p className="text-white font-mono text-xs break-all">{profile.profileDataCID}</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">📝 Note</h4>
            <p className="text-gray-300 text-sm">
              Profile updates are currently managed through the smart contract's oracle system. 
              GitHub metrics and loan history are automatically updated when transactions occur.
              To update your GitHub handle or profile data, you would need to create a new profile.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">No profile found for your address.</p>
          <p className="text-sm text-gray-400">
            Please create a profile first using the "Create Profile" tab.
          </p>
        </div>
      )}
    </div>
  )
}
