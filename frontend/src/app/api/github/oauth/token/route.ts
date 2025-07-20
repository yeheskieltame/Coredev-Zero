import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub OAuth Token Exchange API Route
 * Handles the server-side token exchange for GitHub OAuth
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // GitHub OAuth App credentials (should be in environment variables)
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing GitHub OAuth credentials');
      return NextResponse.json(
        { error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.' },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    if (!tokenResponse.ok) {
      console.error('GitHub token exchange failed:', tokenResponse.status);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error_description);
      return NextResponse.json(
        { error: tokenData.error_description || 'OAuth error' },
        { status: 400 }
      );
    }

    // Return the access token
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token exchange' },
      { status: 500 }
    );
  }
}
