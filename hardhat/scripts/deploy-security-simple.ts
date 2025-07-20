import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying Security Contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

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

    console.log("\n🎉 All security contracts deployed successfully!");
    console.log("\n📝 Deployment Summary:");
    console.log("DefaultBlacklist:", await defaultBlacklist.getAddress());
    console.log("ReputationStaking:", await reputationStaking.getAddress());
    console.log("CommunityVerification:", await communityVerification.getAddress());
    console.log("MilestoneEscrowVault:", await milestoneEscrowVault.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
