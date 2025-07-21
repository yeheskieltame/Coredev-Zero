import fs from 'fs';
import path from 'path';

async function main() {
    console.log('🔄 Extracting ABIs for CoreDev Zero Frontend Integration...\n');

    // Load deployment addresses
    const deploymentInfo = require('../deployed-addresses-core-testnet.json');
    
    console.log('📋 Deployment Info:');
    console.log('Network:', deploymentInfo.network);
    console.log('Chain ID:', deploymentInfo.chainId);
    console.log('Timestamp:', deploymentInfo.timestamp);
    console.log('');

    // Define contracts that are actually deployed and needed for frontend
    const deployedContracts = [
        // Security Layer
        { name: 'DefaultBlacklist', path: 'security/DefaultBlacklist.sol', address: deploymentInfo.contracts.DefaultBlacklist },
        { name: 'ReputationStaking', path: 'security/ReputationStaking.sol', address: deploymentInfo.contracts.ReputationStaking },
        { name: 'CommunityVerification', path: 'security/CommunityVerification.sol', address: deploymentInfo.contracts.CommunityVerification },
        { name: 'MilestoneEscrowVault', path: 'security/MilestoneEscrowVault.sol', address: deploymentInfo.contracts.MilestoneEscrowVault },
        
        // Supporting Contracts
        { name: 'MockToken', path: 'tokens/MockToken.sol', address: deploymentInfo.contracts.MockToken },
        { name: 'ReputationSBT', path: 'tokens/ReputationSBT.sol', address: deploymentInfo.contracts.ReputationSBT },
        { name: 'StakingVault', path: 'staking/StakingVault.sol', address: deploymentInfo.contracts.StakingVault },
        { name: 'DeveloperProfile', path: 'profiles/DeveloperProfile.sol', address: deploymentInfo.contracts.DeveloperProfile },
        { name: 'GitHubVerificationOracle', path: 'oracles/GitHubVerificationOracle.sol', address: deploymentInfo.contracts.GitHubVerificationOracle },
        { name: 'RiskAssessmentOracle', path: 'oracles/RiskAssessmentOracle.sol', address: deploymentInfo.contracts.RiskAssessmentOracle },
        
        // Core System  
        { name: 'MarketFactory', path: 'MarketFactoryEnhanced.sol', address: deploymentInfo.contracts.MarketFactory },
        { name: 'Market', path: 'Market.sol', address: null }, // Template contract
        
        // NFT & Marketplace
        { name: 'LoanPositionNFT', path: 'tokens/LoanPositionNFT.sol', address: deploymentInfo.contracts.LoanPositionNFT },
        { name: 'LoanPositionMarketplace', path: 'marketplace/LoanPositionMarketplace.sol', address: deploymentInfo.contracts.LoanPositionMarketplace }
    ];

    // Function to extract ABI from compiled contract
    function extractABI(contractName: string, contractPath: string) {
        const artifactPath = path.join(
            __dirname, 
            '../artifacts/contracts', 
            contractPath, 
            `${contractName}.json`
        );
        
        try {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            return {
                contractName: artifact.contractName,
                abi: artifact.abi,
                bytecode: artifact.bytecode
            };
        } catch (error) {
            console.log(`❌ Failed to extract ABI for ${contractName}:`, error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    const frontendABIs: any = {
        metadata: {
            name: "CoreDev Zero",
            version: "1.0.0",
            network: deploymentInfo.network,
            chainId: deploymentInfo.chainId,
            rpc: deploymentInfo.rpc,
            deployer: deploymentInfo.deployer,
            timestamp: deploymentInfo.timestamp,
            contracts: {}
        },
        addresses: {},
        abis: {}
    };

    console.log('🔍 Extracting ABIs for deployed contracts:');
    console.log('═'.repeat(60));

    for (const contract of deployedContracts) {
        console.log(`📄 Processing ${contract.name}...`);
        
        const extracted = extractABI(contract.name, contract.path);
        if (extracted) {
            frontendABIs.abis[contract.name] = extracted.abi;
            
            if (contract.address) {
                frontendABIs.addresses[contract.name] = contract.address;
                frontendABIs.metadata.contracts[contract.name] = {
                    address: contract.address,
                    path: contract.path,
                    verified: false // Will be updated after manual verification
                };
            }
            
            console.log(`✅ ${contract.name} ABI extracted (${extracted.abi.length} functions)`);
            
            if (contract.address) {
                console.log(`   📍 Address: ${contract.address}`);
                console.log(`   🔗 Explorer: https://scan.test2.btcs.network/address/${contract.address}`);
            }
        } else {
            console.log(`❌ Failed to extract ${contract.name}`);
        }
        console.log('');
    }

    // Create frontend directory if it doesn't exist
    const frontendDir = path.join(__dirname, '../../frontend');
    const srcDir = path.join(frontendDir, 'src');
    const libDir = path.join(srcDir, 'lib');
    
    if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir, { recursive: true });
    }

    // Save comprehensive frontend ABI file
    const frontendABIFile = path.join(libDir, 'contracts.ts');
    const frontendABIContent = `// CoreDev Zero - Contract ABIs and Addresses
// Generated: ${new Date().toISOString()}
// Network: ${deploymentInfo.network} (Chain ID: ${deploymentInfo.chainId})

export const NETWORK_CONFIG = {
  name: "${deploymentInfo.network}",
  chainId: ${deploymentInfo.chainId},
  rpc: "${deploymentInfo.rpc}",
  explorer: "https://scan.test2.btcs.network",
  faucet: "https://scan.test2.btcs.network/faucet",
  nativeCurrency: {
    name: "Core DAO Testnet",
    symbol: "tCORE",
    decimals: 18
  }
} as const;

export const CONTRACT_ADDRESSES = ${JSON.stringify(frontendABIs.addresses, null, 2)} as const;

export const CONTRACT_ABIS = ${JSON.stringify(frontendABIs.abis, null, 2)} as const;

export const DEPLOYMENT_INFO = ${JSON.stringify(frontendABIs.metadata, null, 2)} as const;

// Helper function to get contract config
export function getContractConfig(contractName: keyof typeof CONTRACT_ADDRESSES) {
  return {
    address: CONTRACT_ADDRESSES[contractName],
    abi: CONTRACT_ABIS[contractName]
  };
}

// Contract categories for easier access
export const SECURITY_CONTRACTS = {
  DefaultBlacklist: getContractConfig('DefaultBlacklist'),
  ReputationStaking: getContractConfig('ReputationStaking'),
  CommunityVerification: getContractConfig('CommunityVerification'),
  MilestoneEscrowVault: getContractConfig('MilestoneEscrowVault')
} as const;

export const CORE_CONTRACTS = {
  MarketFactory: getContractConfig('MarketFactory'),
  MockToken: getContractConfig('MockToken'),
  DeveloperProfile: getContractConfig('DeveloperProfile')
} as const;

export const NFT_CONTRACTS = {
  LoanPositionNFT: getContractConfig('LoanPositionNFT'),
  LoanPositionMarketplace: getContractConfig('LoanPositionMarketplace'),
  ReputationSBT: getContractConfig('ReputationSBT')
} as const;

export const ORACLE_CONTRACTS = {
  GitHubVerificationOracle: getContractConfig('GitHubVerificationOracle'),
  RiskAssessmentOracle: getContractConfig('RiskAssessmentOracle')
} as const;
`;

    fs.writeFileSync(frontendABIFile, frontendABIContent);
    console.log(`✅ Frontend contracts file saved: ${frontendABIFile}`);

    // Save JSON version for other tools
    const jsonABIFile = path.join(__dirname, '..', 'frontend-abis-core-testnet.json');
    fs.writeFileSync(jsonABIFile, JSON.stringify(frontendABIs, null, 2));
    console.log(`✅ JSON ABIs saved: ${jsonABIFile}`);

    // Clean up old ABI files
    console.log('\n🧹 Cleaning up old ABI files...');
    const oldFiles = [
        path.join(__dirname, '..', 'frontend-abis.json'),
        path.join(__dirname, '..', 'deployed-addresses.json'),
        path.join(__dirname, '..', 'deployed-addresses-test.json')
    ];

    for (const oldFile of oldFiles) {
        if (fs.existsSync(oldFile)) {
            fs.unlinkSync(oldFile);
            console.log(`🗑️ Removed old file: ${path.basename(oldFile)}`);
        }
    }

    // Create usage example
    const exampleFile = path.join(libDir, 'contracts-example.ts');
    const exampleContent = `// Example usage of CoreDev Zero contracts in frontend
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
`;

    fs.writeFileSync(exampleFile, exampleContent);
    console.log(`✅ Usage example saved: ${exampleFile}`);

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 ABI EXTRACTION COMPLETED!');
    console.log('═'.repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Extracted ABIs: ${deployedContracts.filter(c => c.address).length} contracts`);
    console.log(`✅ Frontend file: ${frontendABIFile}`);
    console.log(`✅ JSON backup: ${jsonABIFile}`);
    console.log(`✅ Usage examples: ${exampleFile}`);
    console.log(`🗑️ Cleaned old files: ${oldFiles.length} removed`);
    
    console.log('\n📋 FRONTEND INTEGRATION:');
    console.log('1. Import contracts: import { CORE_CONTRACTS, SECURITY_CONTRACTS } from "./lib/contracts"');
    console.log('2. Use addresses: CORE_CONTRACTS.MarketFactory.address');
    console.log('3. Use ABIs: CORE_CONTRACTS.MarketFactory.abi');
    console.log('4. Check examples: ./frontend/src/lib/contracts-example.ts');
    
    console.log('\n🚀 Ready for frontend integration!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('ABI extraction failed:', error);
        process.exit(1);
    });
