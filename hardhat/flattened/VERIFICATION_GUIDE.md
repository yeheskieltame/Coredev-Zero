
# 🔍 Manual Contract Verification Guide
Generated: 2025-07-20T03:26:42.649Z
Network: Core DAO Testnet2
Explorer: https://scan.test2.btcs.network

## 📋 Deployed Contracts


### DefaultBlacklist
- **Address**: `0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0`
- **Explorer**: https://scan.test2.btcs.network/address/0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0
- **Flattened File**: `flattened/DefaultBlacklist_flattened.sol`
- **Original File**: `contracts/security/DefaultBlacklist.sol`

### ReputationStaking
- **Address**: `0x6288eDb0AC3ee01D00DADBD39CeCf20b4f169863`
- **Explorer**: https://scan.test2.btcs.network/address/0x6288eDb0AC3ee01D00DADBD39CeCf20b4f169863
- **Flattened File**: `flattened/ReputationStaking_flattened.sol`
- **Original File**: `contracts/security/ReputationStaking.sol`

### CommunityVerification
- **Address**: `0xbDEb955301b97fdB5736ab85F721714b25A75D3d`
- **Explorer**: https://scan.test2.btcs.network/address/0xbDEb955301b97fdB5736ab85F721714b25A75D3d
- **Flattened File**: `flattened/CommunityVerification_flattened.sol`
- **Original File**: `contracts/security/CommunityVerification.sol`

### MilestoneEscrowVault
- **Address**: `0xF8f81D2B039dC2863514De6473b2Fd6A38d0a399`
- **Explorer**: https://scan.test2.btcs.network/address/0xF8f81D2B039dC2863514De6473b2Fd6A38d0a399
- **Flattened File**: `flattened/MilestoneEscrowVault_flattened.sol`
- **Original File**: `contracts/security/MilestoneEscrowVault.sol`

### MockToken
- **Address**: `0x4A975b6bdF2F484aDF427Eca00C31E800EdFb983`
- **Explorer**: https://scan.test2.btcs.network/address/0x4A975b6bdF2F484aDF427Eca00C31E800EdFb983
- **Flattened File**: `flattened/MockToken_flattened.sol`
- **Original File**: `contracts/tokens/MockToken.sol`

### ReputationSBT
- **Address**: `0xF8465b6A953ABdb697df09778CdbC377039F14a0`
- **Explorer**: https://scan.test2.btcs.network/address/0xF8465b6A953ABdb697df09778CdbC377039F14a0
- **Flattened File**: `flattened/ReputationSBT_flattened.sol`
- **Original File**: `contracts/tokens/ReputationSBT.sol`

### StakingVault
- **Address**: `0x2Fa19daafd553c1eB631b42E9ffEb7D67c7B2e37`
- **Explorer**: https://scan.test2.btcs.network/address/0x2Fa19daafd553c1eB631b42E9ffEb7D67c7B2e37
- **Flattened File**: `flattened/StakingVault_flattened.sol`
- **Original File**: `contracts/staking/StakingVault.sol`

### MarketFactory
- **Address**: `0x651Bb2980717D2Ee8fB660CD3F1dFcEc4AF0645f`
- **Explorer**: https://scan.test2.btcs.network/address/0x651Bb2980717D2Ee8fB660CD3F1dFcEc4AF0645f
- **Flattened File**: `flattened/MarketFactory_flattened.sol`
- **Original File**: `contracts/MarketFactoryEnhanced.sol`

### LoanPositionNFT
- **Address**: `0xfcf92bD970B4344a28a8d682A3ba91D2153c4F2E`
- **Explorer**: https://scan.test2.btcs.network/address/0xfcf92bD970B4344a28a8d682A3ba91D2153c4F2E
- **Flattened File**: `flattened/LoanPositionNFT_flattened.sol`
- **Original File**: `contracts/tokens/LoanPositionNFT.sol`


## 🚀 Manual Verification Steps

1. **Visit Core DAO Testnet2 Explorer**: https://scan.test2.btcs.network
2. **Navigate to contract address** (links above)
3. **Go to "Contract" tab**
4. **Click "Verify and Publish"**
5. **Fill verification form**:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.28+commit.7893614a
   - **Open Source License**: MIT
6. **Copy and paste flattened source code** from the files in `flattened/` directory
7. **For contracts with constructor arguments**, use these values:

### Constructor Arguments:

#### DefaultBlacklist
- **Arguments**: None

#### ReputationStaking  
- **Arguments**: 0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0

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
- **Arguments**: 0x86979D26A14e17CF2E719dcB369d559f3ad41057

#### StakingVault
- **Arguments**: 0x86979D26A14e17CF2E719dcB369d559f3ad41057

#### MarketFactory
- **Arguments**:
  - _assetAddress: 0x4A975b6bdF2F484aDF427Eca00C31E800EdFb983
  - _reputationSBTAddress: 0xF8465b6A953ABdb697df09778CdbC377039F14a0
  - _stakingVaultAddress: 0x2Fa19daafd553c1eB631b42E9ffEb7D67c7B2e37
  - _milestoneEscrowVault: 0xF8f81D2B039dC2863514De6473b2Fd6A38d0a399
  - _reputationStaking: 0x6288eDb0AC3ee01D00DADBD39CeCf20b4f169863
  - _communityVerification: 0xbDEb955301b97fdB5736ab85F721714b25A75D3d
  - _defaultBlacklist: 0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0

#### LoanPositionNFT
- **Arguments**: None

#### LoanPositionMarketplace
- **Arguments**:
  - _loanPositionNFT: 0xfcf92bD970B4344a28a8d682A3ba91D2153c4F2E
  - _feeRecipient: 0x86979D26A14e17CF2E719dcB369d559f3ad41057

## 📝 Notes

- **Compiler Optimization**: Enabled (200 runs)
- **EVM Version**: Default (Paris)
- **Constructor Arguments**: Must be ABI-encoded for complex types
- **API Key**: 7c7559b08c9744d7b918851b68352605

## 🔗 Quick Links

- [DefaultBlacklist](https://scan.test2.btcs.network/address/0x8E0E31D70267B0c7626DB329B7F0e07AaaD969a0)
- [ReputationStaking](https://scan.test2.btcs.network/address/0x6288eDb0AC3ee01D00DADBD39CeCf20b4f169863)
- [CommunityVerification](https://scan.test2.btcs.network/address/0xbDEb955301b97fdB5736ab85F721714b25A75D3d)
- [MilestoneEscrowVault](https://scan.test2.btcs.network/address/0xF8f81D2B039dC2863514De6473b2Fd6A38d0a399)
- [MockToken](https://scan.test2.btcs.network/address/0x4A975b6bdF2F484aDF427Eca00C31E800EdFb983)
- [ReputationSBT](https://scan.test2.btcs.network/address/0xF8465b6A953ABdb697df09778CdbC377039F14a0)
- [StakingVault](https://scan.test2.btcs.network/address/0x2Fa19daafd553c1eB631b42E9ffEb7D67c7B2e37)
- [MarketFactory](https://scan.test2.btcs.network/address/0x651Bb2980717D2Ee8fB660CD3F1dFcEc4AF0645f)
- [LoanPositionNFT](https://scan.test2.btcs.network/address/0xfcf92bD970B4344a28a8d682A3ba91D2153c4F2E)

Generated by CoreDev Zero deployment script.
