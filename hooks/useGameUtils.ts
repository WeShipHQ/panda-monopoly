import { useCallback } from "react";
import { boardSpaces } from "@/data/monopoly-data";
import { GameState } from "./types";

export const useGameUtils = () => {
  // Color groups mapping
  const colorGroups = {
    brown: [1, 2], // Baltic Ave, Oriental Ave
    lightblue: [4, 5], // Vermont Ave, Connecticut Ave
    pink: [7, 8], // States Ave, Virginia Ave
    orange: [10, 11], // Tennessee Ave, New York Ave
    red: [13, 14], // Kentucky Ave, Indiana Ave
    yellow: [16, 17], // Atlantic Ave, Marvin Gardens
    green: [19, 20], // Pacific Ave, N. Carolina Ave
    darkblue: [22, 23], // Park Place, Boardwalk
  };

  // Property prices (based on actual Monopoly values)
  const getPropertyPrice = useCallback((position: number): number => {
    const space = boardSpaces[position];
    if (space?.type === "property") {
      // Actual Monopoly prices
      const prices: { [key: number]: number } = {
        1: 60, // Baltic Ave
        2: 60, // Oriental Ave
        4: 100, // Vermont Ave
        5: 120, // Connecticut Ave
        7: 140, // States Ave
        8: 160, // Virginia Ave
        10: 180, // Tennessee Ave
        11: 200, // New York Ave
        13: 220, // Kentucky Ave
        14: 220, // Indiana Ave
        16: 260, // Atlantic Ave
        17: 280, // Marvin Gardens
        19: 300, // Pacific Ave
        20: 300, // N. Carolina Ave
        22: 350, // Park Place
        23: 400, // Boardwalk
      };
      return prices[position] || 60;
    }
    return 0;
  }, []);

  // Calculate rent with buildings
  const getPropertyRent = useCallback(
    (position: number, state?: GameState): number => {
      const currentState = state || ({} as GameState);
      const baseRent: { [key: number]: number } = {
        1: 2,
        2: 4,
        4: 6,
        5: 8,
        7: 10,
        8: 12,
        10: 14,
        11: 16,
        13: 18,
        14: 18,
        16: 22,
        17: 24,
        19: 26,
        20: 26,
        22: 35,
        23: 50,
      };

      const buildings = currentState.propertyBuildings?.[position];
      let rent = baseRent[position] || 2;

      // Check if property is mortgaged
      if (currentState.mortgagedProperties?.includes(position)) {
        return 0; // No rent for mortgaged properties
      }

      // Check if player owns full color group
      const colorGroup = Object.entries(colorGroups).find(([_, positions]) =>
        positions.includes(position)
      );

      if (colorGroup) {
        const [_, groupPositions] = colorGroup;
        const owner = currentState.propertyOwnership?.[position];
        const ownsFullGroup = groupPositions.every(
          (pos) => currentState.propertyOwnership?.[pos] === owner
        );

        if (ownsFullGroup && !buildings?.houses && !buildings?.hasHotel) {
          // Double rent for owning full color group
          rent *= 2;
        }
      }

      // Apply building multipliers
      if (buildings?.hasHotel) {
        rent *= 25; // Hotel multiplier
      } else if (buildings?.houses) {
        const houseMultipliers = [5, 15, 20, 25]; // 1-4 houses
        rent *= houseMultipliers[buildings.houses - 1] || 1;
      }

      return rent;
    },
    [colorGroups]
  );

  // Check if player owns full color group
  const ownsFullColorGroup = useCallback(
    (playerId: number, position: number, gameState: GameState): boolean => {
      const colorGroup = Object.entries(colorGroups).find(([_, positions]) =>
        positions.includes(position)
      );

      if (!colorGroup) return false;

      const [_, groupPositions] = colorGroup;
      return groupPositions.every(
        (pos) => gameState.propertyOwnership[pos] === playerId
      );
    },
    [colorGroups]
  );

  return {
    colorGroups,
    getPropertyPrice,
    getPropertyRent,
    ownsFullColorGroup,
  };
};
