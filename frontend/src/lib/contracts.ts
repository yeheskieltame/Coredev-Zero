// Contract ABIs - Import dari local copy
import contractABIs from './frontend-abis.json';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Hardhat/Localhost (untuk development)
  localhost: {
    MarketFactory: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    DeveloperProfile: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    RiskAssessmentOracle: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    GitHubVerificationOracle: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    MockUSDT: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    Testnet_sUSDT: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    ReputationSBT: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    StakingVault: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    LoanPositionNFT: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    LoanPositionMarketplace: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  },
  // Core DAO Testnet (Latest deployment)
  coreTestnet: {
    MarketFactory: '0x3C8a900a27b41bfa9e3698CF2dE38F6Ff95F8E2A', // MarketFactoryTesting with MIN_TRUST_SCORE = 100
    DeveloperProfile: '0xb4CCB7879F4498367Fcd24F6AA6c38d81d23D838',
    RiskAssessmentOracle: '0x82b0dA0e6F4c25b5514205C2fA383Aa213143f7e',
    GitHubVerificationOracle: '0x3717A59Ae749Bc08AeE8aCd715CBBe5486D82fB0',
    MockUSDT: '0xCC183A8D9953B323e77e2dB96131AF33388E9aE6',
    Testnet_sUSDT: '0xCC183A8D9953B323e77e2dB96131AF33388E9aE6',
    ReputationSBT: '0x5FE1C3fB5c45ccFcFf05F24A3f09321F32e3F6fa',
    StakingVault: '0x7B0da467dC9D1D3E60bF1EcaF068D40Cf206D485',
    LoanPositionNFT: '0x29c35a0079B27a72d038dd25332e5fef4b2Da875',
    LoanPositionMarketplace: '0x1148b6cbD4eE448AcEF6F852e5521f1b482B93Dc',
  },
  // Core DAO Mainnet
  coreMainnet: {
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS,
    DeveloperProfile: process.env.NEXT_PUBLIC_DEVELOPER_PROFILE_ADDRESS,
    RiskAssessmentOracle: process.env.NEXT_PUBLIC_RISK_ASSESSMENT_ORACLE_ADDRESS,
    GitHubVerificationOracle: process.env.NEXT_PUBLIC_GITHUB_VERIFICATION_ORACLE_ADDRESS,
    MockUSDT: process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS,
    ReputationSBT: process.env.NEXT_PUBLIC_REPUTATION_SBT_ADDRESS,
    StakingVault: process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS,
    LoanPositionNFT: process.env.NEXT_PUBLIC_LOAN_POSITION_NFT_ADDRESS,
    LoanPositionMarketplace: process.env.NEXT_PUBLIC_LOAN_POSITION_MARKETPLACE_ADDRESS,
  },
  // Sepolia Testnet (untuk testing)
  sepolia: {
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS,
    DeveloperProfile: process.env.NEXT_PUBLIC_DEVELOPER_PROFILE_ADDRESS,
    RiskAssessmentOracle: process.env.NEXT_PUBLIC_RISK_ASSESSMENT_ORACLE_ADDRESS,
    GitHubVerificationOracle: process.env.NEXT_PUBLIC_GITHUB_VERIFICATION_ORACLE_ADDRESS,
    MockUSDT: process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS,
    ReputationSBT: process.env.NEXT_PUBLIC_REPUTATION_SBT_ADDRESS,
    StakingVault: process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS,
    LoanPositionNFT: process.env.NEXT_PUBLIC_LOAN_POSITION_NFT_ADDRESS,
    LoanPositionMarketplace: process.env.NEXT_PUBLIC_LOAN_POSITION_MARKETPLACE_ADDRESS,
  }
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;
export type ContractName = keyof typeof CONTRACT_ADDRESSES.localhost;

// Contract ABIs
export const CONTRACT_ABIS = {
  MarketFactory: contractABIs.MarketFactory,
  Market: contractABIs.Market,
  DeveloperProfile: contractABIs.DeveloperProfile,
  RiskAssessmentOracle: contractABIs.RiskAssessmentOracle,
  GitHubVerificationOracle: contractABIs.GitHubVerificationOracle,
  MockUSDT: contractABIs.MockToken,
  Testnet_sUSDT: contractABIs.Testnet_sUSDT,
  ReputationSBT: contractABIs.ReputationSBT,
  StakingVault: contractABIs.StakingVault,
  LoanPositionNFT: contractABIs.LoanPositionNFT,
  LoanPositionMarketplace: contractABIs.LoanPositionMarketplace,
} as const;

// Helper function to get contract config for current network
export function getContractConfig(contractName: ContractName, chainId?: number) {
  let networkName: NetworkName = 'localhost';
  
  // Determine network based on chainId
  switch (chainId) {
    case 1114:
      networkName = 'coreTestnet';
      break;
    case 1116:
      networkName = 'coreMainnet';
      break;
    case 11155111:
      networkName = 'sepolia';
      break;
    case 31337:
    default:
      networkName = 'localhost';
      break;
  }
  
  const addresses = CONTRACT_ADDRESSES[networkName];
  const address = addresses[contractName as keyof typeof addresses] as `0x${string}`;
  const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];
  
  if (!address) {
    console.warn(`Address for ${contractName} on ${networkName} not found. Make sure to set the environment variable.`);
  }
  
  return {
    address,
    abi,
  };
}

// Get current network name based on chain ID
export function getNetworkName(chainId: number): NetworkName {
  switch (chainId) {
    case 1114:
      return 'coreTestnet';
    case 1116:
      return 'coreMainnet';
    case 11155111:
      return 'sepolia';
    case 31337:
    default:
      return 'localhost';
  }
}
