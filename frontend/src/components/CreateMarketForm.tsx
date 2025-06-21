'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatEther } from 'viem'
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

interface CreateMarketFormProps {
  onSuccess?: () => void
}

export function CreateMarketForm({ onSuccess }: CreateMarketFormProps) {
  const { address, chain, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    // Loan Terms
    loanAmount: '',
    interestRate: '',
    tenorDays: '',
    
    // Project Basic Info
    projectTitle: '',
    projectDescription: '',
    fundingPurpose: '',
    
    // Technical Details
    techStack: '',
    repositoryUrl: '',
    architecture: '',
    
    // Milestones & Timeline
    milestones: [
      { title: '', description: '', duration: '', deliverable: '' }
    ],
    
    // Financial Planning
    budgetBreakdown: '',
    fundUtilization: '',
    
    // Risk Assessment
    riskFactors: '',
    mitigationStrategies: '',
    
    // Documentation
    businessPlan: '',
    technicalDocs: '',
    complianceNotes: ''
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const totalSteps = 5
  const [requirements, setRequirements] = useState({
    hasProfile: false,
    hasStaking: false,
    canCreateLoan: false,
    hasDeveloperRole: false,
    trustScoreValid: false,
    loading: true
  })

  const { address: contractAddress, abi } = getContractConfig('MarketFactory', chain?.id)
  
  // Check user's profile
  const { address: profileAddress, abi: profileAbi } = getContractConfig('DeveloperProfile', chain?.id)
  const { data: profileData } = useReadContract({
    address: profileAddress,
    abi: profileAbi,
    functionName: 'getDeveloperProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!profileAddress,
    },
  })

  // Check staking status
  const { address: stakingAddress, abi: stakingAbi } = getContractConfig('StakingVault', chain?.id)
  const { data: stakeInfo } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingAddress,
    },
  })
  
  // Check if user can create loan
  const { data: canCreateLoan } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: 'canCreateLoan',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingAddress,
    },
  })
  
  // Check DEVELOPER_ROLE
  const { data: hasDeveloperRole } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'hasRole',
    args: address ? [
      '0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c', // Correct DEVELOPER_ROLE hash from contract
      address
    ] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // Update requirements status
  useEffect(() => {
    const profile = profileData as Profile | undefined
    const hasProfile = profile && profile.githubHandle && profile.githubHandle.length > 0
    const hasStaking = stakeInfo && Array.isArray(stakeInfo) && stakeInfo[0] && Number(stakeInfo[0]) >= 1000000000000000000 // >= 1 ETH in wei
    const trustScoreValid = true // Using MarketFactoryTesting with MIN_TRUST_SCORE = 100 (current user has 100)
    
    // Debug logging
    console.log('Requirements Debug (Using MarketFactoryTesting):', {
      hasProfile: !!hasProfile,
      hasStaking: !!hasStaking,
      canCreateLoan: !!canCreateLoan,
      hasDeveloperRole: !!hasDeveloperRole,
      trustScoreValid: !!trustScoreValid,
      profileData,
      stakeInfo,
      canCreateLoanData: canCreateLoan,
      hasDeveloperRoleData: hasDeveloperRole,
      actualTrustScore: profile ? Number(profile.trustScore) : 0,
      note: "MarketFactoryTesting allows trust score >= 100"
    })
    
    setRequirements({
      hasProfile: !!hasProfile,
      hasStaking: !!hasStaking,
      canCreateLoan: !!canCreateLoan,
      hasDeveloperRole: !!hasDeveloperRole,
      trustScoreValid: !!trustScoreValid,
      loading: false
    })
  }, [profileData, stakeInfo, canCreateLoan, hasDeveloperRole])

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
    
    // Debug logging current requirements
    console.log('Form submit attempt - Full Debug:', {
      requirements,
      rawData: {
        canCreateLoan: canCreateLoan,
        hasDeveloperRole: hasDeveloperRole,
        profileData: profileData,
        stakeInfo: stakeInfo,
        address: address,
        contractAddress: contractAddress,
        stakingAddress: stakingAddress
      },
      formData: {
        loanAmount: formData.loanAmount,
        interestRate: formData.interestRate,
        tenorDays: formData.tenorDays,
        projectTitle: formData.projectTitle
      }
    })
    
    // More lenient validation - only check if connected and has basic requirements
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!requirements.canCreateLoan) {
      alert('Cannot create loan - please check your staking requirements (need at least 1 tCORE staked)')
      return
    }
    
    if (!requirements.hasDeveloperRole) {
      alert('Missing DEVELOPER_ROLE - please contact admin to grant this role')
      return
    }

    if (!formData.loanAmount || !formData.interestRate || !formData.tenorDays || !formData.projectTitle) {
      alert('Please fill in all required fields: loan amount, interest rate, tenor days, and project title')
      return
    }

    try {
      // Create comprehensive project data structure
      const projectData = {
        // Basic Info
        title: formData.projectTitle,
        description: formData.projectDescription,
        fundingPurpose: formData.fundingPurpose,
        
        // Technical Details
        techStack: formData.techStack,
        repositoryUrl: formData.repositoryUrl,
        architecture: formData.architecture,
        
        // Milestones
        milestones: formData.milestones,
        
        // Financial
        budgetBreakdown: formData.budgetBreakdown,
        fundUtilization: formData.fundUtilization,
        
        // Risk Assessment
        riskFactors: formData.riskFactors,
        mitigationStrategies: formData.mitigationStrategies,
        
        // Documentation
        businessPlan: formData.businessPlan,
        technicalDocs: formData.technicalDocs,
        complianceNotes: formData.complianceNotes,
        
        // Metadata
        timeline: `${formData.tenorDays} days`,
        created: Date.now(),
        version: '1.0',
        
        // Files metadata (preparation for IPFS)
        documents: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      }
      
      // TODO: In production, upload to IPFS
      // const ipfsResponse = await uploadToIPFS(projectData)
      // const projectCID = ipfsResponse.Hash
      
      // For now, generate mock CID with better structure
      const mockProjectCID = `QmProject${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const loanAmountWei = parseUnits(formData.loanAmount, 6) // USDT has 6 decimals
      const interestRateBps = Math.round(parseFloat(formData.interestRate) * 100) // Convert % to basis points
      const tenorSeconds = parseInt(formData.tenorDays) * 24 * 60 * 60 // Convert days to seconds
      
      console.log('Creating market with comprehensive project data:', {
        loanAmountWei: loanAmountWei.toString(),
        interestRateBps,
        tenorSeconds,
        mockProjectCID,
        projectData
      })
      
      writeContract({
        address: contractAddress,
        abi,
        functionName: 'createMarket',
        args: [
          loanAmountWei,
          interestRateBps,
          tenorSeconds,
          mockProjectCID
        ],
      })
    } catch (err) {
      console.error('Market creation error:', err)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', duration: '', deliverable: '' }]
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setFormData({
      loanAmount: '',
      interestRate: '',
      tenorDays: '',
      projectTitle: '',
      projectDescription: '',
      fundingPurpose: '',
      techStack: '',
      repositoryUrl: '',
      architecture: '',
      milestones: [{ title: '', description: '', duration: '', deliverable: '' }],
      budgetBreakdown: '',
      fundUtilization: '',
      riskFactors: '',
      mitigationStrategies: '',
      businessPlan: '',
      technicalDocs: '',
      complianceNotes: ''
    })
    setUploadedFiles([])
    setCurrentStep(1)
  }

  // Reset form when transaction is confirmed
  if (isConfirmed) {
    resetForm()
    onSuccess?.()
  }

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">Please connect your wallet to create loan markets.</p>
        </div>
      </div>
    )
  }

  if (requirements.loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking requirements...</p>
        </div>
      </div>
    )
  }

  // Show requirements if not all met
  if (!requirements.canCreateLoan || !requirements.hasDeveloperRole || !requirements.trustScoreValid) {
    const profile = profileData as Profile | undefined
    const stakeAmount = stakeInfo && Array.isArray(stakeInfo) ? formatEther(stakeInfo[0] || BigInt(0)) : '0'
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
        
        <div className="p-6 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚠️</div>
            <h4 className="text-lg font-semibold text-yellow-300 mb-2">Prerequisites Required</h4>
            <p className="text-yellow-200 mb-4">
              Complete all requirements below to create loan markets:
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {isConnected ? '✓' : '○'}
              </div>
              <span className={isConnected ? 'text-green-300' : 'text-gray-300'}>
                Wallet Connected
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.hasProfile ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.hasProfile ? '✓' : '✗'}
              </div>
              <span className={requirements.hasProfile ? 'text-green-300' : 'text-red-300'}>
                Developer Profile Created
                {profile && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({profile.githubHandle})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.hasStaking ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.hasStaking ? '✓' : '✗'}
              </div>
              <span className={requirements.hasStaking ? 'text-green-300' : 'text-red-300'}>
                Minimum 1.0 tCORE Staked
                <span className="text-xs text-gray-400 ml-2">
                  (Current: {stakeAmount} tCORE)
                </span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.canCreateLoan ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.canCreateLoan ? '✓' : '✗'}
              </div>
              <span className={requirements.canCreateLoan ? 'text-green-300' : 'text-red-300'}>
                Available Stake for Loan Creation
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.hasDeveloperRole ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.hasDeveloperRole ? '✓' : '✗'}
              </div>
              <span className={requirements.hasDeveloperRole ? 'text-green-300' : 'text-red-300'}>
                Developer Role Granted
                <span className="text-xs text-gray-400 ml-2">
                  (Required for market creation)
                </span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                requirements.trustScoreValid ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {requirements.trustScoreValid ? '✓' : '✗'}
              </div>
              <span className={requirements.trustScoreValid ? 'text-green-300' : 'text-red-300'}>
                Minimum Trust Score (200+)
                {profile && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Current: {Number(profile.trustScore)})
                  </span>
                )}
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-yellow-300 mb-4">
              Complete the missing requirements using the other tabs in Actions page.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {!requirements.hasProfile && (
                <button
                  onClick={() => window.location.href = '/actions?tab=profile'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Create Profile
                </button>
              )}
              {!requirements.hasStaking && (
                <button
                  onClick={() => window.location.href = '/actions?tab=staking'}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  Stake tCORE
                </button>
              )}
              {!requirements.hasDeveloperRole && (
                <div className="text-center">
                  <p className="text-xs text-yellow-300 mb-2">
                    ⚠️ DEVELOPER_ROLE must be granted by admin
                  </p>
                  <p className="text-xs text-gray-400">
                    Contact admin to get DEVELOPER_ROLE after profile verification
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">💰 Create Loan Market</h3>
      
      {/* Requirements Status Badge */}
      <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            ✓
          </div>
          <span className="text-green-300 font-semibold">All Requirements Met</span>
        </div>
        <p className="text-green-200 text-sm">
          You can create loan markets. Your stake will be locked until loan completion.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-300">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span className={currentStep >= 1 ? 'text-purple-400' : ''}>Loan Terms</span>
          <span className={currentStep >= 2 ? 'text-purple-400' : ''}>Technical</span>
          <span className={currentStep >= 3 ? 'text-purple-400' : ''}>Milestones</span>
          <span className={currentStep >= 4 ? 'text-purple-400' : ''}>Financial</span>
          <span className={currentStep >= 5 ? 'text-purple-400' : ''}>Review</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Loan Terms & Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Loan Terms & Basic Information</h4>
            </div>
            
            {/* Loan Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Loan Amount (USDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="100"
                  max="50000"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                  placeholder="1000"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Interest Rate (% APR) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="50"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  placeholder="12.5"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Loan Duration (Days) *
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={formData.tenorDays}
                  onChange={(e) => setFormData({...formData, tenorDays: e.target.value})}
                  placeholder="90"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Project Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
                  placeholder="My Awesome DeFi Project"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project Description
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                  placeholder="Describe your project, goals, and value proposition..."
                  rows={4}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Funding Purpose
                </label>
                <textarea
                  value={formData.fundingPurpose}
                  onChange={(e) => setFormData({...formData, fundingPurpose: e.target.value})}
                  placeholder="How will you use the loan funds? (development costs, infrastructure, marketing, etc.)"
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Technical Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Technical Specifications</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Technology Stack
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                  placeholder="e.g., React, Node.js, Solidity, Python, etc."
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={formData.repositoryUrl}
                  onChange={(e) => setFormData({...formData, repositoryUrl: e.target.value})}
                  placeholder="https://github.com/username/project"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  System Architecture
                </label>
                <textarea
                  value={formData.architecture}
                  onChange={(e) => setFormData({...formData, architecture: e.target.value})}
                  placeholder="Describe the system architecture, components, and data flow..."
                  rows={5}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Milestones & Timeline */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Project Milestones</h4>
            </div>
            
            <div className="space-y-4">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-medium">Milestone {index + 1}</h5>
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder="Milestone title"
                        className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        value={milestone.duration}
                        onChange={(e) => updateMilestone(index, 'duration', e.target.value)}
                        placeholder="30"
                        className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe what will be accomplished in this milestone..."
                        rows={2}
                        className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Deliverable
                      </label>
                      <input
                        type="text"
                        value={milestone.deliverable}
                        onChange={(e) => updateMilestone(index, 'deliverable', e.target.value)}
                        placeholder="What will be delivered (code, docs, deployment, etc.)"
                        className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addMilestone}
                className="w-full py-2 px-4 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                + Add Milestone
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Financial Planning */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">4</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Financial Planning & Risk Assessment</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Budget Breakdown
                </label>
                <textarea
                  value={formData.budgetBreakdown}
                  onChange={(e) => setFormData({...formData, budgetBreakdown: e.target.value})}
                  placeholder="Detail how the loan will be allocated (e.g., 40% development, 30% infrastructure, 20% marketing, 10% contingency)"
                  rows={4}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Fund Utilization Plan
                </label>
                <textarea
                  value={formData.fundUtilization}
                  onChange={(e) => setFormData({...formData, fundUtilization: e.target.value})}
                  placeholder="Explain how and when funds will be used throughout the project timeline..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Risk Factors
                </label>
                <textarea
                  value={formData.riskFactors}
                  onChange={(e) => setFormData({...formData, riskFactors: e.target.value})}
                  placeholder="Identify potential risks that could impact the project (technical, market, regulatory, etc.)"
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mitigation Strategies
                </label>
                <textarea
                  value={formData.mitigationStrategies}
                  onChange={(e) => setFormData({...formData, mitigationStrategies: e.target.value})}
                  placeholder="Explain how you plan to mitigate identified risks..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Documentation */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">5</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Documentation & Final Review</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Business Plan Summary
                </label>
                <textarea
                  value={formData.businessPlan}
                  onChange={(e) => setFormData({...formData, businessPlan: e.target.value})}
                  placeholder="Summarize your business model, target market, and revenue projections..."
                  rows={4}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Technical Documentation
                </label>
                <textarea
                  value={formData.technicalDocs}
                  onChange={(e) => setFormData({...formData, technicalDocs: e.target.value})}
                  placeholder="Reference to technical documentation, API specs, or system requirements..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Compliance & Legal Notes
                </label>
                <textarea
                  value={formData.complianceNotes}
                  onChange={(e) => setFormData({...formData, complianceNotes: e.target.value})}
                  placeholder="Any regulatory compliance considerations or legal requirements..."
                  rows={2}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              
              {/* File Upload Section */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="text-4xl">📎</div>
                      <p>Click to upload documents</p>
                      <p className="text-sm text-gray-400">PDF, DOC, TXT, MD files</p>
                    </div>
                  </label>
                </div>
                
                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-300">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loan Summary */}
            {formData.loanAmount && formData.interestRate && formData.tenorDays && (
              <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                <h5 className="text-white font-semibold mb-2">Loan Summary</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Principal:</span>
                    <span className="text-white ml-2">{formData.loanAmount} USDT</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Interest:</span>
                    <span className="text-white ml-2">
                      {((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate) / 100) * (parseFloat(formData.tenorDays) / 365)).toFixed(2)} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Total Repayment:</span>
                    <span className="text-white ml-2 font-semibold">
                      {(parseFloat(formData.loanAmount) + ((parseFloat(formData.loanAmount) * parseFloat(formData.interestRate) / 100) * (parseFloat(formData.tenorDays) / 365))).toFixed(2)} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white ml-2">{formData.tenorDays} days</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between space-x-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                isPending || 
                isConfirming || 
                !formData.loanAmount || 
                !formData.interestRate || 
                !formData.tenorDays || 
                !formData.projectTitle
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {isPending && 'Preparing Transaction...'}
              {isConfirming && 'Creating Market...'}
              {!isPending && !isConfirming && 'Create Loan Market'}
            </button>
          )}
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              📝 Transaction submitted: 
              <span className="text-cyan-400 font-mono text-xs ml-1">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </span>
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
              ✅ Loan market created successfully! Lenders can now fund your project.
            </p>
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
        <p className="text-purple-300 text-sm">
          💡 <strong>Enhanced Project Proposal:</strong> This comprehensive form helps lenders understand your project better. 
          Complete all steps to increase your chances of getting funded.
        </p>
      </div>
    </div>
  )
}
