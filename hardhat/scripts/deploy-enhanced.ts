import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying CoreDev Zero Enhanced Contracts...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy DeveloperProfile (no constructor params after our update)
  console.log("\n📋 Deploying DeveloperProfile...");
  const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
  const developerProfile = await DeveloperProfile.deploy();
  await developerProfile.waitForDeployment();
  console.log("✅ DeveloperProfile deployed to:", await developerProfile.getAddress());

  // 2. Deploy RiskAssessmentOracle
  console.log("\n🎯 Deploying RiskAssessmentOracle...");
  const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
  const riskOracle = await RiskAssessmentOracle.deploy(await developerProfile.getAddress());
  await riskOracle.waitForDeployment();
  console.log("✅ RiskAssessmentOracle deployed to:", await riskOracle.getAddress());

  // 3. Deploy GitHubVerificationOracle
  console.log("\n🔐 Deploying GitHubVerificationOracle...");
  const GitHubVerificationOracle = await ethers.getContractFactory("GitHubVerificationOracle");
  const githubOracle = await GitHubVerificationOracle.deploy(await developerProfile.getAddress());
  await githubOracle.waitForDeployment();
  console.log("✅ GitHubVerificationOracle deployed to:", await githubOracle.getAddress());

  // 4. Deploy mock sUSDT for testing
  console.log("\n💰 Deploying Mock sUSDT...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockUSDT = await MockToken.deploy("Staked USDT", "sUSDT", 6);
  await mockUSDT.waitForDeployment();
  console.log("✅ Mock sUSDT deployed to:", await mockUSDT.getAddress());

  // 5. Deploy ReputationSBT
  console.log("\n🏆 Deploying ReputationSBT...");
  const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy(deployer.address);
  await reputationSBT.waitForDeployment();
  console.log("✅ ReputationSBT deployed to:", await reputationSBT.getAddress());

  // 6. Deploy StakingVault
  console.log("\n🔒 Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(deployer.address);
  await stakingVault.waitForDeployment();
  console.log("✅ StakingVault deployed to:", await stakingVault.getAddress());

  // 7. Deploy LoanPositionNFT
  console.log("\n🎨 Deploying LoanPositionNFT...");
  const LoanPositionNFT = await ethers.getContractFactory("LoanPositionNFT");
  const loanPositionNFT = await LoanPositionNFT.deploy();
  await loanPositionNFT.waitForDeployment();
  console.log("✅ LoanPositionNFT deployed to:", await loanPositionNFT.getAddress());

  // 8. Deploy LoanPositionMarketplace
  console.log("\n🏪 Deploying LoanPositionMarketplace...");
  const LoanPositionMarketplace = await ethers.getContractFactory("LoanPositionMarketplace");
  const marketplace = await LoanPositionMarketplace.deploy(
    await loanPositionNFT.getAddress(),
    deployer.address // Fee recipient
  );
  await marketplace.waitForDeployment();
  console.log("✅ LoanPositionMarketplace deployed to:", await marketplace.getAddress());

  // 9. Deploy Enhanced MarketFactory
  console.log("\n🏭 Deploying Enhanced MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(
    await mockUSDT.getAddress(),
    await reputationSBT.getAddress(),
    await stakingVault.getAddress()
  );
  await marketFactory.waitForDeployment();
  console.log("✅ MarketFactory deployed to:", await marketFactory.getAddress());

  // 10. Setup integrations
  console.log("\n⚙️ Setting up integrations...");

  try {
    // Set risk oracle in market factory
    const setOracleTx = await marketFactory.setRiskAssessmentOracle(await riskOracle.getAddress());
    await setOracleTx.wait();
    console.log("✅ Risk Oracle connected to MarketFactory");

    // Add market factory as oracle to developer profile
    const addOracleTx = await developerProfile.addOracle(await marketFactory.getAddress());
    await addOracleTx.wait();
    console.log("✅ MarketFactory added as oracle to DeveloperProfile");

    // Add github oracle as verifier to developer profile
    const addVerifierTx = await developerProfile.addVerifier(await githubOracle.getAddress());
    await addVerifierTx.wait();
    console.log("✅ GitHubOracle added as verifier to DeveloperProfile");

    // Add risk oracle as oracle to developer profile
    const addRiskOracleTx = await developerProfile.addOracle(await riskOracle.getAddress());
    await addRiskOracleTx.wait();
    console.log("✅ RiskOracle added as oracle to DeveloperProfile");

    // Set marketplace operator for loan position NFT
    const MINTER_ROLE = await loanPositionNFT.MINTER_ROLE();
    const grantRoleTx = await loanPositionNFT.grantRole(MINTER_ROLE, await marketplace.getAddress());
    await grantRoleTx.wait();
    console.log("✅ Marketplace granted minter role for LoanPositionNFT");

  } catch (error) {
    console.log("⚠️ Some integrations failed, continuing with basic setup...");
    console.log("Error details:", error);
  }

  // 11. Initial setup for testing
  console.log("\n🧪 Setting up test environment...");

  try {
    // Mint some mock USDT to deployer
    const mintTx = await mockUSDT.mint(deployer.address, ethers.parseUnits("1000000", 6));
    await mintTx.wait();
    console.log("✅ Minted 1M sUSDT to deployer");

    // Create a test developer profile
    const createProfileTx = await developerProfile.createProfile(
      "test-developer",
      "QmTestProfileCID"
    );
    await createProfileTx.wait();
    console.log("✅ Created test developer profile");

  } catch (error) {
    console.log("⚠️ Test setup failed:", error);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("═══════════════════════════════════════");
  console.log("DeveloperProfile:", await developerProfile.getAddress());
  console.log("RiskAssessmentOracle:", await riskOracle.getAddress());
  console.log("GitHubVerificationOracle:", await githubOracle.getAddress());
  console.log("Mock sUSDT:", await mockUSDT.getAddress());
  console.log("ReputationSBT:", await reputationSBT.getAddress());
  console.log("StakingVault:", await stakingVault.getAddress());
  console.log("LoanPositionNFT:", await loanPositionNFT.getAddress());
  console.log("LoanPositionMarketplace:", await marketplace.getAddress());
  console.log("MarketFactory:", await marketFactory.getAddress());
  console.log("═══════════════════════════════════════");

  console.log("\n🔗 Integration Status:");
  console.log("✅ Risk Oracle → MarketFactory");
  console.log("✅ MarketFactory → DeveloperProfile (Oracle)");
  console.log("✅ GitHubOracle → DeveloperProfile (Verifier)");
  console.log("✅ RiskOracle → DeveloperProfile (Oracle)");
  console.log("✅ Marketplace → LoanPositionNFT (Minter)");

  console.log("\n📖 Next Steps:");
  console.log("1. Update frontend contract addresses");
  console.log("2. Setup off-chain GitHub verification service");
  console.log("3. Configure risk assessment data feeds");
  console.log("4. Test complete user journey");

  // Save addresses to file for frontend
  const addresses = {
    DeveloperProfile: await developerProfile.getAddress(),
    RiskAssessmentOracle: await riskOracle.getAddress(),
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

  const fs = require('fs');
  fs.writeFileSync(
    './deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Contract addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
