/**
 * GitHub Integration Service
 * Handles communication between smart contracts and GitHub API
 */

import { GitHubMockService, GitHubVerificationData } from './github-mock';
import { ethers } from 'hardhat';

export interface GitHubAuthFlow {
  step: 'authorization' | 'token_exchange' | 'profile_fetch' | 'verification' | 'complete';
  url?: string;
  code?: string;
  accessToken?: string;
  userProfile?: any;
  verificationData?: GitHubVerificationData;
  error?: string;
}

export interface ContractUpdateData {
  developer: string;
  githubHandle: string;
  publicRepos: number;
  followers: number;
  totalContributions: number;
  accountAgeMonths: number;
  consistencyScore: number;
  trustScore: number;
  verified: boolean;
}

/**
 * GitHub Integration Manager
 * Coordinates between GitHub API and Smart Contracts
 */
export class GitHubIntegrationService {
  private githubMock: GitHubMockService;
  private authFlows: Map<string, GitHubAuthFlow> = new Map();

  constructor(useMockService: boolean = true) {
    this.githubMock = GitHubMockService.getInstance();
    if (!useMockService) {
      // In real implementation, initialize actual GitHub API client
      console.log('Note: Real GitHub API not implemented in this test');
    }
  }

  /**
   * OAuth Flow Simulation
   */
  async startOAuthFlow(userId: string, clientId: string): Promise<GitHubAuthFlow> {
    const authFlow: GitHubAuthFlow = {
      step: 'authorization',
      url: `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email,read:user,public_repo`
    };

    this.authFlows.set(userId, authFlow);
    return authFlow;
  }

  async handleOAuthCallback(userId: string, code: string): Promise<GitHubAuthFlow> {
    const authFlow = this.authFlows.get(userId);
    if (!authFlow) {
      throw new Error('OAuth flow not found');
    }

    // Simulate token exchange
    await this.delay(500);
    
    const updatedFlow: GitHubAuthFlow = {
      ...authFlow,
      step: 'token_exchange',
      code,
      accessToken: `gho_${this.generateRandomToken()}`
    };

    this.authFlows.set(userId, updatedFlow);
    return updatedFlow;
  }

  async fetchUserProfile(userId: string, githubUsername: string): Promise<GitHubAuthFlow> {
    const authFlow = this.authFlows.get(userId);
    if (!authFlow?.accessToken) {
      const errorFlow: GitHubAuthFlow = {
        step: 'profile_fetch',
        error: 'User not authenticated'
      };
      return errorFlow;
    }

    try {
      // Fetch user data from GitHub (mock)
      const userProfile = await this.githubMock.getUser(githubUsername);
      const verificationData = await this.githubMock.verifyGitHubAccount(githubUsername);

      const updatedFlow: GitHubAuthFlow = {
        ...authFlow,
        step: 'profile_fetch',
        userProfile,
        verificationData
      };

      this.authFlows.set(userId, updatedFlow);
      return updatedFlow;

    } catch (error) {
      const errorFlow: GitHubAuthFlow = {
        ...authFlow,
        step: 'profile_fetch',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.authFlows.set(userId, errorFlow);
      return errorFlow;
    }
  }

  /**
   * Smart Contract Integration
   */
  async createDeveloperProfile(
    developerProfileContract: any,
    developerAddress: string,
    githubHandle: string,
    signer: any
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Verify GitHub account first
      const verificationData = await this.githubMock.verifyGitHubAccount(githubHandle);
      
      if (!verificationData.verified) {
        return { success: false, error: 'GitHub account verification failed' };
      }

      // Create profile on smart contract
      const tx = await developerProfileContract.connect(signer).createProfile(
        githubHandle,
        `QmProfile_${githubHandle}_${Date.now()}` // Mock IPFS CID
      );

      await tx.wait();

      return { success: true, txHash: tx.hash };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract interaction failed'
      };
    }
  }

  async updateGitHubMetrics(
    developerProfileContract: any,
    githubOracleContract: any,
    developerAddress: string,
    githubHandle: string,
    oracleSigner: any
  ): Promise<{ success: boolean; txHash?: string; newTrustScore?: number; error?: string }> {
    try {
      // Fetch latest GitHub data
      const verificationData = await this.githubMock.verifyGitHubAccount(githubHandle);

      // Add oracle authorization if needed
      const isAuthorized = await githubOracleContract.isAuthorizedOracle?.(oracleSigner.address);
      if (!isAuthorized) {
        // For testing, we'll assume oracle is properly authorized
        console.log('Note: Oracle authorization assumed for testing');
      }

      // Update GitHub metrics via oracle
      const tx = await githubOracleContract.connect(oracleSigner).updateGitHubMetrics?.(
        developerAddress,
        verificationData.publicRepos,
        verificationData.followers,
        verificationData.totalContributions,
        verificationData.accountAgeMonths,
        verificationData.consistencyScore
      );

      if (tx) {
        await tx.wait();

        // Get updated trust score
        const profile = await developerProfileContract.getDeveloperProfile(developerAddress);
        
        return {
          success: true,
          txHash: tx.hash,
          newTrustScore: profile.trustScore || 0
        };
      }

      return { success: false, error: 'GitHub metrics update function not available' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Metrics update failed'
      };
    }
  }

  async verifyDeveloperProfile(
    developerProfileContract: any,
    developerAddress: string,
    githubHandle: string,
    verifierSigner: any
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Verify GitHub account exists and has sufficient activity
      const verificationData = await this.githubMock.verifyGitHubAccount(githubHandle);

      if (verificationData.totalContributions < 50) {
        return { success: false, error: 'Insufficient GitHub activity for verification' };
      }

      if (verificationData.accountAgeMonths < 6) {
        return { success: false, error: 'GitHub account too new for verification' };
      }

      // Create verification proof (simplified)
      const proof = ethers.solidityPackedKeccak256(
        ['string', 'string', 'uint256'],
        [githubHandle, developerAddress, verificationData.totalContributions]
      );

      // Verify on smart contract
      const tx = await developerProfileContract.connect(verifierSigner).verifyProfile?.(
        developerAddress,
        proof
      );

      if (tx) {
        await tx.wait();
        return { success: true, txHash: tx.hash };
      }

      return { success: false, error: 'Profile verification function not available' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile verification failed'
      };
    }
  }

  /**
   * Real-time Update Simulation (Webhook-like)
   */
  async simulateGitHubWebhook(
    githubHandle: string,
    eventType: 'push' | 'star' | 'fork' | 'follow',
    payload: any
  ): Promise<{ shouldUpdateContract: boolean; newMetrics?: GitHubVerificationData }> {
    try {
      // Fetch updated metrics after GitHub event
      const newMetrics = await this.githubMock.verifyGitHubAccount(githubHandle);
      
      // Determine if contract update is needed
      const shouldUpdate = this.shouldTriggerContractUpdate(eventType, payload);

      return {
        shouldUpdateContract: shouldUpdate,
        newMetrics: shouldUpdate ? newMetrics : undefined
      };

    } catch (error) {
      console.error('Webhook simulation failed:', error);
      return { shouldUpdateContract: false };
    }
  }

  private shouldTriggerContractUpdate(eventType: string, payload: any): boolean {
    switch (eventType) {
      case 'push':
        // Update on any significant push (more than 1 commit)
        return payload?.commits?.length > 1 || false;
      
      case 'star':
        // Update on any star event
        return payload?.action === 'created' || false;
      
      case 'fork':
        // Update on every fork
        return true;
      
      case 'follow':
        // Update on every 5th follower
        return payload?.followerCount % 5 === 0 || false;
      
      default:
        return false;
    }
  }

  /**
   * Integration Testing Helpers
   */
  async testFullIntegrationFlow(
    contracts: {
      developerProfile: any;
      githubOracle: any;
    },
    testData: {
      developerAddress: string;
      githubHandle: string;
      signers: {
        developer: any;
        oracle: any;
        verifier: any;
      };
    }
  ): Promise<{
    success: boolean;
    steps: Array<{ step: string; success: boolean; data?: any; error?: string }>;
  }> {
    const results: Array<{ step: string; success: boolean; data?: any; error?: string }> = [];

    try {
      // Step 1: OAuth Flow
      const oauthResult = await this.startOAuthFlow(testData.developerAddress, 'test_client_id');
      results.push({
        step: 'oauth_start',
        success: !!oauthResult.url,
        data: { url: oauthResult.url }
      });

      // Step 2: Token Exchange
      const tokenResult = await this.handleOAuthCallback(testData.developerAddress, 'test_auth_code');
      results.push({
        step: 'token_exchange',
        success: !!tokenResult.accessToken,
        data: { hasToken: !!tokenResult.accessToken }
      });

      // Step 3: Profile Creation
      const profileResult = await this.createDeveloperProfile(
        contracts.developerProfile,
        testData.developerAddress,
        testData.githubHandle,
        testData.signers.developer
      );
      results.push({
        step: 'profile_creation',
        success: profileResult.success,
        data: { txHash: profileResult.txHash },
        error: profileResult.error
      });

      if (!profileResult.success) {
        return { success: false, steps: results };
      }

      // Step 4: GitHub Metrics Update
      const metricsResult = await this.updateGitHubMetrics(
        contracts.developerProfile,
        contracts.githubOracle,
        testData.developerAddress,
        testData.githubHandle,
        testData.signers.oracle
      );
      results.push({
        step: 'metrics_update',
        success: metricsResult.success,
        data: { 
          txHash: metricsResult.txHash,
          trustScore: metricsResult.newTrustScore
        },
        error: metricsResult.error
      });

      // Step 5: Profile Verification
      const verificationResult = await this.verifyDeveloperProfile(
        contracts.developerProfile,
        testData.developerAddress,
        testData.githubHandle,
        testData.signers.verifier
      );
      results.push({
        step: 'profile_verification',
        success: verificationResult.success,
        data: { txHash: verificationResult.txHash },
        error: verificationResult.error
      });

      // Step 6: Webhook Simulation
      const webhookResult = await this.simulateGitHubWebhook(
        testData.githubHandle,
        'push',
        { commits: Array(10).fill({}) } // Simulate 10 commits
      );
      results.push({
        step: 'webhook_simulation',
        success: webhookResult.shouldUpdateContract,
        data: { 
          shouldUpdate: webhookResult.shouldUpdateContract,
          hasNewMetrics: !!webhookResult.newMetrics
        }
      });

      const allSuccessful = results.every(r => r.success);
      return { success: allSuccessful, steps: results };

    } catch (error) {
      results.push({
        step: 'integration_flow',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return { success: false, steps: results };
    }
  }

  /**
   * Utility Methods
   */
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  reset(): void {
    this.authFlows.clear();
    this.githubMock.reset();
  }

  getAuthFlow(userId: string): GitHubAuthFlow | undefined {
    return this.authFlows.get(userId);
  }
}
