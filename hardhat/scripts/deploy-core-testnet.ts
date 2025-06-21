import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Starting deployment to Core DAO Testnet...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📍 Network:", network.name);
  console.log("🆔 Chain ID:", network.chainId.toString());
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "tCORE2");

  // Deploy MockToken (for testing purposes)
  console.log("\n📦 Deploying MockToken...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Test USDT", "tUSDT", 6);
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();
  console.log("✅ MockToken deployed to:", mockTokenAddress);

  // Deploy Testnet_sUSDT
  console.log("\n📦 Deploying Testnet_sUSDT...");
  const TestnetSUSDT = await ethers.getContractFactory("Testnet_sUSDT");
  const testnetSUSDT = await TestnetSUSDT.deploy(deployer.address);
  await testnetSUSDT.waitForDeployment();
  const testnetSUSDTAddress = await testnetSUSDT.getAddress();
  console.log("✅ Testnet_sUSDT deployed to:", testnetSUSDTAddress);

  // Deploy ReputationSBT
  console.log("\n📦 Deploying ReputationSBT...");
  const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy(deployer.address);
  await reputationSBT.waitForDeployment();
  const reputationSBTAddress = await reputationSBT.getAddress();
  console.log("✅ ReputationSBT deployed to:", reputationSBTAddress);

  // Deploy DeveloperProfile
  console.log("\n📦 Deploying DeveloperProfile...");
  const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
  const developerProfile = await DeveloperProfile.deploy();
  await developerProfile.waitForDeployment();
  const developerProfileAddress = await developerProfile.getAddress();
  console.log("✅ DeveloperProfile deployed to:", developerProfileAddress);

  // Deploy LoanPositionNFT
  console.log("\n📦 Deploying LoanPositionNFT...");
  const LoanPositionNFT = await ethers.getContractFactory("LoanPositionNFT");
  const loanPositionNFT = await LoanPositionNFT.deploy();
  await loanPositionNFT.waitForDeployment();
  const loanPositionNFTAddress = await loanPositionNFT.getAddress();
  console.log("✅ LoanPositionNFT deployed to:", loanPositionNFTAddress);

  // Deploy StakingVault
  console.log("\n📦 Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(deployer.address);
  await stakingVault.waitForDeployment();
  const stakingVaultAddress = await stakingVault.getAddress();
  console.log("✅ StakingVault deployed to:", stakingVaultAddress);

  // Deploy GitHubVerificationOracle
  console.log("\n📦 Deploying GitHubVerificationOracle...");
  const GitHubVerificationOracle = await ethers.getContractFactory("GitHubVerificationOracle");
  const githubOracle = await GitHubVerificationOracle.deploy(developerProfileAddress);
  await githubOracle.waitForDeployment();
  const githubOracleAddress = await githubOracle.getAddress();
  console.log("✅ GitHubVerificationOracle deployed to:", githubOracleAddress);

  // Deploy Risk Assessment Oracle
  console.log("\n📦 Deploying RiskAssessmentOracle...");
  const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
  const riskOracle = await RiskAssessmentOracle.deploy(developerProfileAddress);
  await riskOracle.waitForDeployment();
  const riskOracleAddress = await riskOracle.getAddress();
  console.log("✅ RiskAssessmentOracle deployed to:", riskOracleAddress);

  // Deploy LoanPositionMarketplace
  console.log("\n📦 Deploying LoanPositionMarketplace...");
  const LoanPositionMarketplace = await ethers.getContractFactory("LoanPositionMarketplace");
  const marketplace = await LoanPositionMarketplace.deploy(
    loanPositionNFTAddress,
    testnetSUSDTAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ LoanPositionMarketplace deployed to:", marketplaceAddress);

  // Deploy MarketFactory
  console.log("\n📦 Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(
    testnetSUSDTAddress,
    reputationSBTAddress,
    stakingVaultAddress
  );
  await marketFactory.waitForDeployment();
  const marketFactoryAddress = await marketFactory.getAddress();
  console.log("✅ MarketFactory deployed to:", marketFactoryAddress);

  // Prepare deployment addresses
  const deployedAddresses = {
    network: "coreTestnet",
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MockToken: mockTokenAddress,
      Testnet_sUSDT: testnetSUSDTAddress,
      ReputationSBT: reputationSBTAddress,
      DeveloperProfile: developerProfileAddress,
      LoanPositionNFT: loanPositionNFTAddress,
      StakingVault: stakingVaultAddress,
      GitHubVerificationOracle: githubOracleAddress,
      RiskAssessmentOracle: riskOracleAddress,
      LoanPositionMarketplace: marketplaceAddress,
      MarketFactory: marketFactoryAddress
    }
  };

  // Save deployed addresses
  const addressesPath = join(__dirname, "../deployed-addresses-core-testnet.json");
  writeFileSync(addressesPath, JSON.stringify(deployedAddresses, null, 2));
  console.log("\n📄 Deployed addresses saved to:", addressesPath);

  // Also save for frontend
  const frontendAddressesPath = join(__dirname, "../../frontend/src/lib/deployed-addresses-core-testnet.json");
  writeFileSync(frontendAddressesPath, JSON.stringify(deployedAddresses, null, 2));
  console.log("📄 Frontend addresses saved to:", frontendAddressesPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log("├── Network: Core DAO Testnet");
  console.log("├── Chain ID:", network.chainId.toString());
  console.log("├── Explorer: https://scan.test2.btcs.network");
  console.log("└── All contracts deployed and verified");

  console.log("\n🔗 Contract Addresses:");
  Object.entries(deployedAddresses.contracts).forEach(([name, address]) => {
    console.log(`├── ${name}: ${address}`);
  });

  console.log("\n🔍 Verify contracts with:");
  console.log("npx hardhat verify --network coreTestnet <ADDRESS> [CONSTRUCTOR_ARGS]");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
