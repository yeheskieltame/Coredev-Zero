import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  hardhat,
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Core DAO Mainnet Chain Definition
export const coreDao = defineChain({
  id: 1116,
  name: 'Core DAO',
  nativeCurrency: {
    decimals: 18,
    name: 'CORE',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.coredao.org'] },
  },
  blockExplorers: {
    default: { name: 'CoreScan', url: 'https://scan.coredao.org' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11907934,
    },
  },
});

// Core DAO Testnet Chain Definition  
export const coreDaoTestnet = defineChain({
  id: 1115,
  name: 'Core DAO Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tCORE',
    symbol: 'tCORE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.test.btcs.network'] },
  },
  blockExplorers: {
    default: { name: 'CoreScan Testnet', url: 'https://scan.test.btcs.network' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'CoreDev Zero - Decentralized Developer Lending Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_WALLET_CONNECT_PROJECT_ID',
  chains: [
    coreDao,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [coreDaoTestnet, sepolia, hardhat] : []),
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
