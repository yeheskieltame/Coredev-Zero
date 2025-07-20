# GitHub Integration Setup Guide

## 🔧 Required Setup for Production GitHub Integration

CoreDev Zero frontend now uses **only real GitHub data** - no mock or development modes. Follow these steps to set up GitHub OAuth integration:

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: `CoreDev Zero`
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
   - **Authorization callback URL**: `https://yourdomain.com/auth/github/callback` (or `http://localhost:3000/auth/github/callback` for development)
   - **Application description**: `Decentralized Developer Lending Protocol`

4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Existing blockchain config (if any)
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://rpc.coredao.org
```

### 3. GitHub Integration Features

The frontend now supports two authentication methods:

#### OAuth Authentication (Recommended)
- Secure GitHub login with proper token management
- Automatic profile data import
- Full API access for comprehensive verification

#### Manual Username Verification
- Enter GitHub username manually
- Public profile verification
- Limited to public data only

### 4. API Endpoints

The following API endpoints are now available:

- **`/api/github/oauth/token`** - Handles OAuth token exchange
- **`/auth/github/callback`** - GitHub OAuth callback handler

### 5. Security Features

- ✅ Real GitHub API integration only
- ✅ Secure server-side token exchange
- ✅ State parameter validation
- ✅ Error handling and user feedback
- ✅ Session management
- ❌ No mock data or development modes

### 6. User Experience

Users can now:
1. **OAuth Login**: Click "Login with GitHub" for secure authentication
2. **Manual Verification**: Enter username for public profile verification
3. **Profile Import**: Automatic data import after OAuth authentication
4. **Trust Score**: Real GitHub metrics for trust score calculation

### 7. Error Handling

Common errors and solutions:

- **"GitHub OAuth not configured"**: Set environment variables
- **"Missing authorization code"**: Check callback URL configuration
- **"Token exchange failed"**: Verify client ID and secret
- **"User not found"**: Check username spelling and privacy settings

### 8. Testing

To test the integration:

1. Set up a test GitHub OAuth app with localhost callback
2. Configure environment variables
3. Start the development server: `npm run dev`
4. Navigate to `/actions` and test GitHub verification
5. Try both OAuth and manual verification methods

### 9. Production Deployment

For production deployment:

1. Create a production GitHub OAuth app with your domain
2. Update callback URL to `https://yourdomain.com/auth/github/callback`
3. Set production environment variables
4. Deploy with proper HTTPS configuration
5. Test OAuth flow with production URLs

## 🚀 Frontend Status

- ✅ **Mock data removed** - All development/test modes eliminated
- ✅ **Real GitHub API** - Only live data integration
- ✅ **OAuth support** - Secure authentication flow
- ✅ **Error handling** - Comprehensive error management
- ✅ **User guidance** - Clear setup instructions
- ✅ **Production ready** - No development dependencies

The frontend is now fully configured for **production-only GitHub integration** with real user data and accounts.
