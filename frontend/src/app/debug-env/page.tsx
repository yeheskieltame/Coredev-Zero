'use client'

import React from 'react';

export default function EnvDebugPage() {
  const envVars = {
    'NEXT_PUBLIC_GITHUB_CLIENT_ID': process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    'NODE_ENV': process.env.NODE_ENV,
    'NEXT_PUBLIC_RPC_URL': process.env.NEXT_PUBLIC_RPC_URL,
    'NEXT_PUBLIC_CHAIN_ID': process.env.NEXT_PUBLIC_CHAIN_ID,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Environment Variables Debug
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Client-Side Environment Variables</h2>
          
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm text-gray-700">{key}</span>
                <span className="font-mono text-sm text-blue-600">
                  {value ? (key.includes('SECRET') ? '***' : value) : '❌ UNDEFINED'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If NEXT_PUBLIC_GITHUB_CLIENT_ID is UNDEFINED: Restart your dev server</li>
              <li>• Make sure .env.local is in the root of frontend/ directory</li>
              <li>• Verify no typos in variable names</li>
              <li>• Check GitHub OAuth app callback URL matches exactly</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/actions'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Actions
          </button>
        </div>
      </div>
    </div>
  );
}
