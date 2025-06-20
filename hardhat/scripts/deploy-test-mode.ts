import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🚀 Deploying Enhanced CoreDev Zero System (Test Mode)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy DeveloperProfile first (will be standalone, not used by MarketFactory)
  console.log("\n📋 Deploying standalone DeveloperProfile...");
  const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
  const developerProfile = await DeveloperProfile.deploy();
  await developerProfile.waitForDeployment();
  console.log("✅ Standalone DeveloperProfile deployed to:", await developerProfile.getAddress());

  // Deploy MockUSDT token
  console.log("\n💰 Deploying Mock USDT Token...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockUSDT = await MockToken.deploy("Test USDT", "sUSDT", 6);
  await mockUSDT.waitForDeployment();
  console.log("✅ MockUSDT deployed to:", await mockUSDT.getAddress());

  // Deploy ReputationSBT
  console.log("\n🎖️ Deploying ReputationSBT...");
  const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy(deployer.address);
  await reputationSBT.waitForDeployment();
  console.log("✅ ReputationSBT deployed to:", await reputationSBT.getAddress());

  // Deploy StakingVault
  console.log("\n🔒 Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(deployer.address);
  await stakingVault.waitForDeployment();
  console.log("✅ StakingVault deployed to:", await stakingVault.getAddress());

  // Deploy LoanPositionNFT
  console.log("\n🎫 Deploying LoanPositionNFT...");
  const LoanPositionNFT = await ethers.getContractFactory("LoanPositionNFT");
  const loanPositionNFT = await LoanPositionNFT.deploy();
  await loanPositionNFT.waitForDeployment();
  console.log("✅ LoanPositionNFT deployed to:", await loanPositionNFT.getAddress());

  // Deploy LoanPositionMarketplace
  console.log("\n🏪 Deploying LoanPositionMarketplace...");
  const LoanPositionMarketplace = await ethers.getContractFactory("LoanPositionMarketplace");
  const marketplace = await LoanPositionMarketplace.deploy(
    await loanPositionNFT.getAddress(),
    await mockUSDT.getAddress()
  );
  await marketplace.waitForDeployment();
  console.log("✅ LoanPositionMarketplace deployed to:", await marketplace.getAddress());

  // Grant minter role to marketplace
  const MINTER_ROLE = await loanPositionNFT.MINTER_ROLE();
  const grantRoleTx = await loanPositionNFT.grantRole(MINTER_ROLE, await marketplace.getAddress());
  await grantRoleTx.wait();
  console.log("✅ Granted MINTER_ROLE to marketplace");

  // Deploy MarketFactory (it creates its own DeveloperProfile)
  console.log("\n🏭 Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(
    await mockUSDT.getAddress(),
    await reputationSBT.getAddress(),
    await stakingVault.getAddress()
  );
  await marketFactory.waitForDeployment();
  console.log("✅ MarketFactory deployed to:", await marketFactory.getAddress());
  
  // Get the DeveloperProfile address created by MarketFactory
  const developerProfileAddress = await marketFactory.developerProfile();
  console.log("✅ DeveloperProfile (from MarketFactory):", developerProfileAddress);

  // Deploy RiskAssessmentOracle with MarketFactory's DeveloperProfile
  console.log("\n📊 Deploying RiskAssessmentOracle...");
  const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
  const riskAssessmentOracle = await RiskAssessmentOracle.deploy(developerProfileAddress);
  await riskAssessmentOracle.waitForDeployment();
  console.log("✅ RiskAssessmentOracle deployed to:", await riskAssessmentOracle.getAddress());

  // Deploy GitHubVerificationOracle with MarketFactory's DeveloperProfile
  console.log("\n🔗 Deploying GitHubVerificationOracle...");
  const GitHubVerificationOracle = await ethers.getContractFactory("GitHubVerificationOracle");
  const githubOracle = await GitHubVerificationOracle.deploy(developerProfileAddress);
  await githubOracle.waitForDeployment();
  console.log("✅ GitHubVerificationOracle deployed to:", await githubOracle.getAddress());

  // Configure oracles and permissions
  console.log("\n⚙️ Configuring system permissions...");
  
  // Set RiskAssessmentOracle in MarketFactory
  const setOracleTx = await marketFactory.setRiskAssessmentOracle(await riskAssessmentOracle.getAddress());
  await setOracleTx.wait();
  console.log("✅ Set RiskAssessmentOracle in MarketFactory");

  // Add MarketFactory as authorized contract for StakingVault
  const authorizeTx = await stakingVault.authorizeContract(await marketFactory.getAddress());
  await authorizeTx.wait();
  console.log("✅ Authorized MarketFactory in StakingVault");

  // 🆕 TEST MODE SETUP - Bypass verification for testing
  console.log("\n🧪 Setting up TEST MODE (bypassing verification)...");
  
  // Connect to the DeveloperProfile created by MarketFactory
  const marketFactoryDeveloperProfile = await ethers.getContractAt("DeveloperProfile", developerProfileAddress);
  
  // Create test profile for deployer using MarketFactory's createProfile function
  try {
    const createProfileTx = await marketFactory.createProfile("test-deployer", "QmTestProfile");
    await createProfileTx.wait();
    console.log("✅ Created test profile for deployer");
  } catch (error: any) {
    if (error.message?.includes("Profile already exists")) {
      console.log("ℹ️ Test profile already exists");
    } else {
      console.log("❌ Profile creation failed:", error.message);
    }
  }

  // Grant roles needed for testing
  const DEVELOPER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DEVELOPER_ROLE"));
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

  // Grant ORACLE_ROLE to deployer
  const grantOracleTx = await marketFactory.grantRole(ORACLE_ROLE, deployer.address);
  await grantOracleTx.wait();
  console.log("✅ Granted ORACLE_ROLE to deployer");

  // Manually mark deployer as verified (bypassing GitHub verification)
  const verifyTx = await marketFactory.markProfileVerifiedForTesting(deployer.address);
  await verifyTx.wait();
  console.log("✅ Marked deployer as verified (test mode)");

  // Grant DEVELOPER_ROLE to deployer
  const grantDevTx = await marketFactory.grantDeveloperRole(deployer.address);
  await grantDevTx.wait();
  console.log("✅ Granted DEVELOPER_ROLE to deployer");

  // Update trust score for testing (boost to meet minimum requirement)
  try {
    const updateTrustTx = await marketFactory.setTrustScoreForTesting(deployer.address, 300);
    await updateTrustTx.wait();
    console.log("✅ Boosted trust score to 300 for testing");
  } catch (error: any) {
    console.log("⚠️ Trust score update failed:", error.message);
  }

  // Add test staking
  const stakeAmount = ethers.parseEther("2.0");
  const stakeTx = await stakingVault.stake({ value: stakeAmount });
  await stakeTx.wait();
  console.log("✅ Added 2 ETH stake for testing");

  // Save deployment addresses
  const addresses = {
    DeveloperProfile: developerProfileAddress, // From MarketFactory
    RiskAssessmentOracle: await riskAssessmentOracle.getAddress(),
    GitHubVerificationOracle: await githubOracle.getAddress(),
    MockUSDT: await mockUSDT.getAddress(),
    ReputationSBT: await reputationSBT.getAddress(),
    StakingVault: await stakingVault.getAddress(),
    LoanPositionNFT: await loanPositionNFT.getAddress(),
    LoanPositionMarketplace: await marketplace.getAddress(),
    MarketFactory: await marketFactory.getAddress(),
    deployer: deployer.address,
    network: "localhost"
  };

  fs.writeFileSync("deployed-addresses-test.json", JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment addresses saved to deployed-addresses-test.json");

  console.log("\n🎉 Enhanced CoreDev Zero System Deployed Successfully!");
  console.log("🧪 TEST MODE: Verification bypassed for development testing");
  console.log("\n📋 Deployment Summary:");
  console.log("══════════════════════");
  for (const [name, address] of Object.entries(addresses)) {
    if (name !== "deployer" && name !== "network") {
      console.log(`  ${name}: ${address}`);
    }
  }

  console.log("\n🚀 Ready for comprehensive testing including market creation!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
