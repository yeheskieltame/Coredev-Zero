import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers"; // Helper untuk memanipulasi waktu
import { MarketFactory, Testnet_sUSDT, ReputationSBT, StakingVault, Market } from "../typechain-types";

describe("Market Lifecycle", function () {
  
  // Variabel untuk menyimpan instance kontrak dan aktor
  let marketFactory: MarketFactory;
  let sUSDT: Testnet_sUSDT;
  let reputationSBT: ReputationSBT;
  let stakingVault: StakingVault;
  let market: Market; // Instance untuk market spesifik yang kita uji
  let admin: HardhatEthersSigner, developer: HardhatEthersSigner, lender: HardhatEthersSigner;

  // Variabel untuk parameter pasar agar mudah digunakan kembali
  const LOAN_AMOUNT = ethers.parseUnits("50000", 6); // sUSDT punya 6 desimal
  const INTEREST_RATE_BPS = 1200; // 12.00%
  const TENOR_SECONDS = 30 * 24 * 60 * 60; // 30 hari

  // `beforeEach` ini lebih kompleks karena kita perlu membuat satu market yang siap diuji
  beforeEach(async function () {
    // 1. Setup Aktor & Deploy Kontrak Utama (sama seperti tes sebelumnya)
    [admin, developer, lender] = await ethers.getSigners();
    
    const sUSDTFactory = await ethers.getContractFactory("Testnet_sUSDT");
    sUSDT = await sUSDTFactory.connect(admin).deploy(admin.address);

    const reputationSBTFactory = await ethers.getContractFactory("ReputationSBT");
    reputationSBT = await reputationSBTFactory.connect(admin).deploy(admin.address);

    const stakingVaultFactory = await ethers.getContractFactory("StakingVault");
    stakingVault = await stakingVaultFactory.connect(admin).deploy(admin.address);

    const marketFactoryFactory = await ethers.getContractFactory("MarketFactory");
    marketFactory = await marketFactoryFactory.connect(admin).deploy(
      await sUSDT.getAddress(),
      await reputationSBT.getAddress(),
      await stakingVault.getAddress()
    );
    await reputationSBT.connect(admin).transferOwnership(await marketFactory.getAddress());

    // 2. Lakukan setup awal untuk developer (whitelist & stake)
    await marketFactory.connect(developer).createProfile("dev-github", "ipfs-cid-profile");
    
    // Add MarketFactory as verifier to DeveloperProfile through MarketFactory
    await marketFactory.connect(admin).addVerifierToDeveloperProfile(await marketFactory.getAddress());
    
    await marketFactory.connect(admin).verifyDeveloper(developer.address, "0x");
    await marketFactory.connect(admin).grantDeveloperRole(developer.address);
    await stakingVault.connect(admin).authorizeContract(await marketFactory.getAddress());
    await stakingVault.connect(developer).stake({ value: ethers.parseEther("1.0") });

    // 3. Buat SATU market untuk kita uji
    await marketFactory.connect(developer).createMarket(
      LOAN_AMOUNT,
      INTEREST_RATE_BPS,
      TENOR_SECONDS,
      "ipfs-cid-project"
    );

    // 4. Dapatkan alamat market yang baru dibuat dan buat instance kontraknya
    const marketAddress = await marketFactory.allMarkets(0);
    market = await ethers.getContractAt("Market", marketAddress);

    // 5. Siapkan lender: beri sUSDT dan lakukan `approve`
    await sUSDT.connect(admin).mint(lender.address, LOAN_AMOUNT);
    await sUSDT.connect(lender).approve(await market.getAddress(), LOAN_AMOUNT);
  });

  // Tes skenario sukses (Happy Path)
  describe("Happy Path", function() {
    it("Should allow a lender to deposit, developer to borrow, repay, and lender to claim", async function () {
      // --- LENDER DEPOSIT ---
      await market.connect(lender).deposit(LOAN_AMOUNT);
      expect(await market.totalDeposited()).to.equal(LOAN_AMOUNT);
      expect(await sUSDT.balanceOf(await market.getAddress())).to.equal(LOAN_AMOUNT);

      // --- DEVELOPER START & BORROW ---
      await market.connect(developer).startAndBorrow();
      expect(await sUSDT.balanceOf(await market.getAddress())).to.equal(0);
      expect(await sUSDT.balanceOf(developer.address)).to.equal(LOAN_AMOUNT);
      expect(await market.currentState()).to.equal(1); // State.Active

      // --- SIMULATE TIME PASSING ---
      // Kita majukan waktu blockchain sebanyak durasi pinjaman + 1 hari
      await time.increase(TENOR_SECONDS + (24 * 60 * 60)); 

      // --- DEVELOPER REPAY ---
      const interest = (LOAN_AMOUNT * BigInt(INTEREST_RATE_BPS) * BigInt(TENOR_SECONDS)) / (BigInt(10000) * BigInt(365 * 24 * 60 * 60));
      const totalOwed = LOAN_AMOUNT + interest;
      
      await sUSDT.connect(admin).mint(developer.address, totalOwed); // Beri developer dana untuk bayar
      await sUSDT.connect(developer).approve(await market.getAddress(), totalOwed);
      await market.connect(developer).repay();
      
      expect(await market.currentState()).to.equal(2); // State.Repaid
      expect(await sUSDT.balanceOf(await market.getAddress())).to.equal(totalOwed);

      // --- LENDER CLAIM ---
      const initialLenderBalance = await sUSDT.balanceOf(lender.address);
      await market.connect(lender).claim();
      const finalLenderBalance = await sUSDT.balanceOf(lender.address);

      // Saldo lender harus bertambah sebesar pokok + bunga
      expect(finalLenderBalance).to.equal(initialLenderBalance + totalOwed);
      expect(await sUSDT.balanceOf(await market.getAddress())).to.equal(0);
    });
  });

  // Tes skenario gagal
  describe("Failure Cases", function() {
    it("Should prevent depositing more than the loan amount", async function() {
        await market.connect(lender).deposit(LOAN_AMOUNT);
        // Coba deposit lagi
        await expect(market.connect(lender).deposit(1)).to.be.revertedWith("Market is fully funded");
    });

    it("Should prevent developer from borrowing before fully funded", async function() {
        // Lender hanya deposit sebagian
        await market.connect(lender).deposit(LOAN_AMOUNT / BigInt(2));
        await expect(market.connect(developer).startAndBorrow()).to.be.revertedWith("Funding not complete");
    });
    
    it("Should prevent non-borrower from starting the loan", async function() {
        await market.connect(lender).deposit(LOAN_AMOUNT);
        // Lender mencoba memulai pinjaman
        await expect(market.connect(lender).startAndBorrow()).to.be.revertedWith("Only borrower");
    });

    it("Should allow marking the market as defaulted after tenor expires", async function() {
        await market.connect(lender).deposit(LOAN_AMOUNT);
        await market.connect(developer).startAndBorrow();

        // Majukan waktu, tapi belum cukup lama
        await time.increase(TENOR_SECONDS - (60*60));
        await expect(market.connect(admin).markAsDefaulted()).to.be.revertedWith("Loan term not over yet");

        // Majukan waktu hingga melewati tenor
        await time.increase(60*60 + 1); // Tambah 1 jam + 1 detik
        await market.connect(admin).markAsDefaulted();
        
        expect(await market.currentState()).to.equal(3); // State.Defaulted
    });
  });
});