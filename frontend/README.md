# CoreDev Zero Frontend

Frontend application untuk CoreDev Zero - Decentralized Developer Lending Protocol.

## 🚀 Tech Stack

- **Next.js 15.3.4** - React Framework dengan App Router
- **RainbowKit 2.2.8** - Wallet connection dan management
- **Wagmi 2.15.6** - React hooks untuk Ethereum
- **Viem** - TypeScript interface untuk Ethereum
- **TailwindCSS 4** - Utility-first CSS framework
- **TypeScript** - Type safety

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout dengan providers
│   ├── page.tsx           # Landing page
│   └── dashboard/
│       └── page.tsx       # Developer dashboard
├── components/
│   ├── providers.tsx      # Wagmi + RainbowKit providers
│   ├── WalletInfo.tsx     # Wallet connection info
│   └── DeveloperDashboard.tsx # Main dashboard component
└── lib/
    ├── wagmi.ts          # Wagmi configuration + chains
    └── contracts.ts      # Smart contract ABIs & addresses
```

## 🔧 Configuration

### 1. Environment Variables

Update `.env.local`:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Network Configuration
NEXT_PUBLIC_ENABLE_TESTNETS=true

# Contract Addresses (auto-filled for local development)
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
# ... etc
```

### 2. Supported Networks

- **Core DAO Mainnet** (Chain ID: 1116)
- **Core DAO Testnet** (Chain ID: 1115) 
- **Hardhat Local** (Chain ID: 31337) - untuk development
- **Sepolia Testnet** (Chain ID: 11155111) - untuk testing

## 🚀 Getting Started

### Prerequisites

1. Node.js 18+ 
2. npm atau yarn
3. Hardhat contracts deployed (lihat `../hardhat/README.md`)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ✅ Completed Features

### Core Wallet Integration
- RainbowKit wallet connection dengan support multi-wallet
- Network detection dan switching (Core DAO, testnet, localhost)
- Balance display dan transaction management

### Developer Dashboard
- Profile creation dengan GitHub integration
- Trust score calculation dan display
- ETH staking untuk collateral
- Real-time contract data dengan Wagmi hooks

### Smart Contract Integration
- Type-safe contract interactions dengan Viem
- Auto ABI loading dari hardhat deployment
- Network-aware contract addressing
- Transaction status dan error handling

## 📱 Usage

1. **Connect Wallet**: Kunjungi `/dashboard` dan connect wallet
2. **Create Profile**: Enter GitHub username dan create developer profile
3. **Stake ETH**: Stake ETH sebagai collateral untuk loan applications
4. **View Data**: Dashboard menampilkan real-time contract data

## 🛠️ Development

Frontend ini terintegrasi dengan smart contracts dari folder `../hardhat/`. Smart contract ABIs di-import otomatis dari `hardhat/frontend-abis.json`.

---

**CoreDev Zero Frontend** - Empowering developers through decentralized finance 🚀
