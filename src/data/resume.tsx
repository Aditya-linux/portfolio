import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Aditya Nishad",
  initials: "AN",
  url: "https://www.adityajhaa.co/",
  location: "New Delhi, India",
  // locationLink: "https://www.google.com/maps/place/sanfrancisco",
  description:
"Full Stack + AI + Blockchain - building and sharing on X.",
  summary:
"I’m a Full Stack Developer building SaaS, AI-powered products, and blockchain applications. I’ve shipped across multiple startups and projects, was selected as a Stellar Brand Ambassador, made ₹20K+ in Stellar contributions, and I enjoy taking ideas from product thinking and UX to production-ready systems. Beyond coding, I like experimenting, sharing learnings, and contributing to the developer ecosystem.",
avatarUrl: "/profile.jpeg",
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "C++",
    "Solidity",
    "Rust",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS"
  ],
  services: [
    {
      title: "Web3 Development",
      description: "Smart contracts, DeFi protocols, NFT platforms, and blockchain integrations. Experience with Solidity, Rust, and multiple chains.",
      icon: "🔗",
    },
    {
      title: "Full-Stack Development",
      description: "End-to-end web applications with modern frameworks. React, Next.js, TypeScript, Node.js, and cloud deployment.",
      icon: "⚡",
    },
    {
      title: "Smart Contract Auditing",
      description: "Security-focused smart contract reviews and optimizations. Ensuring your contracts are production-ready and secure.",
      icon: "🔒",
    },
    {
      title: "SaaS Development",
      description: "Scalable SaaS applications with modern architecture. From MVP to production with performance optimization.",
      icon: "🚀",
    },
  ],
  availability: {
    status: "Available",
    message: "Open to new freelance projects and collaborations",
  },
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "https://medium.com/@adityanishad0402", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "adityanishad0402@gmail.com",
    // tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Aditya-linux",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/aditya-nishad-a07b191b9?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/AdityaNishad987",
        icon: Icons.x,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,

        navbar: false,
      },
      resume: {
        name: "Resume",
        url: "/AdityaNishadResume.pdf",
        icon: Icons.resume,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Stellar Open Source",
      href: "https://stellar.org/",
      badges: [],
      location: "Remote",
      title: "Open Source Developer",
      logoUrl: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
      start: "Feb 2026",
      end: "Current",
      description:
        "Contributed to the Stellar ecosystem by resolving 98% of identified API routing inefficiencies, decreasing response times by an estimated 90%.\n\nBuilt and launched \"Sentinex,\" a Web3 application that successfully scaled to support 30+ active live users within the first 6 weeks of deployment.",
    },
    {
      company: "RUMI Care",
      href: "https://www.rumicare.org/",
      badges: [],
      location: "Mumbai, India",
      title: "Documentation Intern",
      logoUrl: "",
      start: "3 Months",
      end: "",
      description:
        "Managed the design and issuance of 50+ official certificates using automated workflows, reducing manual processing time by roughly 6 hours per event.\n\nEnsured 100% data accuracy while streamlining the administrative generation process under strict organizational deadlines.",
    },  ],
  education: [
    {
      school: "Mumbai University",
      href: "",
      degree: "Bachelor of Technology in Computer Science and Engineering (CGPA: 8.70)",
      logoUrl: "",
      start: "2023",
      end: "2026",
    },
  ],
  projects: [
    {
      title: "Recurra",
      href: "https://recurra-omega.vercel.app/",
      dates: "",
      active: true,
      description: "A decentralized B2B & B2C platform on the Stellar Soroban network for Web3 recurring payments. Allows merchants to create customizable subscription plans and consumers to subscribe using their smart wallets with an off-chain Keeper network.",
      technologies: [
        "Rust",
        "Soroban",
        "Stellar",
        "Next.js",
        "Node.js",
        "PostgreSQL"
      ],
      links: [
        {
          type: "Website",
          href: "https://recurra-omega.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/Recurra",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/recurra.png",
      video: "",
    },
    {
      title: "Sentinex",
      href: "https://blackbelt-stellar.vercel.app/",
      dates: "",
      active: true,
      description: "An AI-driven, non-custodial portfolio management platform on the Stellar network. Utilizes Soroban smart contracts and real-time GPT-4 sentiment analysis for autonomous trading with gasless transactions.",
      technologies: [
        "Soroban",
        "Stellar",
        "AI/GPT-4",
        "Rust",
        "Next.js"
      ],
      links: [
        {
          type: "Website",
          href: "https://blackbelt-stellar.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/Blackbelt-stellar",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sentinex.png",
      video: "",
    },
    {
      title: "ArthVeda AI",
      href: "https://arth-veda-ai-t7y9.vercel.app/",
      dates: "",
      active: true,
      description: "A comprehensive AI-powered financial trading simulator and real-time sentiment analysis engine. Processes thousands of financial news sources using NLP to provide actionable trade recommendations and a paper trading environment.",
      technologies: [
        "AI/NLP",
        "Next.js",
        "TypeScript"
      ],
      links: [
        {
          type: "Website",
          href: "https://arth-veda-ai-t7y9.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/ArthVedaAI",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/arthveda.png",
      video: "",
    },
    {
      title: "Nebula",
      href: "https://nebula-evidence-dapp-23i8-r0q84t4vo.vercel.app/",
      dates: "",
      active: true,
      description: "A secure, decentralized application (DApp) designed to notarize and store digital evidence on the Ethereum blockchain. Provides immutable proof of existence and timestamping for files.",
      technologies: [
        "Solidity",
        "Ethereum",
        "Next.js",
        "Ethers.js",
        "Tailwind CSS"
      ],
      links: [
        {
          type: "Website",
          href: "https://nebula-evidence-dapp-23i8-r0q84t4vo.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/Nebula-evidence-dapp",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/nebula.png",
      video: "",
    },
    {
      title: "CareFund",
      href: "https://care-fund.vercel.app/",
      dates: "",
      active: true,
      description: "A transparent, trustless crowdfunding platform built on Stellar Smart Contracts (Soroban). Empowers users to create fundraising campaigns with on-chain verification and secure withdrawals.",
      technologies: [
        "Stellar",
        "Soroban",
        "Rust",
        "Next.js"
      ],
      links: [
        {
          type: "Website",
          href: "https://care-fund.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/Care-Fund",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/carefund.png",
      video: "",
    },
    {
      title: "Micro-Escrow",
      href: "https://micro-escrow-stellar-orange-belt.vercel.app/",
      dates: "",
      active: true,
      description: "A decentralized escrow application on Stellar Soroban enabling trustless payments between clients and freelancers. Funds are locked in a smart contract and released only upon work approval.",
      technologies: [
        "Stellar",
        "Soroban",
        "Rust",
        "Next.js",
        "Tailwind CSS"
      ],
      links: [
        {
          type: "Website",
          href: "https://micro-escrow-stellar-orange-belt.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Aditya-linux/Micro-Escrow-Stellar---Orange-Belt-",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/microescrow.png",
      video: "",
    },
  ],
  achievements: [
    {
      title: "Prettiflow Grant Winner",
      dates: "2026",
      location: "Remote",
      description: "Won a grant of $10,000 worth of Prettiflow credits to upgrade and scale my personal projects.",
      image: "/prettiflow.png",
      links: [],
    },
    {
      title: "Top Performer - Stellar Journey to Mastery",
      dates: "2026",
      location: "Remote",
      description: "Recognized as a top performer in the Stellar Journey to Mastery challenge, earning over $250+ during the 3-month timeline.",
      image: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
      links: [],
    }
  ],
} as const;
