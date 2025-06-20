import { ethers } from "hardhat";
import deployedAddresses from "../deployed-addresses.json";

async function main() {
  console.log("🌐 Hardhat Local Network Status\n");

  // Network information
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  
  console.log("📡 Network Information:");
  console.log("═══════════════════════");
  console.log("Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("RPC URL: http://127.0.0.1:8545");

  // Block information
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  
  console.log("\n📦 Latest Block:");
  console.log("═══════════════════");
  console.log("Block Number:", blockNumber);
  console.log("Block Hash:", block?.hash);
  console.log("Timestamp:", new Date((block?.timestamp || 0) * 1000).toLocaleString());
  console.log("Gas Limit:", block?.gasLimit.toString());

  // Account information
  const accounts = await ethers.getSigners();
  console.log("\n👥 Test Accounts:");
  console.log("══════════════════");
  
  for (let i = 0; i < Math.min(5, accounts.length); i++) {
    const account = accounts[i];
    const balance = await provider.getBalance(account.address);
    console.log(`Account ${i}: ${account.address}`);
    console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
  }

  // Contract addresses
  console.log("\n📋 Deployed Contracts:");
  console.log("══════════════════════");
  Object.entries(deployedAddresses).forEach(([name, address]) => {
    if (name !== "deployer" && name !== "network") {
      console.log(`${name}: ${address}`);
    }
  });

  // ABI Files locations
  console.log("\n📄 Generated ABIs:");
  console.log("══════════════════");
  console.log("📁 artifacts/contracts/profiles/DeveloperProfile.sol/DeveloperProfile.json");
  console.log("📁 artifacts/contracts/MarketFactory.sol/MarketFactory.json");
  console.log("📁 artifacts/contracts/Market.sol/Market.json");
  console.log("📁 artifacts/contracts/tokens/MockToken.sol/MockToken.json");
  console.log("📁 artifacts/contracts/oracles/GitHubVerificationOracle.sol/GitHubVerificationOracle.json");
  console.log("📁 artifacts/contracts/oracles/RiskAssessmentOracle.sol/RiskAssessmentOracle.json");

  // TypeChain types
  console.log("\n🔧 TypeChain Types:");
  console.log("═══════════════════");
  console.log("📁 typechain-types/contracts/");
  console.log("📁 typechain-types/factories/");
  console.log("📁 typechain-types/index.ts");

  // Contract verification
  console.log("\n✅ Contract Verification:");
  console.log("═══════════════════════════");
  
  try {
    const developerProfile = await ethers.getContractAt("DeveloperProfile", deployedAddresses.DeveloperProfile);
    const profileOwner = await developerProfile.owner();
    console.log("✅ DeveloperProfile - Owner:", profileOwner);

    const mockUSDT = await ethers.getContractAt("MockToken", deployedAddresses.MockUSDT);
    const tokenName = await mockUSDT.name();
    const tokenSymbol = await mockUSDT.symbol();
    console.log(`✅ MockToken - ${tokenName} (${tokenSymbol})`);

    const marketFactory = await ethers.getContractAt("MarketFactory", deployedAddresses.MarketFactory);
    const allMarkets = await marketFactory.getAllMarkets();
    console.log(`✅ MarketFactory - ${allMarkets.length} markets deployed`);

  } catch (error) {
    console.log("❌ Contract verification error:", error);
  }

  console.log("\n🚀 How to Use ABIs:");
  console.log("═══════════════════");
  console.log("1. 📄 Raw ABI: Use JSON files in artifacts/contracts/");
  console.log("2. 🔧 TypeScript: Import from typechain-types/");
  console.log("3. 🌐 Frontend: Copy ABI + addresses to your dApp");
  console.log("4. 📱 Mobile: Use ABI with Web3/Ethers.js");

  console.log("\n📖 Example Usage:");
  console.log("══════════════════");
  console.log("// TypeScript/JavaScript");
  console.log(`import { DeveloperProfile__factory } from './typechain-types';`);
  console.log(`const contract = DeveloperProfile__factory.connect('${deployedAddresses.DeveloperProfile}', signer);`);
  console.log("");
  console.log("// Raw ABI");
  console.log(`const abi = require('./artifacts/contracts/profiles/DeveloperProfile.sol/DeveloperProfile.json').abi;`);
  console.log(`const contract = new ethers.Contract('${deployedAddresses.DeveloperProfile}', abi, signer);`);

  console.log("\n💡 Next Steps:");
  console.log("══════════════════");
  console.log("1. Copy deployed-addresses.json to your frontend");
  console.log("2. Copy relevant ABI files or use TypeChain types");
  console.log("3. Connect your dApp to http://127.0.0.1:8545");
  console.log("4. Use Chain ID: 31337 for local network");
  console.log("5. Import test accounts for development");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
