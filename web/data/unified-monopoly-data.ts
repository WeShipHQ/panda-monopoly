export interface UnifiedPropertyData {
  position: number;
  name: string;
  type:
    | "property"
    | "railroad"
    | "beach"
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

  // Beach-specific data
  beachRent?: number[];

  // Utility-specific data
  utilityMultiplier?: number[];

  // Tax-specific data
  taxAmount?: number;
  instructions?: string;
}

// Unified property data with all information in one place
export const unifiedPropertyData: UnifiedPropertyData[] = [
  // Row 0 - GO Corner
  { position: 0, name: "GO", type: "corner" },

  // Row 1 - Bottom row (right to left)
  {
    position: 1,
    name: "Mediterranean Ave",
    type: "property",
    price: 60,
    flagCost: 40, // ~70% of price
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

  { position: 2, name: "Community Chest", type: "community-chest" },

  {
    position: 3,
    name: "Baltic Ave",
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

  {
    position: 4,
    name: "Income Tax",
    type: "tax",
    taxAmount: 200,
    instructions: "Pay 10% or $200",
  },

  {
    position: 5,
    name: "Nha Trang Beach",
    type: "beach",
    price: 200,
    colorClass: "bg-blue-200",
    beachRent: [50, 100, 200, 400],
    mortgageValue: 100,
  },

  {
    position: 6,
    name: "Oriental Ave",
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

  { position: 7, name: "Chance", type: "chance" },

  {
    position: 8,
    name: "Vermont Ave",
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

  {
    position: 9,
    name: "Connecticut Ave",
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

  // Row 10 - JAIL Corner
  { position: 10, name: "JAIL", type: "corner" },

  // Row 11-19 - Left column (bottom to top)
  {
    position: 11,
    name: "St. Charles Place",
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

  {
    position: 12,
    name: "Electric Company",
    type: "utility",
    price: 150,
    colorClass: "bg-white",
    utilityMultiplier: [4, 10],
    mortgageValue: 75,
    rotate: "left",
  },

  {
    position: 13,
    name: "States Ave",
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

  {
    position: 14,
    name: "Virginia Ave",
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

  {
    position: 15,
    name: "Da Nang Beach",
    type: "beach",
    price: 200,
    colorClass: "bg-blue-200",
    beachRent: [50, 100, 200, 400],
    mortgageValue: 100,
    rotate: "left",
  },

  {
    position: 16,
    name: "St. James Place",
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

  {
    position: 17,
    name: "Community Chest",
    type: "community-chest",
    rotate: "left",
  },

  {
    position: 18,
    name: "Tennessee Ave",
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

  {
    position: 19,
    name: "New York Ave",
    type: "property",
    price: 200,
    flagCost: 140,
    colorGroup: "orange",
    colorClass: "bg-[#ffa500]",
    baseRent: 16,
    rentWithColorGroup: 32,
    rentWith1House: 80,
    rentWith2Houses: 220,
    rentWith3Houses: 600,
    rentWith4Houses: 800,
    rentWithHotel: 1000,
    houseCost: 100,
    hotelCost: 100,
    mortgageValue: 100,
    rotate: "left",
  },

  // Row 20 - Free Parking Corner
  { position: 20, name: "Free Parking", type: "corner" },

  // Row 21-29 - Top row (left to right)
  {
    position: 21,
    name: "Kentucky Ave",
    type: "property",
    price: 220,
    flagCost: 155,
    colorGroup: "red",
    colorClass: "bg-[#ff0000]",
    baseRent: 18,
    rentWithColorGroup: 36,
    rentWith1House: 90,
    rentWith2Houses: 250,
    rentWith3Houses: 700,
    rentWith4Houses: 875,
    rentWithHotel: 1050,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    rotate: "top",
  },

  { position: 22, name: "Chance", type: "chance", rotate: "top" },

  {
    position: 23,
    name: "Indiana Ave",
    type: "property",
    price: 220,
    flagCost: 155,
    colorGroup: "red",
    colorClass: "bg-[#ff0000]",
    baseRent: 18,
    rentWithColorGroup: 36,
    rentWith1House: 90,
    rentWith2Houses: 250,
    rentWith3Houses: 700,
    rentWith4Houses: 875,
    rentWithHotel: 1050,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 110,
    rotate: "top",
  },

  {
    position: 24,
    name: "Illinois Ave",
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
    rentWith4Houses: 925,
    rentWithHotel: 1100,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 120,
    rotate: "top",
  },

  {
    position: 25,
    name: "Phu Quoc Beach",
    type: "beach",
    price: 200,
    colorClass: "bg-blue-200",
    beachRent: [50, 100, 200, 400],
    mortgageValue: 100,
    rotate: "top",
  },

  {
    position: 26,
    name: "Atlantic Ave",
    type: "property",
    price: 260,
    flagCost: 180,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 22,
    rentWithColorGroup: 44,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 800,
    rentWith4Houses: 975,
    rentWithHotel: 1150,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 130,
    rotate: "top",
  },

  {
    position: 27,
    name: "Ventnor Ave",
    type: "property",
    price: 260,
    flagCost: 180,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 22,
    rentWithColorGroup: 44,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 800,
    rentWith4Houses: 975,
    rentWithHotel: 1150,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 130,
    rotate: "top",
  },

  {
    position: 28,
    name: "Water Works",
    type: "utility",
    price: 150,
    colorClass: "bg-white",
    utilityMultiplier: [4, 10],
    mortgageValue: 75,
    rotate: "top",
  },

  {
    position: 29,
    name: "Marvin Gardens",
    type: "property",
    price: 280,
    flagCost: 195,
    colorGroup: "yellow",
    colorClass: "bg-[#ffff00]",
    baseRent: 24,
    rentWithColorGroup: 48,
    rentWith1House: 120,
    rentWith2Houses: 360,
    rentWith3Houses: 850,
    rentWith4Houses: 1025,
    rentWithHotel: 1200,
    houseCost: 150,
    hotelCost: 150,
    mortgageValue: 140,
    rotate: "top",
  },

  // Row 30 - Go To Jail Corner
  { position: 30, name: "Go To Jail", type: "corner" },

  // Row 31-39 - Right column (top to bottom)
  {
    position: 31,
    name: "Pacific Ave",
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
    rentWithHotel: 1275,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    rotate: "right",
  },

  {
    position: 32,
    name: "N. Carolina Ave",
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
    rentWithHotel: 1275,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 150,
    rotate: "right",
  },

  {
    position: 33,
    name: "Community Chest",
    type: "community-chest",
    rotate: "right",
  },

  {
    position: 34,
    name: "Pennsylvania Ave",
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

  {
    position: 35,
    name: "Vung Tau Beach",
    type: "beach",
    price: 200,
    colorClass: "bg-blue-200",
    beachRent: [50, 100, 200, 400],
    mortgageValue: 100,
    rotate: "right",
  },

  { position: 36, name: "Chance", type: "chance", rotate: "right" },

  {
    position: 37,
    name: "Park Place",
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
    rentWith4Houses: 1300,
    rentWithHotel: 1500,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 175,
    rotate: "right",
  },

  {
    position: 38,
    name: "Luxury Tax",
    type: "tax",
    taxAmount: 75,
    rotate: "right",
  },

  {
    position: 39,
    name: "Boardwalk",
    type: "property",
    price: 400,
    flagCost: 280,
    colorGroup: "darkblue",
    colorClass: "bg-[#0000ff]",
    baseRent: 50,
    rentWithColorGroup: 100,
    rentWith1House: 200,
    rentWith2Houses: 600,
    rentWith3Houses: 1400,
    rentWith4Houses: 1700,
    rentWithHotel: 2000,
    houseCost: 200,
    hotelCost: 200,
    mortgageValue: 200,
    rotate: "right",
  },
];

// Color group mappings
export const colorGroups = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
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
  return property?.type === "beach";
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
