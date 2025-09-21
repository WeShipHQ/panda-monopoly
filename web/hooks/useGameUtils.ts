// import { useCallback } from "react";
// import {
//   getPropertyData,
//   colorGroups,
//   isProperty,
//   isRailroad,
//   isUtility,
//   isBeach,
// } from "@/data/unified-monopoly-data";
// import { GameState } from "./types";

// export const useGameUtils = () => {
//   // Get property price from unified data
//   const getPropertyPrice = useCallback((position: number): number => {
//     const property = getPropertyData(position);
//     return property?.price || 0;
//   }, []);

//   // Calculate rent using unified data
//   const getPropertyRent = useCallback(
//     (position: number, state?: GameState): number => {
//       const currentState = state || ({} as GameState);
//       const property = getPropertyData(position);

//       if (!property) return 0;

//       // Handle different property types
//       if (property.type === "property") {
//         return calculatePropertyRent(property, position, currentState);
//       } else if (property.type === "railroad") {
//         return calculateRailroadRent(position, currentState);
//       } else if (property.type === "beach") {
//         return calculateBeachRent(position, currentState);
//       } else if (property.type === "utility") {
//         return calculateUtilityRent(position, currentState);
//       }

//       return 0;
//     },
//     []
//   );

//   const calculatePropertyRent = (
//     property: any,
//     position: number,
//     state: GameState
//   ): number => {
//     // Check if property is mortgaged
//     if (state.mortgagedProperties?.includes(position)) {
//       return 0;
//     }

//     const buildings = state.propertyBuildings?.[position];
//     const owner = state.propertyOwnership?.[position];

//     // Base rent
//     let rent = property.baseRent || 0;

//     // Check if player owns full color group
//     const colorGroup = property.colorGroup;
//     if (colorGroup) {
//       const groupPositions =
//         colorGroups[colorGroup as keyof typeof colorGroups] || [];
//       const ownsFullGroup = groupPositions.every(
//         (pos) => state.propertyOwnership?.[pos] === owner
//       );

//       if (ownsFullGroup) {
//         // Apply building rent or double base rent
//         if (buildings?.hasHotel) {
//           rent = property.rentWithHotel || rent;
//         } else if (buildings?.houses) {
//           switch (buildings.houses) {
//             case 1:
//               rent = property.rentWith1House || rent;
//               break;
//             case 2:
//               rent = property.rentWith2Houses || rent;
//               break;
//             case 3:
//               rent = property.rentWith3Houses || rent;
//               break;
//             case 4:
//               rent = property.rentWith4Houses || rent;
//               break;
//           }
//         } else {
//           // Double rent for owning full color group with no buildings
//           rent = property.rentWithColorGroup || rent * 2;
//         }
//       }
//     }

//     return rent;
//   };

//   const calculateRailroadRent = (
//     position: number,
//     state: GameState
//   ): number => {
//     if (state.mortgagedProperties?.includes(position)) {
//       return 0;
//     }

//     const owner = state.propertyOwnership?.[position];
//     if (!owner) return 0;

//     // Count owned railroads
//     const railroadPositions = [5, 15, 25, 35];
//     const ownedRailroads = railroadPositions.filter(
//       (pos) => state.propertyOwnership?.[pos] === owner
//     ).length;

//     const property = getPropertyData(position);
//     const railroadRent = property?.railroadRent || [25, 50, 100, 200];

//     return railroadRent[ownedRailroads - 1] || 0;
//   };

//   const calculateBeachRent = (position: number, state: GameState): number => {
//     if (state.mortgagedProperties?.includes(position)) {
//       return 0;
//     }

//     const owner = state.propertyOwnership?.[position];
//     if (!owner) return 0;

//     // Count owned beaches
//     const beachPositions = [5, 15, 25, 35];
//     const ownedBeaches = beachPositions.filter(
//       (pos) => state.propertyOwnership?.[pos] === owner
//     ).length;

//     const property = getPropertyData(position);
//     const beachRent = property?.beachRent || [50, 100, 200, 400];

//     return beachRent[ownedBeaches - 1] || 0;
//   };

//   const calculateUtilityRent = (
//     position: number,
//     state: GameState,
//     diceRoll: number = 7
//   ): number => {
//     if (state.mortgagedProperties?.includes(position)) {
//       return 0;
//     }

//     const owner = state.propertyOwnership?.[position];
//     if (!owner) return 0;

//     // Count owned utilities
//     const utilityPositions = [12, 28];
//     const ownedUtilities = utilityPositions.filter(
//       (pos) => state.propertyOwnership?.[pos] === owner
//     ).length;

//     const property = getPropertyData(position);
//     const utilityMultiplier = property?.utilityMultiplier || [4, 10];

//     return diceRoll * utilityMultiplier[ownedUtilities - 1];
//   };

//   // Check if player owns full color group
//   const ownsFullColorGroup = useCallback(
//     (playerId: number, colorGroup: string, state: GameState): boolean => {
//       const groupPositions =
//         colorGroups[colorGroup as keyof typeof colorGroups] || [];
//       return groupPositions.every(
//         (position) => state.propertyOwnership?.[position] === playerId
//       );
//     },
//     []
//   );

//   // Check if player can build on property
//   const canBuildOnProperty = useCallback(
//     (playerId: number, position: number, state: GameState): boolean => {
//       const property = getPropertyData(position);
//       if (!property || property.type !== "property") return false;

//       // Must own the property
//       if (state.propertyOwnership?.[position] !== playerId) return false;

//       // Must own full color group
//       if (!property.colorGroup) return false;
//       if (!ownsFullColorGroup(playerId, property.colorGroup, state))
//         return false;

//       // Property must not be mortgaged
//       if (state.mortgagedProperties?.includes(position)) return false;

//       // Check building limits
//       const buildings = state.propertyBuildings?.[position];
//       if (buildings?.hasHotel) return false; // Already has hotel
//       if (buildings?.houses >= 4) return false; // Already has 4 houses

//       return true;
//     },
//     [ownsFullColorGroup]
//   );

//   // Get building cost for property
//   const getBuildingCost = useCallback(
//     (position: number, buildingType: "house" | "hotel"): number => {
//       const property = getPropertyData(position);
//       if (!property || property.type !== "property") return 0;

//       return buildingType === "house"
//         ? property.houseCost || 0
//         : property.hotelCost || 0;
//     },
//     []
//   );

//   // Get mortgage value
//   const getMortgageValue = useCallback((position: number): number => {
//     const property = getPropertyData(position);
//     return property?.mortgageValue || 0;
//   }, []);

//   // Check if position is a property that can be owned
//   const isOwnableProperty = useCallback((position: number): boolean => {
//     return (
//       isProperty(position) ||
//       isRailroad(position) ||
//       isBeach(position) ||
//       isUtility(position)
//     );
//   }, []);

//   // Get property color group
//   const getPropertyColorGroup = useCallback(
//     (position: number): string | null => {
//       const property = getPropertyData(position);
//       return property?.colorGroup || null;
//     },
//     []
//   );

//   // Get properties in same color group
//   const getPropertiesInColorGroup = useCallback(
//     (colorGroup: string): number[] => {
//       return colorGroups[colorGroup as keyof typeof colorGroups] || [];
//     },
//     []
//   );

//   // Check if player owns all 4 beaches (win condition)
//   const ownsAllBeaches = useCallback(
//     (playerId: number, state: GameState): boolean => {
//       const beachPositions = [5, 15, 25, 35];
//       return beachPositions.every(
//         (position) => state.propertyOwnership?.[position] === playerId
//       );
//     },
//     []
//   );

//   return {
//     getPropertyPrice,
//     getPropertyRent,
//     ownsFullColorGroup,
//     canBuildOnProperty,
//     getBuildingCost,
//     getMortgageValue,
//     isOwnableProperty,
//     getPropertyColorGroup,
//     getPropertiesInColorGroup,
//     calculatePropertyRent,
//     calculateRailroadRent,
//     calculateBeachRent,
//     calculateUtilityRent,
//     ownsAllBeaches,
//   };
// };
