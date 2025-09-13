export interface PropertyData {
  name: string;
  price: string;
  colorClass: string;
  type:
    | "property"
    | "chance"
    | "community-chest"
    | "railroad"
    | "beach"
    | "utility"
    | "tax"
    | "corner";
  rotate?: "left" | "top" | "right";
  threeLines?: boolean;
  longName?: boolean;
  blueIcon?: boolean;
}

import { unifiedPropertyData } from "./unified-monopoly-data";

// Board mapping using unified data
export const boardSpaces = unifiedPropertyData.map((property) => ({
  name: property.name,
  type: property.type,
}));

import { getLegacyPropertyData } from "./unified-monopoly-data";

// Use unified data for consistency
export const monopolyData = getLegacyPropertyData();

// Chance Cards
export const chanceCards = [
  {
    id: 1,
    title: "Advance to GO",
    description: "Collect $200 as you pass",
    action: "advance-to-go",
    value: 200,
  },
  {
    id: 2,
    title: "Bank Error in Your Favor",
    description: "Collect $200",
    action: "collect-money",
    value: 200,
  },
  {
    id: 3,
    title: "Doctor's Fees",
    description: "Pay $50",
    action: "pay-money",
    value: 50,
  },
  {
    id: 4,
    title: "From Sale of Stock",
    description: "You get $50",
    action: "collect-money",
    value: 50,
  },
  {
    id: 5,
    title: "Get Out of Jail Free",
    description: "This card may be kept until needed",
    action: "get-out-of-jail",
    value: 0,
  },
  {
    id: 6,
    title: "Go to Jail",
    description: "Go directly to jail, do not pass GO, do not collect $200",
    action: "go-to-jail",
    value: 0,
  },
  {
    id: 7,
    title: "Grand Opera Opening",
    description: "Collect $50 from every player",
    action: "collect-from-players",
    value: 50,
  },
  {
    id: 8,
    title: "Holiday Fund Matures",
    description: "Receive $100",
    action: "collect-money",
    value: 100,
  },
  {
    id: 9,
    title: "Income Tax Refund",
    description: "Collect $20",
    action: "collect-money",
    value: 20,
  },
  {
    id: 10,
    title: "Life Insurance Matures",
    description: "Collect $100",
    action: "collect-money",
    value: 100,
  },
  {
    id: 11,
    title: "Pay Poor Tax",
    description: "Pay $15",
    action: "pay-money",
    value: 15,
  },
  {
    id: 12,
    title: "Take a Trip to Reading Railroad",
    description: "If you pass GO, collect $200",
    action: "advance-to-reading",
    value: 0,
  },
  {
    id: 13,
    title: "Take a Walk on the Boardwalk",
    description: "Advance token to Boardwalk",
    action: "advance-to-boardwalk",
    value: 0,
  },
  {
    id: 14,
    title: "You Have Been Elected Chairman",
    description: "Pay each player $50",
    action: "pay-each-player",
    value: 50,
  },
  {
    id: 15,
    title: "Your Building Loan Matures",
    description: "Collect $150",
    action: "collect-money",
    value: 150,
  },
  {
    id: 16,
    title: "You Have Won a Crossword Competition",
    description: "Collect $100",
    action: "collect-money",
    value: 100,
  },
];

// Community Chest Cards
export const communityChestCards = [
  {
    id: 1,
    title: "Advance to GO",
    description: "Collect $200",
    action: "advance-to-go",
    value: 200,
  },
  {
    id: 2,
    title: "Bank Error in Your Favor",
    description: "Collect $200",
    action: "collect-money",
    value: 200,
  },
  {
    id: 3,
    title: "Doctor's Fees",
    description: "Pay $50",
    action: "pay-money",
    value: 50,
  },
  {
    id: 4,
    title: "From Sale of Stock",
    description: "You get $50",
    action: "collect-money",
    value: 50,
  },
  {
    id: 5,
    title: "Get Out of Jail Free",
    description: "This card may be kept until needed",
    action: "get-out-of-jail",
    value: 0,
  },
  {
    id: 6,
    title: "Go to Jail",
    description: "Go directly to jail",
    action: "go-to-jail",
    value: 0,
  },
  {
    id: 7,
    title: "Holiday Fund Matures",
    description: "Receive $100",
    action: "collect-money",
    value: 100,
  },
  {
    id: 8,
    title: "Income Tax Refund",
    description: "Collect $20",
    action: "collect-money",
    value: 20,
  },
  {
    id: 9,
    title: "It is Your Birthday",
    description: "Collect $10 from every player",
    action: "collect-from-players",
    value: 10,
  },
  {
    id: 10,
    title: "Life Insurance Matures",
    description: "Collect $100",
    action: "collect-money",
    value: 100,
  },
  {
    id: 11,
    title: "Hospital Fees",
    description: "Pay $100",
    action: "pay-money",
    value: 100,
  },
  {
    id: 12,
    title: "School Fees",
    description: "Pay $50",
    action: "pay-money",
    value: 50,
  },
  {
    id: 13,
    title: "Receive $25 Consultancy Fee",
    description: "Collect $25",
    action: "collect-money",
    value: 25,
  },
  {
    id: 14,
    title: "You Are Assessed for Street Repairs",
    description: "Pay $40 per house, $115 per hotel",
    action: "street-repairs",
    value: 0,
  },
  {
    id: 15,
    title: "You Have Won Second Prize",
    description: "Collect $10",
    action: "collect-money",
    value: 10,
  },
  {
    id: 16,
    title: "You Inherit $100",
    description: "Collect $100",
    action: "collect-money",
    value: 100,
  },
];

// Surprise Cards (Pump.fun Surprise Deck) - Solana-themed Chance Cards
export const surpriseCards = [
  {
    id: 1,
    title: "Memecoin Pump! 🚀",
    description: "Advance to the nearest memecoin property (BONK or WIF). If unowned, you may buy it. If owned, pay double rent – the pump is real!",
    action: "advance-to-nearest-memecoin",
    value: 0,
  },
  {
    id: 2,
    title: "Rug Pull Alert! 💸",
    description: "Your latest trade gets rugged. Pay 50 SOL to the bank for exit liquidity.",
    action: "pay-money",
    value: 50,
  },
  {
    id: 3,
    title: "Flash Loan Win ⚡",
    description: "Borrow big, repay fast. Collect 100 SOL from the bank – degen arbitrage pays off.",
    action: "collect-money",
    value: 100,
  },
  {
    id: 4,
    title: "Congestion Jam 🚧",
    description: "Network overload! Go back 3 spaces – too many bots in the mempool.",
    action: "move-back",
    value: -3,
  },
  {
    id: 5,
    title: "Dev Unlock 🔓",
    description: "Team tokens vest early. Get out of Validator Jail free – keep this card or sell it to another player.",
    action: "get-out-of-jail",
    value: 0,
  },
];

// Treasure Cards (Airdrop Chest Deck) - Solana-themed Community Chest Cards
export const treasureCards = [
  {
    id: 1,
    title: "Retroactive Airdrop! 🪂",
    description: "You farmed early. Collect 50 SOL from every player – points paid off.",
    action: "collect-from-players",
    value: 50,
  },
  {
    id: 2,
    title: "Staking Rewards 💰",
    description: "Your validator performs. Collect 100 SOL from the bank – compounded yields.",
    action: "collect-money",
    value: 100,
  },
  {
    id: 3,
    title: "NFT Floor Sweep 🖼️",
    description: "Community bids up your jpegs. Advance to Free Airdrop Parking and collect the pot.",
    action: "advance-to-free-parking",
    value: 0,
  },
  {
    id: 4,
    title: "DAO Vote Win 🗳️",
    description: "Proposal passes in your favor. Repair all your properties for free – grants approved.",
    action: "repair-free",
    value: 0,
  },
  {
    id: 5,
    title: "Wallet Drain Fee 🔒",
    description: "Phishing attempt succeeds. Pay 50 SOL to the bank – always check your seeds!",
    action: "pay-money",
    value: 50,
  },
];

export interface CardData {
  id: number;
  title: string;
  description: string;
  action: string;
  value: number;
}
