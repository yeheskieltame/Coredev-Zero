#!/bin/bash

# Market Loading Test Script
echo "🧪 Testing Market Loading Functionality"
echo "======================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Testing Market Page...${NC}"

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not running${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Market Loading Test Checklist:${NC}"
echo ""

# Test steps
echo "1. Open http://localhost:3000/markets"
echo "2. Connect wallet to Core DAO Testnet (Chain ID: 1114)"
echo "3. Check for the following:"
echo ""

echo "Expected Behavior:"
echo "[ ] Page loads without infinite loading"
echo "[ ] Shows '🧪 Development Mode: Showing mock data for testing'"
echo "[ ] Displays 4 mock markets:"
echo "    - DeFi Analytics Dashboard (2 ETH, 12%, 90 days)"
echo "    - NFT Marketplace for Developers (5 ETH, 10%, 120 days) - FUNDED"
echo "    - AI Code Review Tool (1.5 ETH, 8%, 60 days)"
echo "    - Cross-Chain Bridge Protocol (3 ETH, 15%, 180 days) - INACTIVE"
echo "[ ] Markets show proper status badges (Active/Funded/Inactive)"
echo "[ ] Clicking on market opens detail modal"
echo "[ ] Market cards show hover effects"
echo ""

echo "Debug Information to Check:"
echo "[ ] Browser console shows 'MarketList Debug' logs"
echo "[ ] Contract address and chain ID are correct"
echo "[ ] No critical errors in console"
echo ""

echo "If Issues:"
echo "- Check browser console for errors"
echo "- Verify wallet is connected to Core DAO Testnet"
echo "- Ensure contract addresses are correctly configured"
echo ""

echo -e "${GREEN}🚀 Test the market page now!${NC}"
echo "URL: http://localhost:3000/markets"
