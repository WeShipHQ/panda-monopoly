export interface UnifiedPropertyData {
  position: number;
  name: string;
  type:
    | "property"
    | "railroad"
    | "utility"
    | "corner"
    | "chance"
    | "community-chest"
    | "tax";
  price?: number;
  flagCost?: number; // Cost to buy property with flag (cheaper than house)
  colorGroup?: string;
  colorClass?: string;
  rotate?: "left" | "top" | "right";
  longName?: boolean;
  threeLines?: boolean;
  blueIcon?: boolean;

  // Property-specific data
  baseRent?: number;
  rentWithColorGroup?: number;
  rentWith1House?: number;
  rentWith2Houses?: number;
  rentWith3Houses?: number;
  rentWith4Houses?: number;
  rentWithHotel?: number;
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;

  // Railroad-specific data
  railroadRent?: number[];

  // Utility-specific data
  utilityMultiplier?: number[];

  // Tax-specific data
  taxAmount?: number;
  instructions?: string;
}

// Unified property data with Solana-themed board spaces
export const unifiedPropertyData: UnifiedPropertyData[] = [
  // Position 0 - Solana Genesis (GO)
  { position: 0, name: "Solana Genesis", type: "corner" },

  // Position 1 - BONK Avenue (Brown Property)
  {
    position: 1,
    name: "BONK Avenue",
    type: "property",
    price: 60,
    flagCost: 40,
    colorGroup: "brown",
    colorClass: "bg-[#8b4513]",
    baseRent: 2,
    rentWithColorGroup: 4,
    rentWith1House: 10,
    rentWith2Houses: 30,
    rentWith3Houses: 90,
    rentWith4Houses: 160,
    rentWithHotel: 250,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 30,
  },

  // Position 2 - Airdrop Chest
  { position: 2, name: "Airdrop Chest", type: "community-chest" },

  // Position 3 - WIF Lane (Brown Property)
  {
    position: 3,
    name: "WIF Lane",
    type: "property",
    price: 60,
    flagCost: 40,
    colorGroup: "brown",
    colorClass: "bg-[#8b4513]",
    baseRent: 4,
    rentWithColorGroup: 8,
    rentWith1House: 20,
    rentWith2Houses: 60,
    rentWith3Houses: 180,
    rentWith4Houses: 320,
    rentWithHotel: 450,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 30,
  },

  // Position 4 - MEV Tax
  {
    position: 4,
    name: "MEV Tax",
    type: "tax",
    taxAmount: 200,
    instructions: "Pay 10% or 200 SOL",
  },

  // Position 5 - Wormhole Bridge (Railroad)
  {
    position: 5,
    name: "Wormhole Bridge",
    type: "railroad",
    price: 200,
    colorClass: "bg-black",
    railroadRent: [25, 50, 100, 200],
    mortgageValue: 100,
  },

  // Position 6 - JUP Street (Light Blue Property)
  {
    position: 6,
    name: "JUP Street",
    type: "property",
    price: 100,
    flagCost: 70,
    colorGroup: "lightblue",
    colorClass: "bg-[#aae0fa]",
    baseRent: 6,
    rentWithColorGroup: 12,
    rentWith1House: 30,
    rentWith2Houses: 90,
    rentWith3Houses: 270,
    rentWith4Houses: 400,
    rentWithHotel: 550,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 50,
  },

  // Position 7 - Pump.fun Surprise
  { position: 7, name: "Pump.fun Surprise", type: "chance" },

  // Position 8 - RAY Boulevard (Light Blue Property)
  {
    position: 8,
    name: "RAY Boulevard",
    type: "property",
    price: 100,
    flagCost: 70,
    colorGroup: "lightblue",
    colorClass: "bg-[#aae0fa]",
    baseRent: 6,
    rentWithColorGroup: 12,
    rentWith1House: 30,
    rentWith2Houses: 90,
    rentWith3Houses: 270,
    rentWith4Houses: 400,
    rentWithHotel: 550,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 50,
  },

  // Position 9 - ORCA Way (Light Blue Property)
  {
    position: 9,
    name: "ORCA Way",
    type: "property",
    price: 120,
    flagCost: 85,
    colorGroup: "lightblue",
    colorClass: "bg-[#aae0fa]",
    baseRent: 8,
    rentWithColorGroup: 16,
    rentWith1House: 40,
    rentWith2Houses: 100,
    rentWith3Houses: 300,
    rentWith4Houses: 450,
    rentWithHotel: 600,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 60,
  },

  // Position 10 - Validator Jail
  { position: 10, name: "Validator Jail", type: "corner" },

  // Position 11 - SAGA Place (Pink Property)
  {
    position: 11,
    name: "SAGA Place",
    type: "property",
    price: 140,
    flagCost: 100,
    colorGroup: "pink",
    colorClass: "bg-[#d93a96]",
    baseRent: 10,
    rentWithColorGroup: 20,
    rentWith1House: 50,
    rentWith2Houses: 150,
    rentWith3Houses: 450,
    rentWith4Houses: 625,
    rentWithHotel: 750,
    houseCost: 50,
    hotelCost: 50,
    mortgageValue: 70,
    rotate: "left",
  },

  // Position 12 - Pyth Oracle (Utility)
  {
    position: 12,
    name: "Pyth Oracle",
    type: "utility",
    price: 150,
    colorClass: "bg-white",
    utilityMultiplier: [4, 10],
    mortgageValue: 75,
    rotate: "left",
  },

  // Position 13 - TENSOR Avenue (Pink Property)
  {
    position: 13,
    name: "TENSOR Avenue",
    type: "property",
    price: 140,
    flagCost: 100,
    colorGroup: "pink",
    colorClass: "bg-[#d93a96]",
    baseRent: 10,
    rentWithColorGroup: 20,
    rentWith1House: 50,
    rentWith2Houses: 150,
    rentWith3Houses: 450,
    rentWith4Houses: 625,
    rentWithHotel: 750,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 70,
    rotate: "left",
  },

  // Position 14 - MAGIC EDEN Street (Pink Property)
  {
    position: 14,
    name: "MAGIC EDEN Street",
    type: "property",
    price: 160,
    flagCost: 110,
    colorGroup: "pink",
    colorClass: "bg-[#d93a96]",
    baseRent: 12,
    rentWithColorGroup: 24,
    rentWith1House: 60,
    rentWith2Houses: 180,
    rentWith3Houses: 500,
    rentWith4Houses: 700,
    rentWithHotel: 900,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 80,
    rotate: "left",
  },

  // Position 15 - Allbridge (Railroad)
  {
    position: 15,
    name: "Allbridge",
    type: "railroad",
    price: 200,
    colorClass: "bg-black",
    railroadRent: [25, 50, 100, 200],
    mortgageValue: 100,
    rotate: "left",
  },

  // Position 16 - HELIO Place (Orange Property)
  {
    position: 16,
    name: "HELIO Place",
    type: "property",
    price: 180,
    flagCost: 125,
    colorGroup: "orange",
    colorClass: "bg-[#ffa500]",
    baseRent: 14,
    rentWithColorGroup: 28,
    rentWith1House: 70,
    rentWith2Houses: 200,
    rentWith3Houses: 550,
    rentWith4Houses: 750,
    rentWithHotel: 950,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 90,
    rotate: "left",
  },

  // Position 17 - Airdrop Chest
  {
    position: 17,
    name: "Airdrop Chest",
    type: "community-chest",
    rotate: "left",
  },

  // Position 18 - KAMINO Avenue (Orange Property)
  {
    position: 18,
    name: "KAMINO Avenue",
    type: "property",
    price: 180,
    flagCost: 125,
    colorGroup: "orange",
    colorClass: "bg-[#ffa500]",
    baseRent: 14,
    rentWithColorGroup: 28,
    rentWith1House: 70,
    rentWith2Houses: 200,
    rentWith3Houses: 550,
    rentWith4Houses: 750,
    rentWithHotel: 950,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 90,
    rotate: "left",
  },

  // Position 19 - DRIFT Street (Orange Property)
  {
    position: 19,
    name: "DRIFT Street",
    type: "property",
    price: 200,
    flagCost: 140,
    colorGroup: "orange",
    colorClass: "bg-[#ffa500]",
    baseRent: 16,
    rentWithColorGroup: 32,
    rentWith1House: 80,
    rentWith2Houses: 240,
    rentWith3Houses: 600,
    rentWith4Houses: 800,
    rentWithHotel: 1000,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 100,
    rotate: "left",
  },

  // Position 20 - Free Airdrop Parking
  { position: 20, name: "Free Airdrop Parking", type: "corner" },

  // Position 21 - MANGO Markets (Red Property)
  {
    position: 21,
    name: "MANGO Markets",
    type: "property",
    price: 220,
    flagCost: 155,
    colorGroup: "red",
    colorClass: "bg-[#ff0000]",
    baseRent: 18,
    rentWithColorGroup: 36,
    rentWith1House: 90,
    rentWith2Houses: 270,
    rentWith3Houses: 650,
    rentWith4Houses: 850,
    rentWithHotel: 1050,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    rotate: "top",
  },

  // Position 22 - Pump.fun Surprise
  { position: 22, name: "Pump.fun Surprise", type: "chance", rotate: "top" },

  // Position 23 - HUBBLE Avenue (Red Property)
  {
    position: 23,
    name: "HUBBLE Avenue",
    type: "property",
    price: 220,
    flagCost: 155,
    colorGroup: "red",
    colorClass: "bg-[#ff0000]",
    baseRent: 18,
    rentWithColorGroup: 36,
    rentWith1House: 90,
    rentWith2Houses: 270,
    rentWith3Houses: 650,
    rentWith4Houses: 850,
    rentWithHotel: 1050,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    rotate: "top",
  },

  // Position 24 - MARINADE Street (Red Property)
  {
    position: 24,
    name: "MARINADE Street",
    type: "property",
    price: 240,
    flagCost: 170,
    colorGroup: "red",
    colorClass: "bg-[#ff0000]",
    baseRent: 20,
    rentWithColorGroup: 40,
    rentWith1House: 100,
    rentWith2Houses: 300,
    rentWith3Houses: 750,
    rentWith4Houses: 950,
    rentWithHotel: 1100,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 120,
    rotate: "top",
  },

  // Position 25 - LayerZero Bridge (Railroad)
  {
    position: 25,
    name: "LayerZero Bridge",
    type: "railroad",
    price: 200,
    colorClass: "bg-black",
    railroadRent: [25, 50, 100, 200],
    mortgageValue: 100,
    rotate: "top",
  },

  // Position 26 - BACKPACK Avenue (Yellow Property)
  {
    position: 26,
    name: "BACKPACK Avenue",
    type: "property",
    price: 260,
    flagCost: 180,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 22,
    rentWithColorGroup: 40,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 850,
    rentWith4Houses: 1050,
    rentWithHotel: 1200,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 120,
    rotate: "top",
  },

  // Position 27 - PHANTOM Street (Yellow Property)
  {
    position: 27,
    name: "PHANTOM Street",
    type: "property",
    price: 260,
    flagCost: 180,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 22,
    rentWithColorGroup: 44,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 850,
    rentWith4Houses: 1050,
    rentWithHotel: 1200,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 130,
    rotate: "top",
  },

  // Position 28 - Switchboard Oracle (Utility)
  {
    position: 28,
    name: "Switchboard Oracle",
    type: "utility",
    price: 150,
    colorClass: "bg-white",
    utilityMultiplier: [4, 10],
    mortgageValue: 75,
    rotate: "top",
  },

  // Position 29 - SOLFLARE Gardens (Yellow Property)
  {
    position: 29,
    name: "SOLFLARE Gardens",
    type: "property",
    price: 280,
    flagCost: 195,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 24,
    rentWithColorGroup: 48,
    rentWith1House: 120,
    rentWith2Houses: 360,
    rentWith3Houses: 900,
    rentWith4Houses: 1100,
    rentWithHotel: 1300,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 140,
    rotate: "top",
  },

  // Position 30 - Go To Validator Jail
  { position: 30, name: "Go To Validator Jail", type: "corner" },

  // Position 31 - ANATOLY Avenue (Green Property)
  {
    position: 31,
    name: "ANATOLY Avenue",
    type: "property",
    price: 300,
    flagCost: 210,
    colorGroup: "green",
    colorClass: "bg-[#00ff00]",
    baseRent: 26,
    rentWithColorGroup: 52,
    rentWith1House: 130,
    rentWith2Houses: 390,
    rentWith3Houses: 900,
    rentWith4Houses: 1100,
    rentWithHotel: 1300,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    rotate: "right",
  },

  // Position 32 - RAJ Street (Green Property)
  {
    position: 32,
    name: "RAJ Street",
    type: "property",
    price: 300,
    flagCost: 210,
    colorGroup: "green",
    colorClass: "bg-[#00ff00]",
    baseRent: 26,
    rentWithColorGroup: 52,
    rentWith1House: 130,
    rentWith2Houses: 390,
    rentWith3Houses: 900,
    rentWith4Houses: 1100,
    rentWithHotel: 1300,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    rotate: "right",
  },

  // Position 33 - Airdrop Chest
  {
    position: 33,
    name: "Airdrop Chest",
    type: "community-chest",
    rotate: "right",
  },

  // Position 34 - FIREDANCER Avenue (Green Property)
  {
    position: 34,
    name: "FIREDANCER Avenue",
    type: "property",
    price: 320,
    flagCost: 225,
    colorGroup: "green",
    colorClass: "bg-[#00ff00]",
    baseRent: 28,
    rentWithColorGroup: 56,
    rentWith1House: 150,
    rentWith2Houses: 450,
    rentWith3Houses: 1000,
    rentWith4Houses: 1200,
    rentWithHotel: 1400,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 160,
    rotate: "right",
  },

  // Position 35 - deBridge (Railroad)
  {
    position: 35,
    name: "deBridge",
    type: "railroad",
    price: 200,
    colorClass: "bg-black",
    railroadRent: [25, 50, 100, 200],
    mortgageValue: 100,
    rotate: "right",
  },

  // Position 36 - Pump.fun Surprise
  { position: 36, name: "Pump.fun Surprise", type: "chance", rotate: "right" },

  // Position 37 - SVM Place (Dark Blue Property)
  {
    position: 37,
    name: "SVM Place",
    type: "property",
    price: 350,
    flagCost: 245,
    colorGroup: "darkblue",
    colorClass: "bg-[#0000ff]",
    baseRent: 35,
    rentWithColorGroup: 70,
    rentWith1House: 175,
    rentWith2Houses: 500,
    rentWith3Houses: 1100,
    rentWith4Houses: 1400,
    rentWithHotel: 1500,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 175,
    rotate: "right",
  },

  // Position 38 - Priority Fee Tax
  {
    position: 38,
    name: "Priority Fee Tax",
    type: "tax",
    taxAmount: 75,
    rotate: "right",
  },

  // Position 39 - SAGA Boardwalk (Dark Blue Property)
  {
    position: 39,
    name: "SAGA Boardwalk",
    type: "property",
    price: 400,
    flagCost: 280,
    colorGroup: "darkblue",
    colorClass: "bg-[#0000ff]",
    baseRent: 50,
    rentWithColorGroup: 100,
    rentWith1House: 200,
    rentWith2Houses: 600,
    rentWith3Houses: 1200,
    rentWith4Houses: 1600,
    rentWithHotel: 2000,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 200,
    rotate: "right",
  },
];

// Color group mappings for Solana-themed properties
export const colorGroups = {
  brown: [1, 3], // BONK Avenue, WIF Lane
  lightblue: [6, 8, 9], // JUP Street, RAY Boulevard, ORCA Way
  pink: [11, 13, 14], // SAGA Place, TENSOR Avenue, MAGIC EDEN Street
  orange: [16, 18, 19], // HELIO Place, KAMINO Avenue, DRIFT Street
  red: [21, 23, 24], // MANGO Markets, HUBBLE Avenue, MARINADE Street
  yellow: [26, 27, 29], // BACKPACK Avenue, PHANTOM Street, SOLFLARE Gardens
  green: [31, 32, 34], // ANATOLY Avenue, RAJ Street, FIREDANCER Avenue
  darkblue: [37, 39], // SVM Place, SAGA Boardwalk
};

// Helper functions
export const getPropertyData = (
  position: number
): UnifiedPropertyData | null => {
  return unifiedPropertyData.find((p) => p.position === position) || null;
};

export const getPropertiesByColorGroup = (
  colorGroup: string
): UnifiedPropertyData[] => {
  return unifiedPropertyData.filter((p) => p.colorGroup === colorGroup);
};

export const isProperty = (position: number): boolean => {
  const property = getPropertyData(position);
  return property?.type === "property";
};

export const isRailroad = (position: number): boolean => {
  const property = getPropertyData(position);
  return property?.type === "railroad";
};

export const isUtility = (position: number): boolean => {
  const property = getPropertyData(position);
  return property?.type === "utility";
};

export const isBeach = (position: number): boolean => {
  const property = getPropertyData(position);
  return false; //property?.type === "beach";
};

// Convert unified data to legacy format for compatibility
export const getLegacyPropertyData = () => {
  const bottomRow = unifiedPropertyData.filter((p) =>
    [9, 8, 7, 6, 5, 4, 3, 2, 1].includes(p.position)
  );
  const leftRow = unifiedPropertyData.filter((p) =>
    [11, 12, 13, 14, 15, 16, 17, 18, 19].includes(p.position)
  );
  const topRow = unifiedPropertyData.filter((p) =>
    [21, 22, 23, 24, 25, 26, 27, 28, 29].includes(p.position)
  );
  const rightRow = unifiedPropertyData.filter((p) =>
    [31, 32, 33, 34, 35, 36, 37, 38, 39].includes(p.position)
  );

  const convertToLegacy = (property: UnifiedPropertyData) => ({
    position: property.position,
    name: property.name,
    price: property.price?.toString() || "",
    colorClass: property.colorClass || "",
    type: property.type,
    rotate: property.rotate,
    longName: property.longName,
    threeLines: property.threeLines,
    blueIcon: property.blueIcon,
  });

  return {
    bottomRow: bottomRow.reverse().map(convertToLegacy),
    leftRow: leftRow.reverse().map(convertToLegacy),
    topRow: topRow.map(convertToLegacy),
    rightRow: rightRow.map(convertToLegacy),
  };
};
