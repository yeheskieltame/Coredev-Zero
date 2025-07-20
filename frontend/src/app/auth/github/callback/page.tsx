'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GitHubIntegrationService } from '@/lib/githubIntegration';
import { Loader2, CheckCircle, XCircle, Github } from 'lucide-react';

export default function GitHubCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Handle OAuth error from GitHub
      if (error) {
        setStatus('error');
        setError(`GitHub OAuth error: ${error}`);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setError('Missing authorization code or state parameter');
        return;
      }

      try {
        const githubService = GitHubIntegrationService.getInstance();
        const result = await githubService.handleOAuthCallback(code, state);

        if (result.success) {
          setStatus('success');
          // Redirect to the page that initiated GitHub auth after a delay
          setTimeout(() => {
            const returnUrl = sessionStorage.getItem('github_auth_return_url') || '/actions';
            sessionStorage.removeItem('github_auth_return_url');
            router.push(returnUrl);
          }, 2000);
        } else {
          setStatus('error');
          setError(result.error || 'Authentication failed');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mb-4">
            <Github className="h-12 w-12 text-gray-600 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            GitHub Authentication
          </h1>

          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">
                Processing your GitHub authentication...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-gray-600">
                GitHub authentication successful! Redirecting you back...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="h-8 w-8 text-red-600 mx-auto" />
              <p className="text-red-600 font-medium">
                Authentication Failed
              </p>
              <p className="text-gray-600 text-sm">
                {error}
              </p>
              <button
                onClick={() => router.push('/actions')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Actions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
