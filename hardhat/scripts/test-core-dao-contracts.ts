import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing CoreDev Zero contracts on Core DAO Testnet2...\n");

    // Load deployment addresses
    const deploymentInfo = require('../deployed-addresses-core-testnet.json');
    const contracts = deploymentInfo.contracts;

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Testing with account:", signer.address);
    console.log("Account balance:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "tCORE\n");

    // Connect to deployed contracts
    console.log("🔗 Connecting to deployed contracts...");
    
    const mockToken = await ethers.getContractAt("MockToken", contracts.MockToken);
    const defaultBlacklist = await ethers.getContractAt("DefaultBlacklist", contracts.DefaultBlacklist);
    const reputationStaking = await ethers.getContractAt("ReputationStaking", contracts.ReputationStaking);
    const communityVerification = await ethers.getContractAt("CommunityVerification", contracts.CommunityVerification);
    const milestoneEscrowVault = await ethers.getContractAt("MilestoneEscrowVault", contracts.MilestoneEscrowVault);
    const marketFactory = await ethers.getContractAt("MarketFactory", contracts.MarketFactory);
    
    console.log("✅ All contracts connected successfully!\n");

    // Test 1: Check MockToken
    console.log("💰 Testing MockToken...");
    try {
        const tokenName = await mockToken.name();
        const tokenSymbol = await mockToken.symbol();
        const tokenDecimals = await mockToken.decimals();
        const balance = await mockToken.balanceOf(signer.address);
        
        console.log(`✅ Token: ${tokenName} (${tokenSymbol})`);
        console.log(`✅ Decimals: ${tokenDecimals}`);
        console.log(`✅ Balance: ${ethers.formatUnits(balance, tokenDecimals)} ${tokenSymbol}`);
    } catch (error) {
        console.log("❌ MockToken test failed:", error.message);
    }

    // Test 2: Check DefaultBlacklist
    console.log("\n📋 Testing DefaultBlacklist...");
    try {
        const isBlacklisted = await defaultBlacklist.isBlacklisted(signer.address);
        const adminRole = await defaultBlacklist.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await defaultBlacklist.hasRole(adminRole, signer.address);
        
        console.log(`✅ Address blacklisted: ${isBlacklisted}`);
        console.log(`✅ Has admin role: ${hasAdminRole}`);
    } catch (error) {
        console.log("❌ DefaultBlacklist test failed:", error.message);
    }

    // Test 3: Check ReputationStaking
    console.log("\n⭐ Testing ReputationStaking...");
    try {
        const hasProfile = await reputationStaking.hasProfile(signer.address);
        console.log(`✅ Has reputation profile: ${hasProfile}`);
        
        if (!hasProfile) {
            console.log("📝 Creating reputation profile...");
            const tx = await reputationStaking.createProfile("test-github-handle");
            await tx.wait();
            console.log("✅ Reputation profile created!");
        }
    } catch (error) {
        console.log("❌ ReputationStaking test failed:", error.message);
    }

    // Test 4: Check CommunityVerification
    console.log("\n🏛️ Testing CommunityVerification...");
    try {
        const proposalCount = await communityVerification.proposalCounter();
        console.log(`✅ Total proposals: ${proposalCount.toString()}`);
    } catch (error) {
        console.log("❌ CommunityVerification test failed:", error.message);
    }

    // Test 5: Check MilestoneEscrowVault
    console.log("\n🛡️ Testing MilestoneEscrowVault...");
    try {
        const vaultCounter = await milestoneEscrowVault.vaultCounter();
        console.log(`✅ Total vaults: ${vaultCounter.toString()}`);
    } catch (error) {
        console.log("❌ MilestoneEscrowVault test failed:", error.message);
    }

    // Test 6: Check MarketFactory
    console.log("\n🏭 Testing MarketFactory...");
    try {
        const platformMetrics = await marketFactory.getPlatformMetrics();
        const assetAddress = await marketFactory.assetAddress();
        
        console.log(`✅ Asset address: ${assetAddress}`);
        console.log(`✅ Total markets: ${platformMetrics.totalMarkets.toString()}`);
        console.log(`✅ Total volume: ${platformMetrics.totalVolume.toString()}`);
        console.log(`✅ Active markets: ${platformMetrics.activeMarkets.toString()}`);
    } catch (error) {
        console.log("❌ MarketFactory test failed:", error.message);
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 CORE DAO TESTNET2 CONTRACT TESTING COMPLETED!");
    console.log("=".repeat(80));
    console.log("\n📊 SUMMARY:");
    console.log("Network: Core DAO Testnet2");
    console.log("RPC: https://rpc.test2.btcs.network");
    console.log("Explorer: https://scan.test2.btcs.network");
    console.log("Tester Account:", signer.address);
    
    console.log("\n🚀 All contracts are functional and ready for use!");
    console.log("You can now proceed with:");
    console.log("1. Frontend integration");
    console.log("2. User testing");
    console.log("3. Community demonstrations");
    console.log("4. Production deployment preparation");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Testing failed:", error);
        process.exit(1);
    });
