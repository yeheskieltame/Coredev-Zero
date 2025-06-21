# Klarifikasi Alur Create Profile - CoreDev Zero

## 🔍 Analisis Smart Contract DeveloperProfile.sol

### 1. Logika Profile per Wallet
**✅ BENAR:** Setiap wallet address hanya bisa membuat 1 profile

```solidity
function createProfile(
    string memory _githubHandle,
    string memory _profileDataCID
) external {
    require(bytes(profiles[msg.sender].githubHandle).length == 0, "Profile already exists");
    // ...
}
```

**Penjelasan:**
- Smart contract menggunakan `require(bytes(profiles[msg.sender].githubHandle).length == 0, "Profile already exists")`
- Ini memastikan jika profile sudah ada (githubHandle tidak kosong), maka transaksi akan gagal
- Mapping `profiles[address => Profile]` menyimpan profile per wallet address

### 2. Struktur Data Profile

```solidity
struct Profile {
    string githubHandle;        // GitHub username
    string profileDataCID;      // IPFS hash untuk data tambahan
    uint256 trustScore;         // Skor kepercayaan (base: 100)
    uint256 completedProjects;  // Jumlah projek selesai
    uint256 successfulLoans;    // Jumlah pinjaman berhasil
    uint256 defaultedLoans;     // Jumlah pinjaman gagal bayar
    uint256 totalBorrowed;      // Total dipinjam
    uint256 totalRepaid;        // Total dibayar
    bool isVerified;            // Status verifikasi
    bool isActive;              // Status aktif
    uint256 verificationTimestamp;
    uint256 lastActivityTimestamp;
}
```

### 3. Fungsi-fungsi Penting

#### Membuat Profile:
- `createProfile(githubHandle, profileDataCID)` - User membuat profile sendiri
- `createProfileFor(address, githubHandle, profileDataCID)` - Admin membuat profile untuk user

#### Membaca Profile:
- `getDeveloperProfile(address)` - Mendapatkan data profile lengkap
- `profiles[address]` - Public mapping (bisa diakses langsung)

## 🚨 Masalah yang Ditemukan di Frontend

### 1. Fungsi yang Tidak Ada di Smart Contract
Frontend mencoba menggunakan:
- ❌ `profileExists()` - Tidak ada di smart contract
- ❌ `getProfile()` - Tidak ada di smart contract  
- ❌ `getTrustScore()` - Tidak ada di smart contract

### 2. Fungsi yang Benar:
- ✅ `getDeveloperProfile(address)` - Yang ada di smart contract

## 🔧 Perbaikan yang Sudah Dilakukan

### 1. DeveloperDashboard.tsx
```typescript
// SEBELUM (SALAH):
const { data: profileExists } = useReadContract({
    functionName: 'profileExists', // ❌ Fungsi tidak ada
})

// SESUDAH (BENAR):
const { data: profileData } = useReadContract({
    functionName: 'getDeveloperProfile', // ✅ Fungsi yang benar
    args: address ? [address] : undefined,
})

const profile = profileData as Profile | undefined
const profileExists = profile && profile.githubHandle && profile.githubHandle.length > 0
```

### 2. Type Definition
```typescript
interface Profile {
  githubHandle: string
  profileDataCID: string
  trustScore: bigint
  completedProjects: bigint
  successfulLoans: bigint
  defaultedLoans: bigint
  totalBorrowed: bigint
  totalRepaid: bigint
  isVerified: boolean
  isActive: boolean
  verificationTimestamp: bigint
  lastActivityTimestamp: bigint
}
```

## 📋 Alur Create Profile yang Benar

### 1. User Flow:
1. **Connect Wallet** → Dashboard
2. **Check Profile:** Frontend memanggil `getDeveloperProfile(userAddress)`
3. **Profile Tidak Ada:** Tampilkan form `CreateProfileForm`
4. **Profile Ada:** Tampilkan dashboard dengan data profile

### 2. Create Profile Flow:
1. **GitHub Verification** (Step 1):
   - User input GitHub username
   - Sistem verifikasi data GitHub (mock/real API)
   - Kalkulasi trust score berdasarkan GitHub metrics

2. **Profile Creation** (Step 2):
   - User isi form tambahan (bio, skills)
   - System generate mock IPFS CID
   - Submit transaction ke `DeveloperProfile.createProfile(githubHandle, profileDataCID)`

3. **Transaction Success:**
   - Profile tersimpan di blockchain
   - Frontend auto-refresh dan detect profile exists
   - User diarahkan ke dashboard

### 3. Auto-Detection Logic:
```typescript
// Frontend otomatis detect profile exist
const profileExists = profile && profile.githubHandle && profile.githubHandle.length > 0

// Jika profile ada, tampilkan dashboard
// Jika profile tidak ada, tampilkan CreateProfileForm
{profileExists ? <DashboardView /> : <CreateProfileForm />}
```

## ✅ Konfirmasi Fitur yang Sudah Benar

1. **✅ 1 Wallet = 1 Profile:** Smart contract enforce dengan `require`
2. **✅ Auto-Save:** Profile tersimpan permanent di blockchain setelah transaction success
3. **✅ Auto-Detection:** Frontend otomatis detect profile existence dan tampilkan data
4. **✅ Data Persistence:** Profile data persistent di blockchain, tidak hilang

## 🔍 Error yang Masih Terjadi

### ABI Encoding Error:
```
❌ Transaction failed: ABI encoding params/values length mismatch. 
Expected length (params): 2 Given length (values): 4
```

**Kemungkinan Penyebab:**
1. ABI file corruption atau mixed contracts
2. Wrong function being called
3. Incorrect args array structure

**Next Steps:**
1. Regenerate ABI file dari smart contract
2. Verify function signature di ABI
3. Add debug logging untuk parameter yang dikirim

---

**Status:** ✅ Logika profile sudah benar, tinggal fix ABI encoding error
**Next:** Debug transaction parameter dan ABI file
