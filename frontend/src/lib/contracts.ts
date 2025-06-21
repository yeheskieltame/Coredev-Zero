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
  // Core DAO Testnet
  coreTestnet2: {
    MarketFactory: '0x37163103264B0208707a295371C01c49aC20f5f4',
    DeveloperProfile: '0x91E0dEb48cDf97F1e72FE7aCc1DD22372A2D27CD',
    RiskAssessmentOracle: '0xa698384196600E0410738108D6EF71382173Ba8b',
    GitHubVerificationOracle: '0xF13d268970D29aacD53c4a5CA8420ce46F6755Ff',
    MockUSDT: '0x50d78be5877beeFf0cE7E79c031818ccD1167FAF',
    Testnet_sUSDT: '0x142f4d324D432641A067F1F39A6d6A90C3ab5A23',
    ReputationSBT: '0x2821932D3cccD1bD430757C3ed4b55e074Cb7425',
    StakingVault: '0xB9bbc7F5E4B449574E81A2D6ac1FFf34f229F953',
    LoanPositionNFT: '0x37b6BB9915810D09Afc6B6e84bfcB04d569303c9',
    LoanPositionMarketplace: '0x38d457A5eFF3d27326069f4ee93db27B4D8E05a7',
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
      networkName = 'coreTestnet2';
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
      return 'coreTestnet2';
    case 1116:
      return 'coreMainnet';
    case 11155111:
      return 'sepolia';
    case 31337:
    default:
      return 'localhost';
  }
}
