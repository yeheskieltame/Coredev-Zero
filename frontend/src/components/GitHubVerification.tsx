'use client'

import React, { useState, useEffect } from 'react';
import { 
  Github, 
  CheckCircle, 
  XCircle, 
  Star, 
  Users, 
  Calendar,
  Code,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { GitHubIntegrationService, GitHubVerificationData } from '@/lib/githubIntegration';

interface GitHubVerificationProps {
  onVerificationComplete?: (data: GitHubVerificationData) => void;
  onSkip?: () => void;
  initialUsername?: string;
}

export default function GitHubVerification({ 
  onVerificationComplete, 
  onSkip, 
  initialUsername = ''
}: GitHubVerificationProps) {
  const [username, setUsername] = useState(initialUsername);
  const [verificationData, setVerificationData] = useState<GitHubVerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const githubService = GitHubIntegrationService.getInstance();

  // Check authentication state on component mount
  useEffect(() => {
    const checkAuthState = async () => {
      // Initialize GitHub service
      githubService.initialize();
      
      // Check if user is authenticated
      const authenticated = githubService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      // If authenticated, get user profile automatically
      if (authenticated) {
        setIsLoading(true);
        try {
          const user = await githubService.getUser();
          if (user) {
            setUsername(user.login);
            // Auto-verify the authenticated user
            const data = await githubService.verifyGitHubAccount(user.login);
            setVerificationData(data);
            
            // Notify parent component
            if (onVerificationComplete && data.verified) {
              onVerificationComplete(data);
            }
          }
        } catch (err) {
          console.error('Error getting authenticated user:', err);
          setError('Failed to get user profile');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuthState();
  }, [githubService, onVerificationComplete]);

  const handleVerifyAccount = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Always use real GitHub API
      const data = await githubService.verifyGitHubAccount(username);
      
      setVerificationData(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
      setVerificationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    try {
      setError(null);
      
      // Store return URL for post-auth redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('github_auth_return_url', window.location.pathname);
      }
      
      const authUrl = await githubService.startOAuthFlow({
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
        redirectUri: `${window.location.origin}/auth/github/callback`,
        scope: 'user:email read:user public_repo'
      });
      
      // Redirect to GitHub OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start OAuth flow');
    }
  };

  const handleLogout = () => {
    githubService.logout();
    setIsAuthenticated(false);
    setVerificationData(null);
    setUsername('');
    setError(null);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 200) return 'text-green-600';
    if (score >= 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Github className="w-6 h-6 mr-2" />
          GitHub Account Verification
        </h2>
        
        <p className="text-gray-600 mb-6">
          Connect your GitHub account to build your developer profile and trust score.
          <span className="block mt-2 text-sm text-green-600">
            🌐 Real GitHub Integration: Choose OAuth login for secure authentication or manual verification
          </span>
        </p>

        {/* Authenticated Status */}
        {isAuthenticated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  Connected to GitHub
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Disconnect
              </button>
            </div>
            {username && (
              <p className="text-green-700 text-sm mt-2">
                Authenticated as: <strong>@{username}</strong>
              </p>
            )}
          </div>
        )}

        {/* OAuth Login Option - Only show if not authenticated */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Recommended: OAuth Authentication</h3>
            <p className="text-blue-700 text-sm mb-3">
              Login with your GitHub account for secure authentication and automatic profile import.
            </p>
            <button
              onClick={handleOAuthLogin}
              disabled={isLoading}
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              {isLoading ? 'Processing...' : 'Login with GitHub'}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center mb-4">
            <span className="text-gray-500 text-sm">or manually verify by username</span>
          </div>
        )}

        {/* Manual Username Input - Only show if not authenticated */}
        {!isAuthenticated && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyAccount()}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleVerifyAccount}
              disabled={isLoading || !username.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {/* Verification Results */}
        {verificationData && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Verification Results</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                verificationData.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {verificationData.verified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1 inline" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1 inline" />
                    Not Verified
                  </>
                )}
              </span>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Code className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-semibold">{verificationData.publicRepos}</div>
                <div className="text-sm text-gray-600">Repositories</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-semibold">{verificationData.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Star className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-semibold">{verificationData.totalContributions}</div>
                <div className="text-sm text-gray-600">Contributions</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-semibold">{verificationData.accountAgeMonths}</div>
                <div className="text-sm text-gray-600">Months Old</div>
              </div>
            </div>

            {/* Trust Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Trust Score</span>
                <span className={`font-bold text-lg ${getTrustScoreColor(verificationData.trustScore)}`}>
                  {verificationData.trustScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((verificationData.trustScore / 300) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">
                Based on repositories, followers, contributions, account age, and consistency
              </div>
            </div>

            {/* Top Languages */}
            {verificationData.topLanguages.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top Programming Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {verificationData.topLanguages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Requirements */}
            <div className="space-y-2">
              <h4 className="font-medium">Verification Requirements</h4>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center gap-2 ${verificationData.publicRepos >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationData.publicRepos >= 5 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  At least 5 public repositories ({verificationData.publicRepos}/5)
                </div>
                <div className={`flex items-center gap-2 ${verificationData.accountAgeMonths >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationData.accountAgeMonths >= 6 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  Account at least 6 months old ({verificationData.accountAgeMonths}/6 months)
                </div>
                <div className={`flex items-center gap-2 ${verificationData.totalContributions >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationData.totalContributions >= 100 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  At least 100 contributions ({verificationData.totalContributions}/100)
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => onVerificationComplete?.(verificationData)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Continue with GitHub Data
              </button>
              
              <button 
                onClick={() => window.open(`https://github.com/${username}`, '_blank')}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Profile
              </button>
            </div>
          </div>
        )}

        {/* Skip Option */}
        {onSkip && (
          <div className="pt-4 border-t mt-6">
            <button 
              onClick={onSkip}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md border border-gray-300"
            >
              Skip GitHub Verification (Create Basic Profile)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
