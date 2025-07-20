import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("📄 Flattening contracts for manual verification...\n");

    // Read deployment info
    const deploymentInfo = require('../deployed-addresses-core-testnet.json');
    const contracts = deploymentInfo.contracts;

    // Create flattened directory
    const flattenedDir = path.join(__dirname, '..', 'flattened');
    if (!fs.existsSync(flattenedDir)) {
        fs.mkdirSync(flattenedDir);
    }

    // Contracts to flatten
    const contractsToFlatten = [
        {
            name: "DefaultBlacklist",
            file: "contracts/security/DefaultBlacklist.sol",
            address: contracts.DefaultBlacklist
        },
        {
            name: "ReputationStaking",
            file: "contracts/security/ReputationStaking.sol", 
            address: contracts.ReputationStaking
        },
        {
            name: "CommunityVerification",
            file: "contracts/security/CommunityVerification.sol",
            address: contracts.CommunityVerification
        },
        {
            name: "MilestoneEscrowVault", 
            file: "contracts/security/MilestoneEscrowVault.sol",
            address: contracts.MilestoneEscrowVault
        },
        {
            name: "MockToken",
            file: "contracts/tokens/MockToken.sol",
            address: contracts.MockToken
        },
        {
            name: "ReputationSBT",
            file: "contracts/tokens/ReputationSBT.sol",
            address: contracts.ReputationSBT
        },
        {
            name: "StakingVault",
            file: "contracts/staking/StakingVault.sol",
            address: contracts.StakingVault
        },
        {
            name: "MarketFactory",
            file: "contracts/MarketFactoryEnhanced.sol",
            address: contracts.MarketFactory
        },
        {
            name: "LoanPositionNFT",
            file: "contracts/tokens/LoanPositionNFT.sol",
            address: contracts.LoanPositionNFT
        }
    ];

    console.log("🔄 Flattening contracts...\n");

    for (const contract of contractsToFlatten) {
        try {
            console.log(`📄 Flattening ${contract.name}...`);
            
            const flattened = await run("flatten:get-flattened-sources", {
                files: [contract.file]
            });

            const outputFile = path.join(flattenedDir, `${contract.name}_flattened.sol`);
            fs.writeFileSync(outputFile, flattened);
            
            console.log(`✅ ${contract.name} flattened to: ${outputFile}`);
            
        } catch (error) {
            console.log(`❌ Failed to flatten ${contract.name}:`, error);
        }
    }

    // Create verification guide
    const verificationGuide = `
# 🔍 Manual Contract Verification Guide
Generated: ${new Date().toISOString()}
Network: Core DAO Testnet2
Explorer: https://scan.test2.btcs.network

## 📋 Deployed Contracts

${contractsToFlatten.map(contract => `
### ${contract.name}
- **Address**: \`${contract.address}\`
- **Explorer**: https://scan.test2.btcs.network/address/${contract.address}
- **Flattened File**: \`flattened/${contract.name}_flattened.sol\`
- **Original File**: \`${contract.file}\`
`).join('')}

## 🚀 Manual Verification Steps

1. **Visit Core DAO Testnet2 Explorer**: https://scan.test2.btcs.network
2. **Navigate to contract address** (links above)
3. **Go to "Contract" tab**
4. **Click "Verify and Publish"**
5. **Fill verification form**:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.28+commit.7893614a
   - **Open Source License**: MIT
6. **Copy and paste flattened source code** from the files in \`flattened/\` directory
7. **For contracts with constructor arguments**, use these values:

### Constructor Arguments:

#### DefaultBlacklist
- **Arguments**: None

#### ReputationStaking  
- **Arguments**: ${contracts.DefaultBlacklist}

#### CommunityVerification
- **Arguments**: None

#### MilestoneEscrowVault
- **Arguments**: None

#### MockToken
- **Arguments**: 
  - name: "Test Synthetic USDT"
  - symbol: "sUSDT"
  - decimals: 6

#### ReputationSBT
- **Arguments**: ${deploymentInfo.deployer}

#### StakingVault
- **Arguments**: ${deploymentInfo.deployer}

#### MarketFactory
- **Arguments**:
  - _assetAddress: ${contracts.MockToken}
  - _reputationSBTAddress: ${contracts.ReputationSBT}
  - _stakingVaultAddress: ${contracts.StakingVault}
  - _milestoneEscrowVault: ${contracts.MilestoneEscrowVault}
  - _reputationStaking: ${contracts.ReputationStaking}
  - _communityVerification: ${contracts.CommunityVerification}
  - _defaultBlacklist: ${contracts.DefaultBlacklist}

#### LoanPositionNFT
- **Arguments**: None

#### LoanPositionMarketplace
- **Arguments**:
  - _loanPositionNFT: ${contracts.LoanPositionNFT}
  - _feeRecipient: ${deploymentInfo.deployer}

## 📝 Notes

- **Compiler Optimization**: Enabled (200 runs)
- **EVM Version**: Default (Paris)
- **Constructor Arguments**: Must be ABI-encoded for complex types
- **API Key**: ${process.env.CORE_SCAN_API_KEY || 'Not provided'}

## 🔗 Quick Links

${contractsToFlatten.map(contract => `- [${contract.name}](https://scan.test2.btcs.network/address/${contract.address})`).join('\n')}

Generated by CoreDev Zero deployment script.
`;

    const guideFile = path.join(flattenedDir, 'VERIFICATION_GUIDE.md');
    fs.writeFileSync(guideFile, verificationGuide);

    console.log("\n" + "=".repeat(80));
    console.log("📄 CONTRACT FLATTENING COMPLETED!");
    console.log("=".repeat(80));
    console.log(`\n📁 Flattened contracts saved to: ${flattenedDir}`);
    console.log(`📋 Verification guide: ${guideFile}`);
    console.log("\n🔍 Manual verification steps:");
    console.log("1. Go to https://scan.test2.btcs.network");
    console.log("2. Navigate to each contract address");
    console.log("3. Use the flattened source code for verification");
    console.log("4. Follow the constructor arguments in the guide");
    console.log("\n🚀 Ready for manual verification!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Flattening failed:", error);
        process.exit(1);
    });
