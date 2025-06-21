import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Core DAO Testnet Market Check...\n");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  // Core DAO Testnet contract addresses (from frontend config)
  const MARKET_FACTORY_ADDRESS = "0x3C8a900a27b41bfa9e3698CF2dE38F6Ff95F8E2A"; // MarketFactoryTesting
  
  try {
    // Connect to MarketFactory
    const marketFactory = await ethers.getContractAt("MarketFactory", MARKET_FACTORY_ADDRESS);
    
    console.log("📊 Market Factory Info:");
    console.log("  Address:", MARKET_FACTORY_ADDRESS);
    
    // Get all markets
    const allMarkets = await marketFactory.getAllMarkets();
    console.log("  Total Markets:", allMarkets.length);
    
    if (allMarkets.length > 0) {
      console.log("  Market Addresses:");
      allMarkets.forEach((addr, i) => {
        console.log(`    ${i + 1}. ${addr}`);
      });
      
      // Get details for each market
      console.log("\n📋 Market Details:");
      for (let i = 0; i < allMarkets.length; i++) {
        const marketAddress = allMarkets[i];
        try {
          const market = await ethers.getContractAt("Market", marketAddress);
          
          const borrower = await market.borrower();
          const amount = await market.loanAmount();
          const interestRate = await market.interestRateBps();
          const duration = await market.tenorSeconds();
          const projectCID = await market.projectDataCID();
          const state = await market.currentState();
          
          console.log(`\n  Market ${i + 1} (${marketAddress}):`);
          console.log(`    Borrower: ${borrower}`);
          console.log(`    Amount: ${ethers.formatEther(amount)} tCORE`);
          console.log(`    Interest Rate: ${Number(interestRate) / 100}%`);
          console.log(`    Duration: ${Number(duration) / (24 * 60 * 60)} days`);
          console.log(`    Project CID: ${projectCID}`);
          console.log(`    State: ${state} (0=Funding, 1=Active, 2=Repaid, 3=Defaulted)`);
        } catch (err) {
          console.log(`    ❌ Error reading market ${i + 1}: ${err}`);
        }
      }
    } else {
      console.log("  ℹ️  No markets found");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch(console.error);
