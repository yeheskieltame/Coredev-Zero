# Dokumentasi & Rangkuman Proyek: "Coredev Zero"

## 1. Visi & Tujuan Proyek

**Tujuan Utama**: Membuat platform kredit terdesentralisasi pertama yang dirancang khusus untuk **developer individu atau tim kecil** di ekosistem Core DAO (dan Web3 secara umum).

**Masalah yang Dipecahkan**: Developer berbakat seringkali kesulitan mendapatkan modal awal karena mereka tidak memiliki entitas legal atau aset jaminan yang besar.

**Solusi Inovatif**: Platform kita mengubah **reputasi digital** seorang developer (aktivitas GitHub, riwayat on-chain, prestasi di *hackathon*) menjadi sebuah **"On-Chain CV"** yang bisa dianalisis oleh *lender*. Ini memungkinkan pendanaan berbasis rekam jejak dan kepercayaan, bukan jaminan aset.

---

## 2. Perbandingan Konseptual: Wildcat vs. "Coredev Zero"

| Aspek | Wildcat Protocol (Inspirasi) | "Coredev Zero" (Inovasi Kita) |
| :--- | :--- | :--- |
| **Target Peminjam** | Entitas legal, institusi besar. | Developer individu, tim kecil. |
| **Basis Kepercayaan**| Reputasi *off-chain* & kekuatan hukum. | **Dasbor Reputasi Digital** (GitHub, On-Chain).|
| **Mitigasi Risiko** | Ancaman tuntutan hukum. | **Stake `tCORE`** & reputasi on-chain (SBT).|
| **Model Pasar** | Pasar terisolasi per institusi. | Pasar terisolasi per proyek developer. |

---

## 3. Arsitektur & Peran Smart Contract

Proyek ini menggunakan arsitektur modular untuk keamanan dan keterbacaan.

* **`MarketFactory.sol`**: **Pusat Kontrol.** Bertindak sebagai "pabrik" yang membuat pasar baru dan sebagai admin yang mengatur peran (`AccessControl`).
* **`Market.sol`**: **Ruang Proyek.** Kontrak terisolasi untuk satu proposal pinjaman, mengelola dana dari *lender* dan siklus hidup pinjaman.
* **`StakingVault.sol`**: **Brankas Komitmen.** Tempat developer men-stake `tCORE` (token native) sebagai bukti keseriusan dan syarat untuk membuat pasar.
* **`DeveloperProfile.sol`**: **Kartu Identitas.** Menyimpan data dasar developer dan tautan ke portofolio detail di IPFS.
* **`ReputationSBT.sol`**: **Lemari Piala.** Menerbitkan lencana pencapaian (Soul-Bound Token) yang tidak bisa ditransfer, seperti "Pinjaman Lunas".

---

## 4. Peran Aset dalam Ekosistem

* **`sUSDT` (Token ERC20)**: **Aset Transaksional.**
    * Digunakan oleh *lender* untuk **mendanai** proyek.
    * Digunakan oleh *developer* untuk **menerima** pinjaman dan **membayar kembali** utang + bunga.
    * Tujuannya adalah stabilitas nilai dalam semua transaksi finansial.

* **`tCORE` (Token Native)**: **Aset Utilitas.**
    * Digunakan oleh *developer* untuk melakukan **`stake`** di `StakingVault`.
    * Fungsinya sebagai **jaminan komitmen (*skin in the game*)** dan syarat untuk bisa membuat pasar pinjaman.

---

## 5. Penjelasan Fungsi & Rumus per Kontrak

### `MarketFactory.sol`
* `grantDeveloperRole(address)`: (Admin) Memberi peran pada developer.
* `createProfile(...)`: (Developer) Membuat profil on-chain.
* `createMarket(...)`: (Developer yang sudah di-whitelist & stake) Membuat pasar pinjaman baru.
* `awardRepaymentSBT(...)`: (Admin) Memberikan lencana SBT setelah pinjaman lunas.

### `StakingVault.sol`
* `stake()`: `payable` (Developer) Mengirim `tCORE` untuk di-stake.
* `unstake(uint)`: (Developer) Menarik kembali `tCORE` yang di-stake.

### `Market.sol`
* `deposit(uint)`: (Lender) Menyetorkan `sUSDT` untuk mendanai pasar.
* `startAndBorrow()`: (Borrower) Menarik semua dana `sUSDT` yang terkumpul.
* `repay()`: (Borrower) Mengembalikan `sUSDT` (pokok + bunga).
* `claim()`: (Lender) Menarik kembali `sUSDT` (pokok + bunga) setelah dilunasi.
* `markAsDefaulted()`: (Siapa saja) Menandai pinjaman gagal bayar jika tenor lewat.

#### **Rumus Bunga & Keuntungan Lender (Model Tetap)**
Rumus ini digunakan di dalam fungsi `repay()` dan `claim()`.

1.  **Hitung Total Bunga Proyek**:
    * `Total Bunga = (Jumlah Pinjaman * Bunga Tahunan BPS / 10000) * (Durasi Pinjaman Detik / Total Detik per Tahun)`

2.  **Hitung Keuntungan per Lender**:
    * `Keuntungan Lender = (Deposit Lender / Jumlah Pinjaman) * Total Bunga`

3.  **Total yang Diklaim Lender**:
    * `Total Klaim = Deposit Lender + Keuntungan Lender`

---

## 6. Alur Kerja Pengguna (User Journey)

### Alur Developer (Peminjam)
1.  **Verifikasi & Stake**: Di-whitelist oleh Admin, lalu men-stake 1 `tCORE` ke `StakingVault`.
2.  **Buat Profil & Proposal**: Membuat profil via `createProfile` dan membuat pasar via `createMarket`, menautkan detail proyek dari IPFS.
3.  **Dapatkan Pendanaan**: Menunggu *lender* mengisi pasar hingga 100%.
4.  **Eksekusi**: Memanggil `startAndBorrow()` untuk menerima dana `sUSDT`.
5.  **Lunasi & Bangun Reputasi**: Memanggil `repay()` untuk melunasi pinjaman. Admin kemudian memberikan SBT sebagai bukti reputasi.
6.  **Tarik Stake**: Memanggil `unstake()` untuk menarik kembali `tCORE`.

### Alur Lender (Investor)
1.  **Analisis**: Membuka platform, melihat daftar developer dan proyek mereka. Mempelajari "On-Chain CV" developer (GitHub, prestasi, riwayat on-chain) dan "Project Data Room" (proposal di IPFS).
2.  **Deposit**: Setelah yakin, melakukan `approve` dan `deposit` `sUSDT` ke pasar yang dipilih.
3.  **Memantau**: Menunggu hingga pasar terdanai penuh dan pinjaman dimulai.
4.  **Klaim Keuntungan**: Setelah pinjaman dilunasi oleh developer, memanggil `claim()` untuk menarik kembali modal beserta keuntungan bunga yang sudah disepakati.
