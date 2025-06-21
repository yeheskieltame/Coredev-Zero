'use client'

import React, { useState } from 'react';
import { GitHubIntegrationService, GitHubVerificationData } from '@/lib/githubIntegration';

export default function GitHubTestPage() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<GitHubVerificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const githubService = GitHubIntegrationService.getInstance();

  const testGitHubMock = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing GitHub mock with username:', username);
      const data = await githubService.getVerificationDataMock(username);
      console.log('GitHub mock result:', data);
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('GitHub test error:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testRealGitHub = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing real GitHub API with username:', username);
      const data = await githubService.verifyGitHubAccount(username);
      console.log('Real GitHub result:', data);
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Real GitHub test error:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 GitHub Integration Test</h1>
        
        {/* Test Input */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test GitHub Integration</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testGitHubMock}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Mock Data'}
            </button>
            
            <button
              onClick={testRealGitHub}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Real GitHub API'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <p><strong>Mock usernames to try:</strong></p>
            <ul className="list-disc list-inside">
              <li>testdev1 (verified, high trust score)</li>
              <li>testdev2 (verified, medium trust score)</li>
              <li>newdev (not verified, low trust score)</li>
              <li>randomuser (should show error)</li>
            </ul>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-800 border border-red-600 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-200 mb-2">❌ Error</h3>
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && !error && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-green-400 mb-4">✅ GitHub Verification Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span>{result.githubHandle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verified:</span>
                    <span className={result.verified ? 'text-green-400' : 'text-red-400'}>
                      {result.verified ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Public Repos:</span>
                    <span>{result.publicRepos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Followers:</span>
                    <span>{result.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contributions:</span>
                    <span>{result.totalContributions}</span>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div>
                <h4 className="font-medium mb-3">Scores & Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trust Score:</span>
                    <span className="font-bold text-blue-400">{result.trustScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consistency Score:</span>
                    <span>{result.consistencyScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Age:</span>
                    <span>{result.accountAgeMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Activity:</span>
                    <span>{result.lastActivity ? new Date(result.lastActivity).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            {result.topLanguages.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Top Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {result.topLanguages.map((lang, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-700 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Raw Data (JSON)</h4>
              <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
