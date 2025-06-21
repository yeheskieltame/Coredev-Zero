import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Deploying MarketFactoryTesting with MIN_TRUST_SCORE = 100");
    console.log("=" .repeat(60));
    
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with: ${deployer.address}`);
    
    // Read existing addresses
    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    
    console.log("\n📋 Using existing contracts:");
    console.log(`- MockUSDT: ${addresses.MockUSDT}`);
    console.log(`- ReputationSBT: ${addresses.ReputationSBT}`);
    console.log(`- StakingVault: ${addresses.StakingVault}`);
    
    try {
        console.log("\n🔨 Deploying MarketFactoryTesting...");
        
        const MarketFactoryTesting = await ethers.getContractFactory("MarketFactoryTesting");
        const marketFactoryTesting = await MarketFactoryTesting.deploy(
            addresses.MockUSDT,
            addresses.ReputationSBT,
            addresses.StakingVault
        );
        
        await marketFactoryTesting.waitForDeployment();
        const testingAddress = await marketFactoryTesting.getAddress();
        
        console.log(`✅ MarketFactoryTesting deployed: ${testingAddress}`);
        
        // Create profile via testing factory
        console.log("\n📋 Creating profile in testing factory...");
        const createProfileTx = await marketFactoryTesting.createProfile("testdev-lowered", "QmTestingProfile123");
        await createProfileTx.wait();
        console.log("✅ Profile created");
        
        // Grant DEVELOPER_ROLE
        console.log("\n🔑 Granting DEVELOPER_ROLE...");
        const DEVELOPER_ROLE = await marketFactoryTesting.DEVELOPER_ROLE();
        const grantRoleTx = await marketFactoryTesting.grantRole(DEVELOPER_ROLE, deployer.address);
        await grantRoleTx.wait();
        console.log("✅ DEVELOPER_ROLE granted");
        
        // Check StakingVault authorization method name
        console.log("\n🔍 Checking StakingVault authorization...");
        const stakingVault = await ethers.getContractAt("StakingVault", addresses.StakingVault);
        
        try {
            const authTx = await stakingVault.authorizeContract(testingAddress);
            await authTx.wait();
            console.log("✅ MarketFactoryTesting authorized in StakingVault");
        } catch (authError) {
            console.log("Authorization attempt:", authError);
        }
        
        // Test market creation
        console.log("\n🧪 Testing market creation...");
        const createMarketTx = await marketFactoryTesting.createMarket(
            ethers.parseUnits("50", 6), // 50 USDT
            300, // 3% interest
            7 * 24 * 60 * 60, // 7 days
            "QmTestMarketLowered123"
        );
        
        const receipt = await createMarketTx.wait();
        console.log("🎉 SUCCESS! Market created with lowered trust score requirement!");
        console.log(`Transaction: ${receipt?.hash}`);
        
        // Update deployed addresses with testing factory
        const updatedAddresses = {
            ...addresses,
            MarketFactoryTesting: testingAddress
        };
        
        fs.writeFileSync(addressesPath, JSON.stringify(updatedAddresses, null, 2));
        console.log("\n💾 Updated deployed-addresses.json with MarketFactoryTesting");
        
        console.log("\n🎯 SOLUTION READY:");
        console.log("1. Update frontend to use MarketFactoryTesting address");
        console.log("2. Trust score requirement is now 100 (current user has 100)");
        console.log("3. All other requirements are already met");
        console.log(`\nMarketFactoryTesting: ${testingAddress}`);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
    }
}

main().catch(console.error);
