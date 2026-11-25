export type Screen = { src: string; alt: string };

export type Project = {
  name: string;
  id: string;
  url: string;
  source?: string;
  category: string;
  description: string;
  about: readonly string[];
  features: readonly string[];
  logo: string;
  media: {
    image: string;
    imageAlt: string;
    aspectRatio: number;
    video?: string;
  };
  screens: readonly Screen[];
};

export const projects: readonly Project[] = [
  {
    name: 'TapPay',
    id: 'tappay',
    url: 'https://github.com/Aditya-linux/Tap-Pay',
    source: 'https://github.com/Aditya-linux/Tap-Pay',
    category: 'Multi-chain · Payments',
    description: 'Contactless multi-chain wallet: tap two phones or send to @username, settled on-chain in about a second.',
    about: [
      'TapPay is a non-custodial mobile wallet that makes on-chain payments as simple as a contactless card. Hold two phones together and the payment is sent and settled, or type an @username instead of a long address.',
      'It is multi-chain from day one. Live on Monad and Ethereum, with Base, Solana, Stellar and NEAR in progress. Keys stay on the phone in secure hardware.',
      'I co-founded TapPay and ship product, contracts and mobile work across the stack.',
    ],
    features: [
      'NFC tap-to-pay between phones',
      'Username Pay to @handles',
      'Stablecoins (AUSD, USDC, USDT) and native tokens',
      'Phone-secured keys and recovery phrase',
      'React Native + Solidity / Hardhat',
    ],
    logo: '/logos/tappay.png',
    media: {
      image: '/tappay.png',
      imageAlt: 'TapPay home screen',
      aspectRatio: 1200 / 630,
    },
    screens: [
      { src: '/tappay.png', alt: 'TapPay home' },
    ],
  },
  {
    name: 'Rekura',
    id: 'recurra',
    url: 'https://recurra-omega.vercel.app/',
    source: 'https://github.com/Aditya-linux/Recurra',
    category: 'Stellar · Payments',
    description: 'Web3 recurring payments on Stellar Soroban — automated subscriptions for merchants and consumers.',
    about: [
      'Rekura (formerly Recurra) is a decentralized B2B and B2C platform on the Stellar Soroban network for Web3 recurring payments.',
      'Merchants create subscription plans and consumers subscribe with smart wallets, while an off-chain Keeper network handles recurring settlement.',
    ],
    features: [
      'Soroban smart contracts for subscription plans',
      'Merchant and consumer flows',
      'Off-chain Keeper network for recurring charges',
      'Smart-wallet friendly UX',
      'Next.js frontend with PostgreSQL',
    ],
    logo: '/logos/recurra.svg',
    media: {
      image: '/recurra.png',
      imageAlt: 'Rekura Web3 recurring payments landing page',
      aspectRatio: 16 / 10,
    },
    screens: [],
  },
  {
    name: 'Nebula',
    id: 'nebula',
    url: 'https://nebula-evidence-dapp-23i8-r0q84t4vo.vercel.app/',
    source: 'https://github.com/Aditya-linux/Nebula-evidence-dapp',
    category: 'Ethereum · Evidence',
    description: 'An evidence notarization app that anchors file proofs on Ethereum Sepolia.',
    about: [
      'Nebula is a decentralized application designed to notarize and store digital evidence on Ethereum.',
      'It provides immutable proof of existence and timestamping for files, so evidence can be verified later without trusting a central host.',
    ],
    features: [
      'File notarization on Ethereum',
      'Immutable proof of existence',
      'Timestamp verification',
      'Sepolia deployment',
    ],
    logo: '/logos/nebula.svg',
    media: {
      image: '/nebula.png',
      imageAlt: 'Nebula evidence notarization app',
      aspectRatio: 16 / 10,
    },
    screens: [],
  },
  {
    name: 'ArthVeda AI',
    id: 'arthveda',
    url: 'https://arth-veda-ai-t7y9.vercel.app/',
    source: 'https://github.com/Aditya-linux/ArthVedaAI',
    category: 'AI · Fintech',
    description: 'Financial NLP platform: FinBERT sentiment on news and SEC filings, fused into market direction signals.',
    about: [
      'ArthVeda AI is a financial natural language processing platform and market intelligence system.',
      'It ingests live financial news and statutory SEC filings, classifies them with FinBERT, and runs a Sentiment-Momentum Fusion Engine to forecast next-session directional probabilities.',
      'Includes a paper trading simulator, benchmarks suite and interactive terminal.',
    ],
    features: [
      'FinBERT financial sentiment classification',
      'SEC 10-K / 10-Q report NLP',
      'Sentiment-Momentum Fusion Engine',
      'Paper trading simulator',
      'Next.js + FastAPI + Supabase',
    ],
    logo: '/logos/arthveda.svg',
    media: {
      image: '/arthveda.png',
      imageAlt: 'ArthVeda AI financial NLP platform',
      aspectRatio: 16 / 10,
    },
    screens: [],
  },
  {
    name: 'Blind Vault',
    id: 'blind-vault',
    url: 'https://blind-vault-amber.vercel.app/',
    source: 'https://github.com/Aditya-linux/BlindVault',
    category: 'Solana · Privacy',
    description: 'Sealed creature-card auctions on Solana Devnet, with private bids and peeks using MagicBlock PER.',
    about: [
      'Blind Vault is a Storage Wars–style sealed auction for collectible creature cards on Solana Devnet.',
      'While a lot is live, nobody can read what’s inside. Hints drip on a schedule, bids stay sealed, and a paid peek is private to the buyer via MagicBlock PER (TEE).',
    ],
    features: [
      'Sealed-bid auction mechanics',
      'Private peeks with MagicBlock PER',
      'Solana Devnet deployment',
      'Creature-card warehouse UX',
    ],
    logo: '/logos/blindvault-icon.png',
    media: {
      image: '/blindvault.png',
      imageAlt: 'Blind Vault mystery card auctions',
      aspectRatio: 16 / 10,
    },
    screens: [],
  },
];

export const projectPath = (project: Project) => `/projects/${project.id}`;
