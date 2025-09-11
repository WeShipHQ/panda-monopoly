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
