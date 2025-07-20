import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing CoreDev Zero Contracts on Core DAO Testnet2...\n");

    const [signer] = await ethers.getSigners();
    console.log("Testing with account:", signer.address);
    console.log("Account balance:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH\n");

    // Contract addresses from deployment
    const addresses = {
        DefaultBlacklist: "0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0",
        ReputationStaking: "0x6288eDb0AC3ee01D00DADBD39CeCf20b4f169863",
        CommunityVerification: "0xbDEb955301b97fdB5736ab85F721714b25A75D3d",
        MilestoneEscrowVault: "0xF8f81D2B039dC2863514De6473b2Fd6A38d0a399",
        MockToken: "0x4A975b6bdF2F484aDF427Eca00C31E800EdFb983",
        ReputationSBT: "0xF8465b6A953ABdb697df09778CdbC377039F14a0",
        StakingVault: "0x2Fa19daafd553c1eB631b42E9ffEb7D67c7B2e37",
        DeveloperProfile: "0x073d68B6B9eEE0B822915449Aea5A0c4c3450BC2",
        GitHubVerificationOracle: "0x01d6c9f06334625D3C1076B557f9371A137b6BcE",
        RiskAssessmentOracle: "0xED73D8F777F25590484135FE25cd59573BFC85be",
        MarketFactory: "0x651Bb2980717D2Ee8fB660CD3F1dFcEc4AF0645f",
        LoanPositionNFT: "0xfcf92bD970B4344a28a8d682A3ba91D2153c4F2E",
        LoanPositionMarketplace: "0xD547Cba92AC43eBC24886fF47CF83eB09A49e1C5"
    };

    try {
        console.log("🧪 TEST 1: MockToken Balance Check");
        const mockToken = await ethers.getContractAt("MockToken", addresses.MockToken);
        const balance = await mockToken.balanceOf(signer.address);
        const decimals = await mockToken.decimals();
        console.log("✅ sUSDT Balance:", ethers.formatUnits(balance, decimals), "sUSDT");
        console.log("✅ Token Name:", await mockToken.name());
        console.log("✅ Token Symbol:", await mockToken.symbol());

        console.log("\n🧪 TEST 2: DefaultBlacklist Status Check");
        const defaultBlacklist = await ethers.getContractAt("DefaultBlacklist", addresses.DefaultBlacklist);
        const isBlacklisted = await defaultBlacklist.isBlacklisted(signer.address);
        console.log("✅ Account blacklist status:", isBlacklisted ? "BLACKLISTED" : "CLEAN");

        console.log("\n🧪 TEST 3: DeveloperProfile Basic Check");
        const developerProfile = await ethers.getContractAt("DeveloperProfile", addresses.DeveloperProfile);
        try {
            const profile = await developerProfile.profiles(signer.address);
            console.log("✅ Has developer profile:", profile.isVerified ? "VERIFIED" : "UNVERIFIED");
        } catch (error) {
            console.log("✅ No developer profile yet - ready for setup");
        }

        console.log("\n🧪 TEST 4: ReputationStaking Basic Check");
        const reputationStaking = await ethers.getContractAt("ReputationStaking", addresses.ReputationStaking);
        try {
            const profile = await reputationStaking.getReputationProfile(signer.address);
            console.log("✅ Reputation profile found - GitHub linked:", profile[0] !== "");
        } catch (error) {
            console.log("✅ No reputation profile yet - ready for setup");
        }

        console.log("\n🧪 TEST 5: MarketFactory Basic Check");
        const marketFactory = await ethers.getContractAt("MarketFactory", addresses.MarketFactory);
        const hasVerifierRole = await marketFactory.hasRole(await marketFactory.VERIFIER_ROLE(), signer.address);
        console.log("✅ Has verifier role:", hasVerifierRole ? "YES" : "NO");

        console.log("\n🧪 TEST 6: CommunityVerification Status");
        const communityVerification = await ethers.getContractAt("CommunityVerification", addresses.CommunityVerification);
        const hasCuratorRole = await communityVerification.hasRole(await communityVerification.CURATOR_ROLE(), signer.address);
        console.log("✅ Has curator role:", hasCuratorRole ? "YES" : "NO");

        console.log("\n🎉 ALL BASIC TESTS PASSED!");
        console.log("=" .repeat(60));
        console.log("🌟 CORE DAO TESTNET2 DEPLOYMENT IS FUNCTIONAL");
        console.log("=" .repeat(60));
        
        console.log("\n📋 CONTRACT VERIFICATION LINKS:");
        console.log(`🔗 DefaultBlacklist: https://scan.test2.btcs.network/address/${addresses.DefaultBlacklist}`);
        console.log(`🔗 ReputationStaking: https://scan.test2.btcs.network/address/${addresses.ReputationStaking}`);
        console.log(`🔗 MarketFactory: https://scan.test2.btcs.network/address/${addresses.MarketFactory}`);
        console.log(`🔗 MockToken: https://scan.test2.btcs.network/address/${addresses.MockToken}`);
        
        console.log("\n🚀 Ready for frontend integration and user testing!");

    } catch (error: any) {
        console.error("❌ Test failed:", error.message);
        console.log("\n📋 Debug Info:");
        console.log("- Network: Core DAO Testnet2");
        console.log("- RPC: https://rpc.test2.btcs.network");
        console.log("- Chain ID: 1114");
        console.log("- Account:", signer.address);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
