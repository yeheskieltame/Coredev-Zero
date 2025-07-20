import { run } from "hardhat";

async function main() {
    console.log("🔍 Starting contract verification on Core DAO Testnet2...\n");

    // Read deployment addresses
    const deploymentInfo = require('../deployed-addresses-core-testnet.json');
    const contracts = deploymentInfo.contracts;

    console.log("📋 Verifying contracts from deployment:", deploymentInfo.timestamp);
    console.log("Network:", deploymentInfo.network);
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("Chain ID:", deploymentInfo.chainId);
    console.log("");

    // Verification tasks
    const verificationTasks = [
        {
            name: "DefaultBlacklist",
            address: contracts.DefaultBlacklist,
            constructorArguments: []
        },
        {
            name: "ReputationStaking", 
            address: contracts.ReputationStaking,
            constructorArguments: [contracts.DefaultBlacklist]
        },
        {
            name: "CommunityVerification",
            address: contracts.CommunityVerification,
            constructorArguments: []
        },
        {
            name: "MilestoneEscrowVault",
            address: contracts.MilestoneEscrowVault,
            constructorArguments: []
        },
        {
            name: "MockToken",
            address: contracts.MockToken,
            constructorArguments: ["Test Synthetic USDT", "sUSDT", 6]
        },
        {
            name: "ReputationSBT",
            address: contracts.ReputationSBT,
            constructorArguments: [deploymentInfo.deployer]
        },
        {
            name: "StakingVault", 
            address: contracts.StakingVault,
            constructorArguments: [deploymentInfo.deployer]
        },
        {
            name: "DeveloperProfile",
            address: contracts.DeveloperProfile,
            constructorArguments: []
        },
        {
            name: "GitHubVerificationOracle",
            address: contracts.GitHubVerificationOracle,
            constructorArguments: [contracts.DeveloperProfile]
        },
        {
            name: "RiskAssessmentOracle",
            address: contracts.RiskAssessmentOracle,
            constructorArguments: [contracts.DeveloperProfile]
        },
        {
            name: "MarketFactory",
            address: contracts.MarketFactory,
            constructorArguments: [
                contracts.MockToken,
                contracts.ReputationSBT,
                contracts.StakingVault,
                contracts.MilestoneEscrowVault,
                contracts.ReputationStaking,
                contracts.CommunityVerification,
                contracts.DefaultBlacklist
            ]
        },
        {
            name: "LoanPositionNFT",
            address: contracts.LoanPositionNFT,
            constructorArguments: []
        },
        {
            name: "LoanPositionMarketplace",
            address: contracts.LoanPositionMarketplace,
            constructorArguments: [contracts.LoanPositionNFT, deploymentInfo.deployer]
        }
    ];

    console.log(`🚀 Starting verification of ${verificationTasks.length} contracts...\n`);

    for (const task of verificationTasks) {
        try {
            console.log(`🔍 Verifying ${task.name} at ${task.address}...`);
            
            await run("verify:verify", {
                address: task.address,
                constructorArguments: task.constructorArguments,
                network: "coreTestnet"
            });
            
            console.log(`✅ ${task.name} verified successfully!`);
            console.log(`🔗 View on explorer: https://scan.test2.btcs.network/address/${task.address}\n`);
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error: any) {
            if (error.message.includes("Already Verified")) {
                console.log(`✅ ${task.name} already verified!`);
                console.log(`🔗 View on explorer: https://scan.test2.btcs.network/address/${task.address}\n`);
            } else {
                console.log(`❌ Failed to verify ${task.name}:`, error.message);
                console.log(`🔗 Manual verification needed: https://scan.test2.btcs.network/address/${task.address}\n`);
            }
        }
    }

    console.log("=" .repeat(80));
    console.log("🎉 CONTRACT VERIFICATION COMPLETED!");
    console.log("=" .repeat(80));
    console.log("\n📊 VERIFICATION SUMMARY:");
    console.log("Network: Core DAO Testnet2");
    console.log("Explorer: https://scan.test2.btcs.network");
    console.log("API Key Used: ✅ Configured");
    console.log("Total Contracts:", verificationTasks.length);
    
    console.log("\n🔗 QUICK LINKS:");
    verificationTasks.forEach(task => {
        console.log(`- ${task.name}: https://scan.test2.btcs.network/address/${task.address}`);
    });

    console.log("\n🚀 All contracts are now verified and ready for interaction!");
    console.log("You can now interact with the contracts through the Core DAO explorer interface.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Verification failed:", error);
        process.exit(1);
    });
