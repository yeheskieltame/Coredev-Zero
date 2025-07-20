# Frontend Developer Quick Start Guide

## 🚀 Getting Started

The CoreDev Zero smart contracts are now deployed on Core DAO Testnet2 and ready for frontend integration!

## 📋 Prerequisites

```bash
# Install dependencies
cd frontend
npm install

# Required packages (should already be installed)
npm install ethers@^6.0.0 @types/node
```

## 🔗 Contract Integration

### Import Contracts
```typescript
// Import the generated contracts
import { 
  getContract, 
  getContractAddress, 
  CONTRACTS,
  NETWORK_CONFIG 
} from '@/lib/contracts';
```

### Basic Usage Examples

#### 1. Connect to MetaMask and Switch Network
```typescript
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '@/lib/contracts';

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    
    // Switch to Core DAO Testnet2
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: "0x45A" } // 1114 in hex
      ]);
    } catch (error) {
      // Add network if not exists
      await provider.send("wallet_addEthereumChain", [NETWORK_CONFIG]);
    }
    
    return provider;
  }
}
```

#### 2. Interact with Staking Contract
```typescript
async function stakeTokens(amount: string) {
  const provider = await connectWallet();
  const signer = await provider.getSigner();
  
  // Get contract instances
  const tokenContract = getContract('MockToken', signer);
  const stakingContract = getContract('ReputationStaking', signer);
  
  // Approve tokens
  const parseAmount = ethers.parseEther(amount);
  await tokenContract.approve(getContractAddress('ReputationStaking'), parseAmount);
  
  // Stake tokens
  await stakingContract.stake(parseAmount);
}
```

#### 3. Create Developer Profile
```typescript
async function createProfile(name: string, skills: string[], githubUsername: string) {
  const provider = await connectWallet();
  const signer = await provider.getSigner();
  
  const profileContract = getContract('DeveloperProfile', signer);
  
  await profileContract.createProfile(name, skills, githubUsername);
}
```

#### 4. Get User Information
```typescript
async function getUserInfo(userAddress: string) {
  const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrls[0]);
  
  // Read-only operations don't need signer
  const stakingContract = getContract('ReputationStaking', provider);
  const profileContract = getContract('DeveloperProfile', provider);
  
  const [stakedAmount, profile] = await Promise.all([
    stakingContract.userStakes(userAddress),
    profileContract.getProfile(userAddress)
  ]);
  
  return {
    stakedAmount: ethers.formatEther(stakedAmount),
    profile: {
      name: profile.name,
      skills: profile.skills,
      githubUsername: profile.githubUsername,
      reputationScore: profile.reputationScore.toString()
    }
  };
}
```

#### 5. Create a Market
```typescript
async function createMarket(
  tokenAddress: string,
  interestRate: number,
  collateralRatio: number,
  liquidationThreshold: number
) {
  const provider = await connectWallet();
  const signer = await provider.getSigner();
  
  const factoryContract = getContract('MarketFactory', signer);
  
  await factoryContract.createMarket(
    tokenAddress,
    ethers.parseUnits(interestRate.toString(), 16), // 16 decimals for percentage
    ethers.parseUnits(collateralRatio.toString(), 16),
    ethers.parseUnits(liquidationThreshold.toString(), 16)
  );
}
```

## 🎯 Available Contracts

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| **MockToken** | Test token for the platform | `mint()`, `transfer()`, `approve()` |
| **ReputationStaking** | Stake tokens for reputation | `stake()`, `unstake()`, `calculateRewards()` |
| **DeveloperProfile** | User profile management | `createProfile()`, `updateProfile()`, `getProfile()` |
| **MarketFactory** | Create lending markets | `createMarket()`, `getMarket()` |
| **Market** | Lending/borrowing operations | `supply()`, `borrow()`, `repay()` |
| **NFTMarketplace** | Trade NFTs | `listNFT()`, `buyNFT()`, `cancelListing()` |
| **LoanPositionNFT** | Track loan positions | `mint()`, `getPosition()` |

## 🔧 Utility Functions

### Check if user has profile
```typescript
async function hasProfile(userAddress: string): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrls[0]);
  const profileContract = getContract('DeveloperProfile', provider);
  
  try {
    const profile = await profileContract.getProfile(userAddress);
    return profile.name !== "";
  } catch {
    return false;
  }
}
```

### Get all user's markets
```typescript
async function getUserMarkets(userAddress: string) {
  const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrls[0]);
  const factoryContract = getContract('MarketFactory', provider);
  
  // Get market count
  const marketCount = await factoryContract.getMarketCount();
  
  const userMarkets = [];
  for (let i = 0; i < marketCount; i++) {
    const marketAddress = await factoryContract.markets(i);
    const marketContract = getContract('Market', provider);
    
    // Check if user has positions in this market
    const userBalance = await marketContract.balanceOf(userAddress);
    if (userBalance > 0) {
      userMarkets.push(marketAddress);
    }
  }
  
  return userMarkets;
}
```

## 🎨 React Hook Examples

### useContract Hook
```typescript
import { useState, useEffect } from 'react';
import { getContract } from '@/lib/contracts';

export function useContract(contractName: string, signer?: any) {
  const [contract, setContract] = useState(null);
  
  useEffect(() => {
    if (signer) {
      setContract(getContract(contractName, signer));
    }
  }, [contractName, signer]);
  
  return contract;
}
```

### useProfile Hook
```typescript
export function useProfile(userAddress: string) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProfile() {
      if (!userAddress) return;
      
      try {
        const userInfo = await getUserInfo(userAddress);
        setProfile(userInfo.profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [userAddress]);
  
  return { profile, loading };
}
```

## 🧪 Testing Setup

### Environment Variables
Create `.env.local` in your frontend directory:
```env
NEXT_PUBLIC_CHAIN_ID=1114
NEXT_PUBLIC_RPC_URL=https://rpc.test2.btcs.network
NEXT_PUBLIC_EXPLORER_URL=https://scan.test2.btcs.network
```

### Test Token Minting
```typescript
// Function to mint test tokens for development
async function mintTestTokens(amount: string = "10000") {
  const provider = await connectWallet();
  const signer = await provider.getSigner();
  const tokenContract = getContract('MockToken', signer);
  
  const userAddress = await signer.getAddress();
  await tokenContract.mint(userAddress, ethers.parseEther(amount));
}
```

## 🚨 Important Notes

1. **Network**: Always ensure users are connected to Core DAO Testnet2 (Chain ID: 1114)
2. **Gas**: Set appropriate gas limits for transactions
3. **Error Handling**: Always wrap contract calls in try-catch blocks
4. **Loading States**: Show loading indicators during blockchain interactions
5. **BigInt Handling**: Use ethers utilities for number formatting

## 📚 Resources

- **Contract Addresses**: All available in `/frontend/src/lib/contracts.ts`
- **ABIs**: Fully typed and exported
- **Network Config**: Built-in Core DAO Testnet2 configuration
- **Helper Functions**: Utility functions for common operations

## 🤝 Need Help?

- Check the main `PROJECT_SUMMARY.md` for full deployment details
- Review `ABI_EXPORT_SUMMARY.md` for technical specifications
- All contract interactions are fully typed with TypeScript

Happy coding! 🚀
