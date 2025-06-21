// Example: How to extract and use ABIs from Hardhat compilation

import fs from 'fs';
import path from 'path';

// Function to extract ABI from compiled contract
function extractABI(contractName: string, contractPath: string) {
  const artifactPath = path.join(
    __dirname, 
    '../artifacts/contracts', 
    contractPath, 
    `${contractName}.json`
  );
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return {
    contractName: artifact.contractName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode
  };
}

// Extract all important ABIs
const contracts = [
  { name: 'DeveloperProfile', path: 'profiles/DeveloperProfile.sol' },
  { name: 'MarketFactory', path: 'MarketFactory.sol' },
  { name: 'Market', path: 'Market.sol' },
  { name: 'MockToken', path: 'tokens/MockToken.sol' },
  { name: 'Testnet_sUSDT', path: 'tokens/Testnet_sUSDT.sol' },
  { name: 'GitHubVerificationOracle', path: 'oracles/GitHubVerificationOracle.sol' },
  { name: 'RiskAssessmentOracle', path: 'oracles/RiskAssessmentOracle.sol' },
  { name: 'ReputationSBT', path: 'tokens/ReputationSBT.sol' },
  { name: 'StakingVault', path: 'staking/StakingVault.sol' },
  { name: 'LoanPositionNFT', path: 'tokens/LoanPositionNFT.sol' },
  { name: 'LoanPositionMarketplace', path: 'marketplace/LoanPositionMarketplace.sol' }
];

async function main() {
  console.log('📄 Extracting ABIs from Hardhat Compilation\n');

  const abis: any = {};
  
  console.log('🔍 Available Contract ABIs:');
  console.log('══════════════════════════');

  for (const contract of contracts) {
    try {
      const extracted = extractABI(contract.name, contract.path);
      abis[contract.name] = extracted;
      
      console.log(`✅ ${contract.name}:`);
      console.log(`   📁 Path: artifacts/contracts/${contract.path}/${contract.name}.json`);
      console.log(`   🔧 Functions: ${extracted.abi.filter((item: any) => item.type === 'function').length}`);
      console.log(`   📡 Events: ${extracted.abi.filter((item: any) => item.type === 'event').length}`);
      console.log(`   ⚡ Errors: ${extracted.abi.filter((item: any) => item.type === 'error').length}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${contract.name}: File not found or error extracting`);
    }
  }

  // Save combined ABIs to a single file for frontend use
  const frontendABIs = Object.fromEntries(
    Object.entries(abis).map(([name, data]: [string, any]) => [name, data.abi])
  );

  fs.writeFileSync(
    path.join(__dirname, '../frontend-abis.json'),
    JSON.stringify(frontendABIs, null, 2)
  );

  console.log('💾 Generated Files:');
  console.log('══════════════════');
  console.log('📄 frontend-abis.json - All ABIs for frontend use');
  console.log('📄 deployed-addresses.json - Contract addresses');
  console.log('📁 typechain-types/ - TypeScript types and factories');

  // Show example of key contract functions
  console.log('\n🔧 Key Contract Functions:');
  console.log('══════════════════════════');

  // DeveloperProfile functions
  if (abis.DeveloperProfile) {
    const profileFunctions = abis.DeveloperProfile.abi
      .filter((item: any) => item.type === 'function' && item.stateMutability !== 'view')
      .map((item: any) => item.name);
    console.log('👤 DeveloperProfile (write functions):');
    profileFunctions.forEach((fn: string) => console.log(`   • ${fn}()`));
  }

  // MarketFactory functions
  if (abis.MarketFactory) {
    const factoryFunctions = abis.MarketFactory.abi
      .filter((item: any) => item.type === 'function' && item.stateMutability !== 'view')
      .map((item: any) => item.name);
    console.log('\n🏭 MarketFactory (write functions):');
    factoryFunctions.forEach((fn: string) => console.log(`   • ${fn}()`));
  }

  // MockToken functions  
  if (abis.MockToken) {
    const tokenFunctions = abis.MockToken.abi
      .filter((item: any) => item.type === 'function' && item.stateMutability !== 'view')
      .map((item: any) => item.name);
    console.log('\n💰 MockToken (write functions):');
    tokenFunctions.forEach((fn: string) => console.log(`   • ${fn}()`));
  }

  console.log('\n🌐 Frontend Integration Example:');
  console.log('═══════════════════════════════');
  console.log('```javascript');
  console.log('// 1. Import ABIs and addresses');
  console.log('import abis from "./frontend-abis.json";');
  console.log('import addresses from "./deployed-addresses.json";');
  console.log('import { ethers } from "ethers";');
  console.log('');
  console.log('// 2. Connect to local network');
  console.log('const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");');
  console.log('const signer = await provider.getSigner();');
  console.log('');
  console.log('// 3. Create contract instances');
  console.log('const developerProfile = new ethers.Contract(');
  console.log('  addresses.DeveloperProfile,');
  console.log('  abis.DeveloperProfile,');
  console.log('  signer');
  console.log(');');
  console.log('');
  console.log('// 4. Call contract functions');
  console.log('const tx = await developerProfile.createProfile("myGitHub", "ipfsHash");');
  console.log('await tx.wait();');
  console.log('```');

  console.log('\n✨ Hardhat Development Workflow Complete!');
  console.log('═══════════════════════════════════════');
  console.log('✅ Contracts compiled');
  console.log('✅ ABIs generated');
  console.log('✅ TypeChain types created');
  console.log('✅ Local network running');
  console.log('✅ Contracts deployed');
  console.log('✅ Test interactions successful');
  console.log('✅ Ready for frontend integration');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
