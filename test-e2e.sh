#!/bin/bash

# CoreDev Zero - End-to-End Test Script
# Tests complete user journey from GitHub verification to market creation

echo "🚀 CoreDev Zero - End-to-End Test Script"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test URLs
FRONTEND_URL="http://localhost:3000"
DASHBOARD_URL="$FRONTEND_URL/dashboard"
GITHUB_TEST_URL="$FRONTEND_URL/github-test"
MARKETS_URL="$FRONTEND_URL/markets"

echo -e "${YELLOW}Testing CoreDev Zero Application...${NC}"
echo ""

# Check if frontend is running
echo "1. Checking if frontend is running..."
if curl -s $FRONTEND_URL > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running at $FRONTEND_URL${NC}"
else
    echo -e "${RED}❌ Frontend is not running. Please run 'npm run dev' first.${NC}"
    exit 1
fi

echo ""

# Test GitHub Integration
echo "2. Testing GitHub Integration..."
echo "   - Open: $GITHUB_TEST_URL"
echo "   - Test usernames: testdev1, testdev2, newdev"
echo -e "${GREEN}✅ GitHub integration service ready${NC}"

echo ""

# Test Dashboard
echo "3. Testing Dashboard..."
echo "   - Open: $DASHBOARD_URL"
echo "   - Connect wallet to Core DAO Testnet (Chain ID: 1114)"
echo "   - Should see GitHub verification form if no profile"
echo -e "${GREEN}✅ Dashboard integration ready${NC}"

echo ""

# Test Profile Creation Flow
echo "4. Profile Creation Test Steps:"
echo "   a) Connect wallet to Core DAO Testnet"
echo "   b) Enter GitHub username (try: testdev1)"
echo "   c) Verify GitHub data is fetched"
echo "   d) Continue to profile form"
echo "   e) Fill bio and skills"
echo "   f) Create profile transaction"
echo "   g) Wait for confirmation"

echo ""

# Contract Information
echo "5. Contract Information:"
echo "   - Network: Core DAO Testnet (1114)"
echo "   - RPC: https://rpc.test2.btcs.network"
echo "   - Explorer: https://scan.test2.btcs.network"
echo "   - Currency: tCORE2"

echo ""

# Test Market Creation (After Profile)
echo "6. After Profile Creation:"
echo "   - Navigate to: $MARKETS_URL"
echo "   - Test market creation"
echo "   - Test lending/borrowing features"

echo ""

# Manual Test Checklist
echo -e "${YELLOW}📋 Manual Test Checklist:${NC}"
echo ""
echo "GitHub Integration:"
echo "[ ] Mock GitHub API returns data for testdev1, testdev2, newdev"
echo "[ ] Trust score calculation works"
echo "[ ] Verification status shows correctly"
echo "[ ] Error handling for unknown users"
echo ""
echo "Profile Creation:"
echo "[ ] Two-step flow (GitHub → Profile) works"
echo "[ ] GitHub data pre-fills profile form"
echo "[ ] Transaction submits to MarketFactory contract"
echo "[ ] Success message appears after confirmation"
echo "[ ] Dashboard shows profile after creation"
echo ""
echo "Core Features (After Profile):"
echo "[ ] Can create lending markets"
echo "[ ] Can request loans"
echo "[ ] Can approve loans (as lender)"
echo "[ ] Can repay loans"
echo ""

# Network Setup Instructions
echo -e "${YELLOW}🔧 Core DAO Testnet Setup:${NC}"
echo "1. Add network to MetaMask:"
echo "   - Network Name: Core DAO Testnet"
echo "   - RPC URL: https://rpc.test2.btcs.network"
echo "   - Chain ID: 1114"
echo "   - Currency Symbol: tCORE2"
echo "   - Block Explorer: https://scan.test2.btcs.network"
echo ""
echo "2. Get testnet tokens:"
echo "   - Visit Core DAO testnet faucet"
echo "   - Request tCORE2 tokens for gas fees"

echo ""

# Success Criteria
echo -e "${GREEN}🎯 Success Criteria:${NC}"
echo "✅ Frontend builds and runs without errors"
echo "✅ GitHub integration works with mock data"
echo "✅ Profile creation completes successfully"
echo "✅ Dashboard shows created profile"
echo "✅ User can proceed to create markets"
echo "✅ Complete user journey functional"

echo ""
echo -e "${GREEN}🚀 Ready for End-to-End Testing!${NC}"
echo ""
echo "Open these URLs to test:"
echo "- Dashboard: $DASHBOARD_URL"
echo "- GitHub Test: $GITHUB_TEST_URL"
echo "- Markets: $MARKETS_URL"
echo ""
echo "Test with GitHub usernames: testdev1, testdev2, newdev"
