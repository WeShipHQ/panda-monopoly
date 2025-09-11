export interface PropertyData {
  name: string;
  price: string;
  colorClass: string;
  type: "property" | "chance" | "community-chest";
  rotate?: "left" | "top" | "right";
  threeLines?: boolean;
  longName?: boolean;
  blueIcon?: boolean;
}

// Board mapping matching current UI order (24 spaces)
export const boardSpaces = [
  { name: "GO", type: "corner" }, // 0
  { name: "Baltic Ave", type: "property" }, // 1
  { name: "Oriental Ave", type: "property" }, // 2
  { name: "Chance", type: "chance" }, // 3
  { name: "Vermont Ave", type: "property" }, // 4
  { name: "Connecticut Ave", type: "property" }, // 5
  { name: "JAIL", type: "corner" }, // 6
  { name: "States Ave", type: "property" }, // 7
  { name: "Virginia Ave", type: "property" }, // 8
  { name: "Community Chest", type: "community-chest" }, // 9
  { name: "Tennessee Ave", type: "property" }, // 10
  { name: "New York Ave", type: "property" }, // 11
  { name: "Free Parking", type: "corner" }, // 12
  { name: "Kentucky Ave", type: "property" }, // 13
  { name: "Indiana Ave", type: "property" }, // 14
  { name: "Chance", type: "chance" }, // 15
  { name: "Atlantic Ave", type: "property" }, // 16
  { name: "Marvin Gardens", type: "property" }, // 17
  { name: "Go To Jail", type: "corner" }, // 18
  { name: "Pacific Ave", type: "property" }, // 19
  { name: "N. Carolina Ave", type: "property" }, // 20
  { name: "Community Chest", type: "community-chest" }, // 21
  { name: "Park Place", type: "property" }, // 22
  { name: "Boardwalk", type: "property" }, // 23
];

export const monopolyData = {
  bottomRow: [
    {
      name: "Connecticut Ave",
      price: "120",
      colorClass: "bg-[#d2eaf5]",
      type: "property" as const,
    },
    {
      name: "Vermont Ave",
      price: "100",
      colorClass: "bg-[#d2eaf5]",
      type: "property" as const,
    },
    {
      name: "Chance",
      price: "",
      colorClass: "",
      type: "chance" as const,
    },
    {
      name: "Oriental Ave",
      price: "100",
      colorClass: "bg-[#5e3577]",
      type: "property" as const,
    },
    {
      name: "Baltic Ave",
      price: "50",
      colorClass: "bg-[#5e3577]",
      type: "property" as const,
    },
  ],

  leftRow: [
    {
      name: "New York Ave",
      price: "200",
      colorClass: "bg-[#fa811d]",
      type: "property" as const,
      rotate: "left" as const,
    },
    {
      name: "Tennessee Ave",
      price: "180",
      colorClass: "bg-[#fa811d]",
      type: "property" as const,
      rotate: "left" as const,
    },
    {
      name: "Community Chest",
      price: "",
      colorClass: "",
      type: "community-chest" as const,
      rotate: "left" as const,
    },
    {
      name: "Virginia Ave",
      price: "160",
      colorClass: "bg-[#b02f7c]",
      type: "property" as const,
      rotate: "left" as const,
    },
    {
      name: "States Ave",
      price: "140",
      colorClass: "bg-[#b02f7c]",
      type: "property" as const,
      rotate: "left" as const,
    },
  ],

  topRow: [
    {
      name: "Kentucky Ave",
      price: "220",
      colorClass: "bg-[#f50c2b]",
      type: "property" as const,
      rotate: "top" as const,
    },

    {
      name: "Indiana Ave",
      price: "220",
      colorClass: "bg-[#f50c2b]",
      type: "property" as const,
      rotate: "top" as const,
    },
    {
      name: "Chance",
      price: "",
      colorClass: "",
      type: "chance" as const,
      rotate: "top" as const,
      blueIcon: true,
    },
    {
      name: "Atlantic Ave",
      price: "260",
      colorClass: "bg-[#ffed20]",
      type: "property" as const,
      rotate: "top" as const,
    },
    {
      name: "Marvin Gardens",
      price: "280",
      colorClass: "bg-[#ffed20]",
      type: "property" as const,
      rotate: "top" as const,
    },
  ],

  rightRow: [
    {
      name: "Pacific Ave",
      price: "300",
      colorClass: "bg-[#41994e]",
      type: "property" as const,
      rotate: "right" as const,
    },
    {
      name: "N. Carolina Ave",
      price: "300",
      colorClass: "bg-[#41994e]",
      type: "property" as const,
      rotate: "right" as const,
    },
    {
      name: "Community Chest",
      price: "",
      colorClass: "",
      type: "community-chest" as const,
      rotate: "right" as const,
    },
    {
      name: "Park Place",
      price: "350",
      colorClass: "bg-[#5a6dba]",
      type: "property" as const,
      rotate: "right" as const,
    },
    {
      name: "Boardwalk",
      price: "400",
      colorClass: "bg-[#5a6dba]",
      type: "property" as const,
      rotate: "right" as const,
    },
  ],
};

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

export interface CardData {
  id: number;
  title: string;
  description: string;
  action: string;
  value: number;
}
