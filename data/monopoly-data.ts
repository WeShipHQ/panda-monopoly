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
