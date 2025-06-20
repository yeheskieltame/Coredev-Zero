import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MarketFactory, Testnet_sUSDT, ReputationSBT, StakingVault } from "../typechain-types"; // TypeChain otomatis membuat ini!

// `describe` adalah cara untuk mengelompokkan tes untuk satu kontrak atau fitur
describe("MarketFactory", function () {
  
  // Deklarasikan variabel yang akan kita gunakan di semua tes dalam grup ini
  let marketFactory: MarketFactory;
  let sUSDT: Testnet_sUSDT;
  let reputationSBT: ReputationSBT;
  let stakingVault: StakingVault;
  let admin: HardhatEthersSigner, developer: HardhatEthersSigner, lender: HardhatEthersSigner;

  // `beforeEach` adalah "hook" yang berjalan sebelum SETIAP tes (`it` block) dijalankan.
  // Ini sempurna untuk setup, memastikan setiap tes dimulai dari kondisi yang bersih.
  beforeEach(async function () {
    // 1. Dapatkan beberapa akun dari Hardhat untuk berperan sebagai aktor kita
    [admin, developer, lender] = await ethers.getSigners();

    // 2. Deploy semua kontrak dependensi terlebih dahulu
    const sUSDTFactory = await ethers.getContractFactory("Testnet_sUSDT");
    sUSDT = await sUSDTFactory.connect(admin).deploy(admin.address);

    const reputationSBTFactory = await ethers.getContractFactory("ReputationSBT");
    reputationSBT = await reputationSBTFactory.connect(admin).deploy(admin.address);

    const stakingVaultFactory = await ethers.getContractFactory("StakingVault");
    stakingVault = await stakingVaultFactory.connect(admin).deploy(admin.address);

    // 3. Deploy kontrak utama yang ingin kita tes (MarketFactory)
    const marketFactoryFactory = await ethers.getContractFactory("MarketFactory");
    marketFactory = await marketFactoryFactory.connect(admin).deploy(
      await sUSDT.getAddress(),
      await reputationSBT.getAddress(),
      await stakingVault.getAddress()
    );

    // 4. Lakukan konfigurasi pasca-deployment
    await reputationSBT.connect(admin).transferOwnership(await marketFactory.getAddress());
  });

  // `it` mendefinisikan sebuah skenario tes spesifik. Deskripsinya harus jelas.
  it("Should allow a whitelisted and staked developer to create a market", async function () {
    // --- ARRANGE (Persiapan) ---
    // Developer membuat profil dan verifikasi terlebih dahulu
    await marketFactory.connect(developer).createProfile("dev-github", "ipfs-cid-profile");
    
    // Add MarketFactory as verifier to DeveloperProfile through MarketFactory
    await marketFactory.connect(admin).addVerifierToDeveloperProfile(await marketFactory.getAddress());
    
    await marketFactory.connect(admin).verifyDeveloper(developer.address, "0x");
    
    // Admin memberikan peran developer
    await marketFactory.connect(admin).grantDeveloperRole(developer.address);

    // Authorize StakingVault contract
    await stakingVault.connect(admin).authorizeContract(await marketFactory.getAddress());

    // Developer melakukan stake 1 tCORE (token native)
    const stakeAmount = ethers.parseEther("1.0");
    await stakingVault.connect(developer).stake({ value: stakeAmount });

    // --- ACT (Aksi) ---
    // Developer mencoba membuat pasar baru
    const tx = await marketFactory.connect(developer).createMarket(
      ethers.parseUnits("50000", 6), // 50,000 sUSDT (asumsi 6 desimal)
      1200, // 12.00%
      30 * 24 * 60 * 60, // 30 hari
      "ipfs-cid-project"
    );

    // --- ASSERT (Pengecekan Hasil) ---
    // Kita berharap sekarang ada 1 pasar di dalam array `allMarkets`
    const marketAddress = await marketFactory.allMarkets(0);
    expect(marketAddress).to.not.equal(ethers.ZeroAddress);

    // Kita juga bisa mengecek apakah event `MarketCreated` telah dipancarkan
    await expect(tx).to.emit(marketFactory, "MarketCreated");
  });

  it("Should PREVENT a non-whitelisted developer from creating a market", async function () {
    // --- ARRANGE ---
    // Developer ini TIDAK diberi peran oleh admin

    // --- ACT & ASSERT ---
    // Kita berharap transaksi ini GAGAL (reverted) dengan pesan error dari AccessControl
    await expect(
      marketFactory.connect(developer).createMarket(
        ethers.parseUnits("50000", 6),
        1200,
        30 * 24 * 60 * 60,
        "ipfs-cid-project"
      )
    ).to.be.revertedWithCustomError(marketFactory, "AccessControlUnauthorizedAccount");
  });
  
  it("Should PREVENT a whitelisted but non-staked developer from creating a market", async function () {
    // --- ARRANGE ---
    await marketFactory.connect(developer).createProfile("dev-github", "ipfs-cid-profile");
    
    // Add MarketFactory as verifier to DeveloperProfile through MarketFactory
    await marketFactory.connect(admin).addVerifierToDeveloperProfile(await marketFactory.getAddress());
    
    await marketFactory.connect(admin).verifyDeveloper(developer.address, "0x");
    // Admin memberikan peran, TAPI developer LUPA melakukan stake
    await marketFactory.connect(admin).grantDeveloperRole(developer.address);
    await stakingVault.connect(admin).authorizeContract(await marketFactory.getAddress());

    // --- ACT & ASSERT ---
    // Kita berharap transaksi ini GAGAL dengan pesan custom kita
    await expect(
      marketFactory.connect(developer).createMarket(
        ethers.parseUnits("50000", 6),
        1200,
        30 * 24 * 60 * 60,
        "ipfs-cid-project"
      )
    ).to.be.revertedWith("Insufficient available stake");
  });

});