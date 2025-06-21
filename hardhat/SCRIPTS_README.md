# 📁 CoreDev Zero - Production Scripts

Direktori `/scripts` telah dibersihkan dan hanya berisi script essential untuk production.

## 🔧 Script Available:

### 1. **deploy-enhanced.ts**
- **Purpose**: Main deployment script untuk semua contracts
- **Usage**: `npx hardhat run scripts/deploy-enhanced.ts --network coreTestnet`
- **Output**: Deploy semua contracts dan update deployed-addresses.json

### 2. **deploy-testing-factory-simple.ts** 
- **Purpose**: Deploy MarketFactoryTesting dengan trust score requirement rendah
- **Usage**: `npx hardhat run scripts/deploy-testing-factory-simple.ts --network coreTestnet`
- **Use Case**: Development/testing ketika perlu bypass trust score requirement

### 3. **extract-abis.ts**
- **Purpose**: Extract ABI dari compiled contracts untuk frontend
- **Usage**: `npx hardhat run scripts/extract-abis.ts`
- **Output**: Update frontend-abis.json untuk frontend integration

### 4. **interact-contracts-simple.ts**
- **Purpose**: Basic contract interaction dan testing
- **Usage**: `npx hardhat run scripts/interact-contracts-simple.ts --network coreTestnet`
- **Features**: Create profile, check status, basic operations

### 5. **network-status.ts**
- **Purpose**: Check network connection dan contract deployment status
- **Usage**: `npx hardhat run scripts/network-status.ts --network coreTestnet`
- **Features**: Verify contracts exist, check network health

## 🚀 Production Workflow:

1. **Fresh Deployment**:
   ```bash
   npx hardhat run scripts/deploy-enhanced.ts --network coreTestnet
   npx hardhat run scripts/extract-abis.ts
   ```

2. **Testing with Lower Requirements**:
   ```bash
   npx hardhat run scripts/deploy-testing-factory-simple.ts --network coreTestnet
   ```

3. **Verify Deployment**:
   ```bash
   npx hardhat run scripts/network-status.ts --network coreTestnet
   ```

4. **Basic Interaction**:
   ```bash
   npx hardhat run scripts/interact-contracts-simple.ts --network coreTestnet
   ```

## 📋 Files Cleaned Up:

Removed 22 debug/testing scripts:
- All boost-trust-* variations
- All debug-* scripts  
- All test-market-creation-* scripts
- All complete-setup-* variations
- All fix-* scripts
- All grant-* and check-* scripts

**Result**: Clean, focused, production-ready script directory! 🎯
