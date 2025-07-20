// Example usage of CoreDev Zero contracts in frontend
import { ethers } from 'ethers';
import { 
  CONTRACT_ADDRESSES, 
  CONTRACT_ABIS, 
  NETWORK_CONFIG,
  CORE_CONTRACTS,
  SECURITY_CONTRACTS 
} from './contracts';

// Setup provider for Core DAO Testnet2
const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpc);

// Example: Connect to MockToken contract
export async function getMockTokenContract(signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CORE_CONTRACTS.MockToken.address,
    CORE_CONTRACTS.MockToken.abi,
    signer || provider
  );
  return contract;
}

// Example: Connect to MarketFactory contract
export async function getMarketFactoryContract(signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CORE_CONTRACTS.MarketFactory.address,
    CORE_CONTRACTS.MarketFactory.abi,
    signer || provider
  );
  return contract;
}

// Example: Connect to ReputationStaking contract
export async function getReputationStakingContract(signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    SECURITY_CONTRACTS.ReputationStaking.address,
    SECURITY_CONTRACTS.ReputationStaking.abi,
    signer || provider
  );
  return contract;
}

// Example: Get token balance
export async function getTokenBalance(userAddress: string): Promise<string> {
  const contract = await getMockTokenContract();
  const balance = await contract.balanceOf(userAddress);
  return ethers.formatUnits(balance, 6); // 6 decimals for sUSDT
}

// Example: Check if address is blacklisted
export async function isAddressBlacklisted(address: string): Promise<boolean> {
  const contract = new ethers.Contract(
    SECURITY_CONTRACTS.DefaultBlacklist.address,
    SECURITY_CONTRACTS.DefaultBlacklist.abi,
    provider
  );
  return await contract.isBlacklisted(address);
}

// Example: Get platform metrics
export async function getPlatformMetrics() {
  const contract = await getMarketFactoryContract();
  return await contract.getPlatformMetrics();
}
