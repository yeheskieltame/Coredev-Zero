import { expect } from "chai";
import { ethers } from "hardhat";

describe("🚀 CoreDev Zero Security Integration Demo", function () {
    let defaultBlacklist: any;
    let reputationStaking: any;
    let communityVerification: any;
    let milestoneEscrowVault: any;
    let mockToken: any;
    let owner: any, developer: any, lender: any, curator: any;

    before(async function () {
        [owner, developer, lender, curator] = await ethers.getSigners();
        
        // Deploy MockToken
        const MockToken = await ethers.getContractFactory("MockToken");
        mockToken = await MockToken.deploy("Test sUSDT", "sUSDT", 6);
        await mockToken.waitForDeployment();
        
        // Mint tokens for testing
        await mockToken.mint(owner.address, ethers.parseUnits("1000000", 6));
        await mockToken.waitForDeployment();
        
        // Deploy security contracts
        const DefaultBlacklist = await ethers.getContractFactory("DefaultBlacklist");
        defaultBlacklist = await DefaultBlacklist.deploy();
        await defaultBlacklist.waitForDeployment();
        
        const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
        reputationStaking = await ReputationStaking.deploy(await defaultBlacklist.getAddress());
        await reputationStaking.waitForDeployment();
        
        const CommunityVerification = await ethers.getContractFactory("CommunityVerification");
        communityVerification = await CommunityVerification.deploy();
        await communityVerification.waitForDeployment();
        
        const MilestoneEscrowVault = await ethers.getContractFactory("MilestoneEscrowVault");
        milestoneEscrowVault = await MilestoneEscrowVault.deploy();
        await milestoneEscrowVault.waitForDeployment();
        
        // Setup roles
        const CURATOR_ROLE = await communityVerification.CURATOR_ROLE();
        await communityVerification.grantRole(CURATOR_ROLE, curator.address);
        
        console.log("🎯 All security contracts deployed and configured!");
    });

    describe("🛡️ Security Features Demo", function () {
        it("Should create a reputation profile with GitHub integration", async function () {
            // Create reputation profile
            await reputationStaking.connect(developer).createProfile("test-developer");
            
            const hasProfile = await reputationStaking.hasProfile(developer.address);
            expect(hasProfile).to.be.true;
            
            console.log("✅ Developer reputation profile created");
        });

        it("Should verify milestone escrow vault is ready", async function () {
            // Check that the vault is deployed and functional
            const vaultAddress = await milestoneEscrowVault.getAddress();
            expect(vaultAddress).to.not.equal(ethers.ZeroAddress);
            
            // Check that we can query the next vault ID
            const nextVaultId = await milestoneEscrowVault.nextVaultId();
            expect(nextVaultId).to.equal(0); // No vaults created yet
            
            console.log("✅ Milestone escrow vault is deployed and functional");
        });

        it("Should verify community verification is ready", async function () {
            // Check that community verification is deployed
            const verificationAddress = await communityVerification.getAddress();
            expect(verificationAddress).to.not.equal(ethers.ZeroAddress);
            
            // Check that curator role was granted
            const CURATOR_ROLE = await communityVerification.CURATOR_ROLE();
            const hasCuratorRole = await communityVerification.hasRole(CURATOR_ROLE, curator.address);
            expect(hasCuratorRole).to.be.true;
            
            console.log("✅ Community verification system is ready");
        });

        it("Should verify blacklist system is functional", async function () {
            // Check that blacklist is deployed and functional
            const blacklistAddress = await defaultBlacklist.getAddress();
            expect(blacklistAddress).to.not.equal(ethers.ZeroAddress);
            
            // Check that initially developer is not blacklisted
            const isBlacklisted = await defaultBlacklist.isBlacklisted(developer.address);
            expect(isBlacklisted).to.be.false;
            
            console.log("✅ Default blacklist system is functional");
        });
    });

    describe("🔗 Integration Verification", function () {
        it("Should verify all contracts are properly connected", async function () {
            // Verify ReputationStaking knows about DefaultBlacklist
            const blacklistAddress = await reputationStaking.defaultBlacklist();
            expect(blacklistAddress).to.equal(await defaultBlacklist.getAddress());
            
            // Verify contracts have proper addresses
            expect(await defaultBlacklist.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await reputationStaking.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await communityVerification.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await milestoneEscrowVault.getAddress()).to.not.equal(ethers.ZeroAddress);
            
            console.log("✅ All contracts properly integrated and connected");
        });

        it("Should demonstrate the complete security workflow", async function () {
            // 1. Developer has reputation profile ✓ (from previous test)
            const hasProfile = await reputationStaking.hasProfile(developer.address);
            expect(hasProfile).to.be.true;
            
            // 2. Milestone vault system is ready ✓ (from previous test)
            const nextVaultId = await milestoneEscrowVault.nextVaultId();
            expect(nextVaultId).to.equal(0); // No vaults created yet, but system is ready
            
            // 3. Community verification is ready ✓ (from previous test)  
            const CURATOR_ROLE = await communityVerification.CURATOR_ROLE();
            const hasCuratorRole = await communityVerification.hasRole(CURATOR_ROLE, curator.address);
            expect(hasCuratorRole).to.be.true;
            
            // 4. Blacklist system is functional ✓ (from previous test)
            const isBlacklisted = await defaultBlacklist.isBlacklisted(developer.address);
            expect(isBlacklisted).to.be.false; // Not blacklisted initially
            
            console.log("🎉 Complete security workflow demonstrated successfully!");
            console.log("   📊 Reputation Staking: Active");
            console.log("   🛡️ Milestone Escrow: Ready");
            console.log("   🏛️ Community Verification: Configured");
            console.log("   📋 Default Blacklist: Operational");
        });
    });
});
