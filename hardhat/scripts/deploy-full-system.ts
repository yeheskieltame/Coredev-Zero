import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying Full CoreDev Zero System to Core DAO Testnet2...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy Security Contracts First
    console.log("🛡️ PHASE 1: Deploying Security Contracts...\n");

    // Deploy DefaultBlacklist
    console.log("📋 Deploying DefaultBlacklist...");
    const DefaultBlacklist = await ethers.getContractFactory("DefaultBlacklist");
    const defaultBlacklist = await DefaultBlacklist.deploy();
    await defaultBlacklist.waitForDeployment();
    console.log("✅ DefaultBlacklist deployed at:", await defaultBlacklist.getAddress());

    // Deploy ReputationStaking
    console.log("\n⭐ Deploying ReputationStaking...");
    const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
    const reputationStaking = await ReputationStaking.deploy(await defaultBlacklist.getAddress());
    await reputationStaking.waitForDeployment();
    console.log("✅ ReputationStaking deployed at:", await reputationStaking.getAddress());

    // Deploy CommunityVerification
    console.log("\n🏛️ Deploying CommunityVerification...");
    const CommunityVerification = await ethers.getContractFactory("CommunityVerification");
    const communityVerification = await CommunityVerification.deploy();
    await communityVerification.waitForDeployment();
    console.log("✅ CommunityVerification deployed at:", await communityVerification.getAddress());

    // Deploy MilestoneEscrowVault
    console.log("\n🛡️ Deploying MilestoneEscrowVault...");
    const MilestoneEscrowVault = await ethers.getContractFactory("MilestoneEscrowVault");
    const milestoneEscrowVault = await MilestoneEscrowVault.deploy();
    await milestoneEscrowVault.waitForDeployment();
    console.log("✅ MilestoneEscrowVault deployed at:", await milestoneEscrowVault.getAddress());

    console.log("\n🏗️ PHASE 2: Deploying Supporting Contracts...\n");

    // Deploy MockToken
    console.log("💰 Deploying MockToken (Test sUSDT)...");
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(
        "Test Synthetic USDT",
        "sUSDT", 
        6
    );
    await mockToken.waitForDeployment();
    console.log("✅ MockToken deployed at:", await mockToken.getAddress());

    // Mint initial supply to deployer
    console.log("💰 Minting initial supply...");
    await mockToken.mint(deployer.address, ethers.parseUnits("1000000", 6));
    console.log("✅ Minted 1M sUSDT to deployer");

    // Deploy ReputationSBT
    console.log("\n🏅 Deploying ReputationSBT...");
    const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
    const reputationSBT = await ReputationSBT.deploy(deployer.address);
    await reputationSBT.waitForDeployment();
    console.log("✅ ReputationSBT deployed at:", await reputationSBT.getAddress());

    // Deploy StakingVault
    console.log("\n🔒 Deploying StakingVault...");
    const StakingVault = await ethers.getContractFactory("StakingVault");
    const stakingVault = await StakingVault.deploy(deployer.address);
    await stakingVault.waitForDeployment();
    console.log("✅ StakingVault deployed at:", await stakingVault.getAddress());

    // Deploy DeveloperProfile
    console.log("\n👤 Deploying DeveloperProfile...");
    const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
    const developerProfile = await DeveloperProfile.deploy();
    await developerProfile.waitForDeployment();
    console.log("✅ DeveloperProfile deployed at:", await developerProfile.getAddress());

    // Deploy GitHubVerificationOracle
    console.log("\n🔗 Deploying GitHubVerificationOracle...");
    const GitHubVerificationOracle = await ethers.getContractFactory("GitHubVerificationOracle");
    const githubOracle = await GitHubVerificationOracle.deploy(await developerProfile.getAddress());
    await githubOracle.waitForDeployment();
    console.log("✅ GitHubVerificationOracle deployed at:", await githubOracle.getAddress());

    // Deploy RiskAssessmentOracle
    console.log("\n⚖️ Deploying RiskAssessmentOracle...");
    const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
    const riskOracle = await RiskAssessmentOracle.deploy(await developerProfile.getAddress());
    await riskOracle.waitForDeployment();
    console.log("✅ RiskAssessmentOracle deployed at:", await riskOracle.getAddress());

    console.log("\n🏭 PHASE 3: Deploying Core System...\n");

    // Deploy MarketFactory (Enhanced)
    console.log("🏭 Deploying MarketFactory (Enhanced)...");
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const marketFactory = await MarketFactory.deploy(
        await mockToken.getAddress(),
        await reputationSBT.getAddress(),
        await stakingVault.getAddress(),
        await milestoneEscrowVault.getAddress(),
        await reputationStaking.getAddress(),
        await communityVerification.getAddress(),
        await defaultBlacklist.getAddress()
    );
    await marketFactory.waitForDeployment();
    console.log("✅ MarketFactory deployed at:", await marketFactory.getAddress());

    console.log("\n🎨 PHASE 4: Deploying NFT & Marketplace...\n");

    // Deploy LoanPositionNFT
    console.log("🎫 Deploying LoanPositionNFT...");
    const LoanPositionNFT = await ethers.getContractFactory("LoanPositionNFT");
    const loanPositionNFT = await LoanPositionNFT.deploy();
    await loanPositionNFT.waitForDeployment();
    console.log("✅ LoanPositionNFT deployed at:", await loanPositionNFT.getAddress());

    // Deploy LoanPositionMarketplace
    console.log("\n🏪 Deploying LoanPositionMarketplace...");
    const LoanPositionMarketplace = await ethers.getContractFactory("LoanPositionMarketplace");
    const marketplace = await LoanPositionMarketplace.deploy(
        await loanPositionNFT.getAddress(),
        deployer.address // fee recipient
    );
    await marketplace.waitForDeployment();
    console.log("✅ LoanPositionMarketplace deployed at:", await marketplace.getAddress());

    // Create deployment summary
    const deploymentInfo = {
        network: "Core DAO Testnet2",
        rpc: "https://rpc.test2.btcs.network",
        chainId: 1114,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        deployerBalance: ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
        contracts: {
            // Security Layer
            DefaultBlacklist: await defaultBlacklist.getAddress(),
            ReputationStaking: await reputationStaking.getAddress(),
            CommunityVerification: await communityVerification.getAddress(),
            MilestoneEscrowVault: await milestoneEscrowVault.getAddress(),
            
            // Supporting Contracts
            MockToken: await mockToken.getAddress(),
            ReputationSBT: await reputationSBT.getAddress(),
            StakingVault: await stakingVault.getAddress(),
            DeveloperProfile: await developerProfile.getAddress(),
            GitHubVerificationOracle: await githubOracle.getAddress(),
            RiskAssessmentOracle: await riskOracle.getAddress(),
            
            // Core System
            MarketFactory: await marketFactory.getAddress(),
            
            // NFT & Marketplace
            LoanPositionNFT: await loanPositionNFT.getAddress(),
            LoanPositionMarketplace: await marketplace.getAddress(),
        }
    };

    console.log("\n" + "=".repeat(80));
    console.log("🎉 CORE DAO TESTNET2 DEPLOYMENT SUCCESSFUL! 🎉");
    console.log("=".repeat(80));
    console.log("\n📊 DEPLOYMENT SUMMARY:");
    console.log("Network:", deploymentInfo.network);
    console.log("RPC URL:", deploymentInfo.rpc);
    console.log("Chain ID:", deploymentInfo.chainId);
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("Remaining Balance:", deploymentInfo.deployerBalance, "ETH");
    
    console.log("\n🛡️ SECURITY CONTRACTS:");
    console.log("- DefaultBlacklist:", deploymentInfo.contracts.DefaultBlacklist);
    console.log("- ReputationStaking:", deploymentInfo.contracts.ReputationStaking);
    console.log("- CommunityVerification:", deploymentInfo.contracts.CommunityVerification);
    console.log("- MilestoneEscrowVault:", deploymentInfo.contracts.MilestoneEscrowVault);
    
    console.log("\n🔧 SUPPORTING CONTRACTS:");
    console.log("- MockToken (sUSDT):", deploymentInfo.contracts.MockToken);
    console.log("- ReputationSBT:", deploymentInfo.contracts.ReputationSBT);
    console.log("- StakingVault:", deploymentInfo.contracts.StakingVault);
    console.log("- DeveloperProfile:", deploymentInfo.contracts.DeveloperProfile);
    console.log("- GitHubVerificationOracle:", deploymentInfo.contracts.GitHubVerificationOracle);
    console.log("- RiskAssessmentOracle:", deploymentInfo.contracts.RiskAssessmentOracle);
    
    console.log("\n🏭 CORE SYSTEM:");
    console.log("- MarketFactory:", deploymentInfo.contracts.MarketFactory);
    
    console.log("\n🎨 NFT & MARKETPLACE:");
    console.log("- LoanPositionNFT:", deploymentInfo.contracts.LoanPositionNFT);
    console.log("- LoanPositionMarketplace:", deploymentInfo.contracts.LoanPositionMarketplace);
    
    console.log("\n🔗 USEFUL LINKS:");
    console.log("- Core DAO Testnet Explorer: https://scan.test2.btcs.network");
    console.log("- RPC Endpoint: https://rpc.test2.btcs.network");
    console.log("- Core DAO Faucet: https://scan.test2.btcs.network/faucet");
    
    console.log("\n🚀 READY FOR TESTING & INTEGRATION!");
    console.log("=".repeat(80));

    // Save deployment addresses to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentFile = path.join(__dirname, '..', 'deployed-addresses-core-testnet.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
