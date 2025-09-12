"use client";

import React, { useState, useCallback } from "react";
import { Player } from "./player-tokens";
import {
  boardSpaces,
  CardData,
  chanceCards,
  communityChestCards,
} from "@/data/monopoly-data";

interface PropertyOwnership {
  [propertyIndex: number]: number; // propertyIndex -> playerId
}

interface PropertyBuildings {
  [propertyIndex: number]: {
    houses: number;
    hasHotel: boolean;
  };
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gamePhase:
    | "waiting"
    | "rolling"
    | "moving"
    | "property-action"
    | "special-action"
    | "finished";
  propertyOwnership: PropertyOwnership;
  propertyBuildings: PropertyBuildings;
  mortgagedProperties: number[];
  gameLog: string[];
  currentMessage?: {
    text: string;
    type: "info" | "warning" | "success" | "error";
    duration?: number;
  };
  currentAction?: {
    type:
      | "buy-property"
      | "pay-rent"
      | "chance"
      | "community-chest"
      | "tax"
      | "go-to-jail"
      | "jail-options";
    data?: any;
  };
  cardDrawModal?: {
    isOpen: boolean;
    cardType: "chance" | "community-chest";
  };
}

interface GameManagerProps {
  onPlayerMove: (playerId: number, newPosition: number) => void;
  onGameStateChange: (state: GameState) => void;
}

export const useGameManager = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      {
        id: 1,
        name: "Blue Baron",
        color: "#4444ff",
        avatar: "/images/blue-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 2,
        name: "Green Giant",
        color: "#44ff44",
        avatar: "/images/green-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 3,
        name: "Red Tycoon",
        color: "#ff4444",
        avatar: "/images/red-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 4,
        name: "Yellow Mogul",
        color: "#ffdd44",
        avatar: "/images/yellow-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
    ],
    currentPlayerIndex: 0,
    gamePhase: "waiting",
    propertyOwnership: {},
    propertyBuildings: {},
    mortgagedProperties: [],
    gameLog: ["Game started!"],
  });

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
  const getPropertyPrice = (position: number): number => {
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
  };

  // Calculate rent with buildings
  const getPropertyRent = (
    position: number,
    state?: typeof gameState
  ): number => {
    const currentState = state || gameState;
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

    const buildings = currentState.propertyBuildings[position];
    let rent = baseRent[position] || 2;

    // Check if property is mortgaged
    if (currentState.mortgagedProperties.includes(position)) {
      return 0; // No rent for mortgaged properties
    }

    // Check if player owns full color group
    const colorGroup = Object.entries(colorGroups).find(([_, positions]) =>
      positions.includes(position)
    );

    if (colorGroup) {
      const [_, groupPositions] = colorGroup;
      const owner = currentState.propertyOwnership[position];
      const ownsFullGroup = groupPositions.every(
        (pos) => currentState.propertyOwnership[pos] === owner
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
  };

  // Check if player owns full color group
  const ownsFullColorGroup = (playerId: number, position: number): boolean => {
    const colorGroup = Object.entries(colorGroups).find(([_, positions]) =>
      positions.includes(position)
    );

    if (!colorGroup) return false;

    const [_, groupPositions] = colorGroup;
    return groupPositions.every(
      (pos) => gameState.propertyOwnership[pos] === playerId
    );
  };

  // Add money and log
  const addMoney = useCallback(
    (playerId: number, amount: number, reason: string) => {
      setGameState((prevState) => {
        const newPlayers = prevState.players.map((player) =>
          player.id === playerId
            ? { ...player, money: player.money + amount }
            : player
        );
        const player = newPlayers.find((p) => p.id === playerId);
        const newLog = [
          ...prevState.gameLog,
          `${player?.name} ${reason} $${amount}`,
        ];

        return {
          ...prevState,
          players: newPlayers,
          gameLog: newLog,
        };
      });
    },
    []
  );

  // Helper function to show messages
  const showMessage = useCallback(
    (
      text: string,
      type: "info" | "warning" | "success" | "error" = "info",
      duration: number = 3000
    ) => {
      setGameState((prevState) => ({
        ...prevState,
        currentMessage: { text, type, duration },
      }));

      // Clear message after duration
      setTimeout(() => {
        setGameState((prevState) => ({
          ...prevState,
          currentMessage: undefined,
        }));
      }, duration);
    },
    []
  );

  const nextTurn = useCallback(() => {
    console.log("nextTurn called - advancing to next player");
    setGameState((prevState) => {
      const newPlayerIndex =
        (prevState.currentPlayerIndex + 1) % prevState.players.length;
      const newPlayer = prevState.players[newPlayerIndex];
      console.log(
        `Turn advanced from player ${prevState.currentPlayerIndex} to player ${newPlayerIndex} (${newPlayer.name})`
      );

      return {
        ...prevState,
        currentPlayerIndex: newPlayerIndex,
        gamePhase: "waiting",
        currentAction: undefined,
        currentMessage: undefined,
      };
    });
  }, []);

  // Handle landing on a space
  const handleSpaceLanding = useCallback(
    (playerId: number, position: number) => {
      const space = boardSpaces[position];
      const player = gameState.players.find((p) => p.id === playerId);

      console.log(
        `handleSpaceLanding called: playerId=${playerId}, position=${position}, space=${space?.name}, player=${player?.name}`
      );

      if (!space || !player) {
        console.log("handleSpaceLanding: space or player not found, returning");
        return;
      }

      setGameState((prevState) => {
        let newState = { ...prevState };
        let action = undefined;

        switch (space.type) {
          case "corner":
            if (space.name === "GO") {
              // Already handled in movement - just advance turn
              setTimeout(() => {
                nextTurn();
              }, 1000);
            } else if (space.name === "Go To Jail") {
              // Send to jail
              const newPlayers = prevState.players.map((p) =>
                p.id === playerId
                  ? { ...p, position: 10, inJail: true, jailTurns: 0 } // Position 10 is JAIL
                  : p
              );
              newState.players = newPlayers;
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} went to Jail!`,
              ];

              // Show jail message
              showMessage(`${player.name} went to Jail!`, "warning", 2000);

              // Auto advance turn after going to jail
              setTimeout(() => {
                nextTurn();
              }, 2000);
            } else if (space.name === "Free Parking") {
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} rests at Free Parking`,
              ];

              // Auto advance turn after landing on Free Parking
              setTimeout(() => {
                nextTurn();
              }, 1500);
            }
            break;

          case "property":
            const owner = prevState.propertyOwnership[position];

            if (!owner) {
              // Property available for purchase
              action = {
                type: "buy-property" as const,
                data: { position, price: getPropertyPrice(position) },
              };
              newState.gamePhase = "property-action";
            } else if (owner !== playerId) {
              // Pay rent to owner
              const rent = getPropertyRent(position, prevState);
              const ownerPlayer = prevState.players.find((p) => p.id === owner);
              const newPlayers = prevState.players.map((p) => {
                if (p.id === playerId) {
                  return { ...p, money: p.money - rent };
                } else if (p.id === owner) {
                  return { ...p, money: p.money + rent };
                }
                return p;
              });
              newState.players = newPlayers;
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} paid $${rent} rent to ${ownerPlayer?.name}`,
              ];

              // Show rent payment message
              showMessage(
                `${player.name} paid $${rent} rent to ${ownerPlayer?.name}`,
                "info",
                2000
              );

              // Auto advance turn after paying rent
              setTimeout(() => {
                nextTurn();
              }, 2000);
            } else {
              // Player owns this property - just advance turn
              setTimeout(() => {
                nextTurn();
              }, 1000);
            }
            break;

          case "chance":
            newState.cardDrawModal = { isOpen: true, cardType: "chance" };
            newState.gamePhase = "special-action";
            break;

          case "community-chest":
            newState.cardDrawModal = {
              isOpen: true,
              cardType: "community-chest",
            };
            newState.gamePhase = "special-action";
            break;

          default:
            console.log(
              `handleSpaceLanding default case: space=${space.name}, type=${space.type}`
            );
            // Handle other spaces like taxes, utilities, railroads that are not owned
            if (
              space.name?.includes("Tax") ||
              space.name?.includes("Income Tax")
            ) {
              const taxAmount = space.name?.includes("Luxury") ? 100 : 200;
              newState.players = prevState.players.map((p) =>
                p.id === playerId ? { ...p, money: p.money - taxAmount } : p
              );
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} paid $${taxAmount} in taxes`,
              ];

              // Show tax message
              showMessage(
                `${player.name} paid $${taxAmount} in taxes`,
                "warning",
                2000
              );

              // Auto advance turn after paying tax
              setTimeout(() => {
                console.log("Advancing turn after tax payment");
                nextTurn();
              }, 2000);
            } else {
              // For any other space, just advance turn
              console.log("Advancing turn for non-property space");
              setTimeout(() => {
                console.log("Calling nextTurn()");
                nextTurn();
              }, 1000);
            }
            break;
        }

        newState.currentAction = action;
        return newState;
      });
    },
    [gameState.players, nextTurn, showMessage]
  );

  const movePlayer = useCallback(
    (playerId: number, steps: number) => {
      // Animate movement step by step through each board space
      let currentStep = 0;
      let finalPosition = 0;
      let totalMoneyBonus = 0;

      const moveInterval = setInterval(() => {
        if (currentStep >= steps) {
          clearInterval(moveInterval);
          // Handle space landing after movement is complete
          setTimeout(() => {
            handleSpaceLanding(playerId, finalPosition);
          }, 500);
          return;
        }

        setGameState((prevState) => {
          const newPlayers = prevState.players.map((player) => {
            if (player.id === playerId) {
              const currentPosition = player.position;
              const nextPosition = (currentPosition + 1) % 24;
              finalPosition = nextPosition;

              // Debug: Log the movement
              console.log(
                `Player ${player.id} moving from ${boardSpaces[currentPosition]?.name} (${currentPosition}) to ${boardSpaces[nextPosition]?.name} (${nextPosition})`
              );

              // Check if passing through GO (but not landing on it)
              const passedGo =
                currentPosition > nextPosition && nextPosition !== 0;
              // Check if landing on GO
              const landedOnGo = nextPosition === 0;

              let moneyBonus = 0;

              if (passedGo || landedOnGo) {
                moneyBonus = 200;
                totalMoneyBonus += moneyBonus;
              }

              return {
                ...player,
                position: nextPosition,
                money: player.money + moneyBonus,
              };
            }
            return player;
          });

          const player = newPlayers.find((p) => p.id === playerId);
          const passedOrLandedOnGo =
            player?.position === 0 ||
            (prevState.players.find((p) => p.id === playerId)?.position || 0) >
              (player?.position || 0);

          return {
            ...prevState,
            players: newPlayers,
            gameLog: passedOrLandedOnGo
              ? [
                  ...prevState.gameLog,
                  `${player?.name} ${
                    player?.position === 0 ? "landed on" : "passed"
                  } GO and collected $200`,
                ]
              : prevState.gameLog,
          };
        });

        currentStep++;
      }, 400); // Move one space every 400ms for better visibility
    },
    [handleSpaceLanding]
  );

  // Buy property
  const buyProperty = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const price = getPropertyPrice(position);

      if (currentPlayer.money >= price) {
        setGameState((prevState) => {
          const newPlayers = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? {
                  ...player,
                  money: player.money - price,
                  properties: [...player.properties, position],
                }
              : player
          );

          return {
            ...prevState,
            players: newPlayers,
            propertyOwnership: {
              ...prevState.propertyOwnership,
              [position]: currentPlayer.id,
            },
            gameLog: [
              ...prevState.gameLog,
              `${currentPlayer.name} bought ${boardSpaces[position]?.name} for $${price}`,
            ],
            gamePhase: "waiting",
            currentAction: undefined,
          };
        });

        // Call nextTurn after buying property
        setTimeout(() => {
          nextTurn();
        }, 500);
      }
    },
    [gameState.players, gameState.currentPlayerIndex, nextTurn]
  );

  // Skip buying property
  const skipProperty = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gamePhase: "waiting",
      currentAction: undefined,
      gameLog: [
        ...prevState.gameLog,
        `${
          gameState.players[gameState.currentPlayerIndex].name
        } skipped buying property`,
      ],
    }));

    // Call nextTurn after skipping property
    setTimeout(() => {
      nextTurn();
    }, 500);
  }, [gameState.players, gameState.currentPlayerIndex, nextTurn]);

  // Card type definitions
  interface Card {
    type:
      | "move"
      | "money"
      | "jail"
      | "get-out-jail"
      | "repairs"
      | "collect-from-players"
      | "tax";
    message: string;
    position?: number | string;
    amount?: number;
    collectGo?: boolean;
    housePrice?: number;
    hotelPrice?: number;
  }

  // Chance Cards
  const chanceCards: Card[] = [
    {
      type: "move",
      position: 0,
      message: "Advance to GO (Collect $200)",
      collectGo: true,
    },
    {
      type: "move",
      position: 24,
      message: "Advance to Illinois Avenue",
      collectGo: false,
    },
    {
      type: "move",
      position: 11,
      message: "Advance to St. Charles Place",
      collectGo: false,
    },
    {
      type: "move",
      position: "nearest-utility",
      message: "Advance to nearest Utility",
      collectGo: false,
    },
    {
      type: "move",
      position: "nearest-railroad",
      message: "Advance to nearest Railroad",
      collectGo: false,
    },
    { type: "money", amount: 50, message: "Bank pays you dividend of $50" },
    { type: "get-out-jail", message: "Get Out of Jail Free" },
    {
      type: "move",
      position: "back-3",
      message: "Go Back 3 Spaces",
      collectGo: false,
    },
    { type: "jail", message: "Go to Jail – Go directly to Jail" },
    {
      type: "repairs",
      housePrice: 25,
      hotelPrice: 100,
      message: "Make general repairs on all your property",
    },
    { type: "money", amount: -15, message: "Speeding fine $15" },
    {
      type: "move",
      position: 5,
      message: "Take a trip to Reading Railroad",
      collectGo: false,
    },
    {
      type: "move",
      position: 39,
      message: "Take a walk on the Boardwalk",
      collectGo: false,
    },
    {
      type: "tax",
      amount: -15,
      message:
        "You have been elected Chairman of the Board – Pay each player $50",
    },
    {
      type: "money",
      amount: 150,
      message: "Your building loan matures – Collect $150",
    },
    {
      type: "money",
      amount: 100,
      message: "You have won a crossword competition – Collect $100",
    },
  ];

  // Community Chest Cards
  const communityChestCards: Card[] = [
    {
      type: "move",
      position: 0,
      message: "Advance to GO (Collect $200)",
      collectGo: true,
    },
    {
      type: "money",
      amount: 200,
      message: "Bank error in your favor – Collect $200",
    },
    { type: "money", amount: -50, message: "Doctor's fee – Pay $50" },
    { type: "money", amount: 50, message: "From sale of stock you get $50" },
    { type: "get-out-jail", message: "Get Out of Jail Free" },
    { type: "jail", message: "Go to Jail – Go directly to jail" },
    {
      type: "money",
      amount: 100,
      message: "Holiday fund matures – Receive $100",
    },
    { type: "money", amount: 20, message: "Income tax refund – Collect $20" },
    {
      type: "money",
      amount: 10,
      message: "Life insurance matures – Collect $100",
    },
    { type: "money", amount: -100, message: "Hospital fees – Pay $100" },
    { type: "money", amount: -50, message: "School fees – Pay $50" },
    { type: "money", amount: 25, message: "Receive $25 consultancy fee" },
    {
      type: "repairs",
      housePrice: 40,
      hotelPrice: 115,
      message: "You are assessed for street repairs",
    },
    {
      type: "money",
      amount: 10,
      message: "You have won second prize in a beauty contest – Collect $10",
    },
    { type: "money", amount: 100, message: "You inherit $100" },
    {
      type: "collect-from-players",
      amount: 10,
      message: "It is your birthday – Collect $10 from every player",
    },
  ];

  // Store drawn cards for Get Out of Jail Free
  const [drawnCards, setDrawnCards] = useState<{
    chanceIndex: number;
    communityChestIndex: number;
    playerJailCards: { [playerId: number]: number };
  }>({
    chanceIndex: 0,
    communityChestIndex: 0,
    playerJailCards: {},
  });

  // Handle Chance/Community Chest cards
  const handleSpecialCard = useCallback(
    (cardType: "chance" | "community-chest") => {
      const cards = cardType === "chance" ? chanceCards : communityChestCards;
      const currentIndex =
        cardType === "chance"
          ? drawnCards.chanceIndex
          : drawnCards.communityChestIndex;
      const card = cards[currentIndex];
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Update card index for next draw
      setDrawnCards((prev) => ({
        ...prev,
        [cardType === "chance" ? "chanceIndex" : "communityChestIndex"]:
          (currentIndex + 1) % cards.length,
      }));

      setGameState((prevState) => {
        let newState = { ...prevState };
        let logMessage = `${currentPlayer.name}: ${card.message}`;

        switch (card.type) {
          case "money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money + (card.amount || 0) }
                : player
            );
            break;

          case "move":
            let newPosition: number;
            let passedGo = false;

            if (card.position === "back-3") {
              newPosition = (currentPlayer.position - 3 + 40) % 40;
            } else if (card.position === "nearest-utility") {
              // Utilities are at positions 12 and 28
              const utilities = [12, 28];
              newPosition =
                utilities.find((pos) => pos > currentPlayer.position) ||
                utilities[0];
              passedGo = newPosition <= currentPlayer.position;
            } else if (card.position === "nearest-railroad") {
              // Railroads are at positions 5, 15, 25, 35
              const railroads = [5, 15, 25, 35];
              newPosition =
                railroads.find((pos) => pos > currentPlayer.position) ||
                railroads[0];
              passedGo = newPosition <= currentPlayer.position;
            } else {
              newPosition =
                typeof card.position === "number" ? card.position : 0;
              passedGo =
                newPosition < currentPlayer.position && newPosition !== 0;
            }

            let bonusMoney = 0;
            if (card.collectGo || passedGo) {
              bonusMoney = 200;
              logMessage += " (Collected $200 for passing GO)";
            }

            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    position: newPosition,
                    money: player.money + bonusMoney,
                  }
                : player
            );
            break;

          case "jail":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 10, inJail: true, jailTurns: 0 } // Position 10 is jail
                : player
            );
            break;

          case "get-out-jail":
            // Give player a Get Out of Jail Free card
            setDrawnCards((prev) => ({
              ...prev,
              playerJailCards: {
                ...prev.playerJailCards,
                [currentPlayer.id]:
                  (prev.playerJailCards[currentPlayer.id] || 0) + 1,
              },
            }));
            break;

          case "repairs":
            const houses = Object.values(prevState.propertyBuildings).reduce(
              (total, building) => total + (building.houses || 0),
              0
            );
            const hotels = Object.values(prevState.propertyBuildings).reduce(
              (total, building) => total + (building.hasHotel ? 1 : 0),
              0
            );
            const repairCost =
              houses * (card.housePrice || 0) + hotels * (card.hotelPrice || 0);

            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money - repairCost }
                : player
            );
            logMessage += ` – Pay $${repairCost}`;
            break;

          case "collect-from-players":
            const totalCollected =
              (prevState.players.length - 1) * (card.amount || 0);
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return { ...player, money: player.money + totalCollected };
              } else {
                return { ...player, money: player.money - (card.amount || 0) };
              }
            });
            logMessage += ` (Collected $${totalCollected} total)`;
            break;

          case "tax":
            const totalPaid =
              (prevState.players.length - 1) * Math.abs(card.amount || 0);
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return { ...player, money: player.money - totalPaid };
              } else {
                return {
                  ...player,
                  money: player.money + Math.abs(card.amount || 0),
                };
              }
            });
            logMessage += ` (Paid $${totalPaid} total)`;
            break;
        }

        return {
          ...newState,
          gameLog: [...prevState.gameLog, logMessage],
          gamePhase: "waiting",
          currentAction: undefined,
        };
      });

      // Call nextTurn after handling the special card
      setTimeout(() => {
        nextTurn();
      }, 500);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      nextTurn,
      drawnCards,
      chanceCards,
      communityChestCards,
    ]
  );

  // Handle card drawn from CardDrawModal
  const handleCardDrawn = useCallback(
    (card: CardData) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      setGameState((prevState) => {
        let newState = { ...prevState };
        let logMessage = `${currentPlayer.name}: ${card.title} - ${card.description}`;

        switch (card.action) {
          case "collect-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money + card.value }
                : player
            );
            break;

          case "pay-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - card.value) }
                : player
            );
            break;

          case "advance-to-go":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 0, money: player.money + card.value }
                : player
            );
            break;

          case "advance-to-boardwalk":
            const boardwalkPosition = 23; // Boardwalk position
            const passedGo = boardwalkPosition < currentPlayer.position;
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    position: boardwalkPosition,
                    money: player.money + (passedGo ? 200 : 0),
                  }
                : player
            );
            if (passedGo) {
              logMessage += " (Collected $200 for passing GO)";
            }
            break;

          case "go-to-jail":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 7, inJail: true, jailTurns: 0 }
                : player
            );
            break;

          case "get-out-of-jail":
            // Add "Get Out of Jail Free" card to player's inventory
            setDrawnCards((prev) => ({
              ...prev,
              playerJailCards: {
                ...prev.playerJailCards,
                [currentPlayer.id]:
                  (prev.playerJailCards[currentPlayer.id] || 0) + 1,
              },
            }));
            break;

          case "collect-from-players":
            const totalCollected = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return { ...player, money: player.money + totalCollected };
              } else {
                return {
                  ...player,
                  money: Math.max(0, player.money - card.value),
                };
              }
            });
            break;

          case "pay-each-player":
            const totalPaid = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return {
                  ...player,
                  money: Math.max(0, player.money - totalPaid),
                };
              } else {
                return { ...player, money: player.money + card.value };
              }
            });
            break;

          case "street-repairs":
            let repairCost = 0;
            currentPlayer.properties.forEach((propIndex) => {
              const buildings = gameState.propertyBuildings[propIndex];
              if (buildings) {
                repairCost += buildings.houses * 40;
                if (buildings.hasHotel) {
                  repairCost += 115;
                }
              }
            });

            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - repairCost) }
                : player
            );
            logMessage += ` (Paid $${repairCost} for repairs)`;
            break;

          default:
            break;
        }

        // Add to game log
        newState.gameLog = [...prevState.gameLog, logMessage];

        // Set current message
        newState.currentMessage = {
          text: card.description,
          type:
            card.action.includes("collect") ||
            card.action.includes("advance-to-go")
              ? "success"
              : "info",
          duration: 3000,
        };

        // Keep the card modal open to show the drawn card
        // Modal will be closed when user clicks "Apply Card Effect"

        return newState;
      });

      // Call nextTurn after handling the card
      setTimeout(() => {
        nextTurn();
      }, 1000);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyBuildings,
      nextTurn,
      setDrawnCards,
    ]
  );

  // Close card modal and advance turn
  const closeCardModal = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      cardDrawModal: { isOpen: false, cardType: "chance" },
      gamePhase: "waiting",
    }));
    nextTurn();
  }, [nextTurn]);

  // Enhanced Jail mechanics
  const payJailFine = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.money >= 50) {
      setGameState((prevState) => ({
        ...prevState,
        players: prevState.players.map((player) =>
          player.id === currentPlayer.id
            ? {
                ...player,
                money: player.money - 50,
                inJail: false,
                jailTurns: 0,
              }
            : player
        ),
        gameLog: [
          ...prevState.gameLog,
          `${currentPlayer.name} paid $50 to get out of jail`,
        ],
        gamePhase: "waiting",
        currentAction: undefined,
      }));

      // Call nextTurn after paying jail fine
      setTimeout(() => {
        nextTurn();
      }, 500);
    }
  }, [gameState.players, gameState.currentPlayerIndex, nextTurn]);

  // Use Get Out of Jail Free card
  const useJailFreeCard = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const playerJailCards = drawnCards.playerJailCards[currentPlayer.id] || 0;

    if (playerJailCards > 0) {
      setGameState((prevState) => ({
        ...prevState,
        players: prevState.players.map((player) =>
          player.id === currentPlayer.id
            ? { ...player, inJail: false, jailTurns: 0 }
            : player
        ),
        gameLog: [
          ...prevState.gameLog,
          `${currentPlayer.name} used Get Out of Jail Free card`,
        ],
        gamePhase: "waiting",
        currentAction: undefined,
      }));

      // Remove the used card
      setDrawnCards((prev) => ({
        ...prev,
        playerJailCards: {
          ...prev.playerJailCards,
          [currentPlayer.id]: playerJailCards - 1,
        },
      }));

      // Call nextTurn after using card
      setTimeout(() => {
        nextTurn();
      }, 500);
    }
  }, [gameState.players, gameState.currentPlayerIndex, drawnCards, nextTurn]);

  // Try to roll doubles to get out of jail
  const tryJailDoubles = useCallback(
    (dice1: number, dice2: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const isDoubles = dice1 === dice2;
      const total = dice1 + dice2;

      setGameState((prevState) => {
        let newState = { ...prevState };

        if (isDoubles) {
          // Got doubles - get out of jail and move
          newState.players = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, inJail: false, jailTurns: 0 }
              : player
          );
          newState.gameLog = [
            ...prevState.gameLog,
            `${currentPlayer.name} rolled doubles (${dice1}, ${dice2}) and got out of jail!`,
          ];
          newState.gamePhase = "moving";

          // Move the player after getting out
          setTimeout(() => {
            movePlayer(currentPlayer.id, total);
          }, 500);
        } else {
          // Didn't get doubles - increment jail turns
          const newJailTurns = currentPlayer.jailTurns + 1;
          newState.players = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, jailTurns: newJailTurns }
              : player
          );

          if (newJailTurns >= 3) {
            // Must pay fine after 3 turns
            newState.players = newState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    money: player.money - 50,
                    inJail: false,
                    jailTurns: 0,
                  }
                : player
            );
            newState.gameLog = [
              ...prevState.gameLog,
              `${currentPlayer.name} rolled (${dice1}, ${dice2}) - no doubles. Forced to pay $50 after 3 turns in jail.`,
            ];
            newState.gamePhase = "moving";

            // Move the player after paying
            setTimeout(() => {
              movePlayer(currentPlayer.id, total);
            }, 500);
          } else {
            newState.gameLog = [
              ...prevState.gameLog,
              `${currentPlayer.name} rolled (${dice1}, ${dice2}) - no doubles. Turn ${newJailTurns}/3 in jail.`,
            ];
            newState.gamePhase = "waiting";

            // End turn
            setTimeout(() => {
              nextTurn();
            }, 500);
          }
        }

        return newState;
      });
    },
    [gameState.players, gameState.currentPlayerIndex, nextTurn, movePlayer]
  );

  // Build house
  const buildHouse = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const housePrice = 50; // Simplified house price

      if (
        currentPlayer.money >= housePrice &&
        ownsFullColorGroup(currentPlayer.id, position)
      ) {
        const currentBuildings = gameState.propertyBuildings[position] || {
          houses: 0,
          hasHotel: false,
        };

        if (currentBuildings.houses < 4 && !currentBuildings.hasHotel) {
          // Check balanced building rule
          const colorGroup = Object.entries(colorGroups).find(
            ([_, positions]) => positions.includes(position)
          );

          if (colorGroup) {
            const [_, groupPositions] = colorGroup;
            const buildingCounts = groupPositions.map(
              (pos) => gameState.propertyBuildings[pos]?.houses || 0
            );
            const maxHouses = Math.max(...buildingCounts);
            const currentHouses = currentBuildings.houses;

            // Can only build if not exceeding balance (max difference of 1)
            if (currentHouses < maxHouses + 1) {
              setGameState((prevState) => ({
                ...prevState,
                players: prevState.players.map((player) =>
                  player.id === currentPlayer.id
                    ? { ...player, money: player.money - housePrice }
                    : player
                ),
                propertyBuildings: {
                  ...prevState.propertyBuildings,
                  [position]: {
                    ...currentBuildings,
                    houses: currentBuildings.houses + 1,
                  },
                },
                gameLog: [
                  ...prevState.gameLog,
                  `${currentPlayer.name} built a house on ${boardSpaces[position]?.name}`,
                ],
              }));
            }
          }
        }
      }
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyBuildings,
      ownsFullColorGroup,
    ]
  );

  // Build hotel
  const buildHotel = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const hotelPrice = 50; // Simplified hotel price

      if (
        currentPlayer.money >= hotelPrice &&
        ownsFullColorGroup(currentPlayer.id, position)
      ) {
        const currentBuildings = gameState.propertyBuildings[position] || {
          houses: 0,
          hasHotel: false,
        };

        if (currentBuildings.houses === 4 && !currentBuildings.hasHotel) {
          setGameState((prevState) => ({
            ...prevState,
            players: prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money - hotelPrice }
                : player
            ),
            propertyBuildings: {
              ...prevState.propertyBuildings,
              [position]: { houses: 0, hasHotel: true }, // Hotel replaces houses
            },
            gameLog: [
              ...prevState.gameLog,
              `${currentPlayer.name} built a hotel on ${boardSpaces[position]?.name}`,
            ],
          }));
        }
      }
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyBuildings,
      ownsFullColorGroup,
    ]
  );

  // Mortgage property
  const mortgageProperty = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const mortgageValue = Math.floor(getPropertyPrice(position) / 2);

      if (
        gameState.propertyOwnership[position] === currentPlayer.id &&
        !gameState.mortgagedProperties.includes(position)
      ) {
        // Can't mortgage if there are buildings
        const buildings = gameState.propertyBuildings[position];
        if (!buildings?.houses && !buildings?.hasHotel) {
          setGameState((prevState) => ({
            ...prevState,
            players: prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money + mortgageValue }
                : player
            ),
            mortgagedProperties: [...prevState.mortgagedProperties, position],
            gameLog: [
              ...prevState.gameLog,
              `${currentPlayer.name} mortgaged ${boardSpaces[position]?.name} for $${mortgageValue}`,
            ],
          }));
        }
      }
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyOwnership,
      gameState.mortgagedProperties,
      gameState.propertyBuildings,
    ]
  );

  // Unmortgage property
  const unmortgageProperty = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const unmortgageValue = Math.floor(getPropertyPrice(position) * 0.55); // 10% interest

      if (
        gameState.propertyOwnership[position] === currentPlayer.id &&
        gameState.mortgagedProperties.includes(position) &&
        currentPlayer.money >= unmortgageValue
      ) {
        setGameState((prevState) => ({
          ...prevState,
          players: prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, money: player.money - unmortgageValue }
              : player
          ),
          mortgagedProperties: prevState.mortgagedProperties.filter(
            (pos) => pos !== position
          ),
          gameLog: [
            ...prevState.gameLog,
            `${currentPlayer.name} unmortgaged ${boardSpaces[position]?.name} for $${unmortgageValue}`,
          ],
        }));
      }
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyOwnership,
      gameState.mortgagedProperties,
    ]
  );

  const setGamePhase = useCallback((phase: GameState["gamePhase"]) => {
    setGameState((prevState) => ({
      ...prevState,
      gamePhase: phase,
    }));
  }, []);

  const handleDiceRoll = useCallback(
    (total: number, dice1: number, dice2: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Check if player is in jail
      if (currentPlayer.inJail) {
        // Handle jail dice roll
        tryJailDoubles(dice1, dice2);
        return;
      }

      setGamePhase("moving");

      // Animation delay before moving
      setTimeout(() => {
        movePlayer(currentPlayer.id, total);

        // Don't automatically call nextTurn here
        // The turn should only advance after the player completes any property actions
        // nextTurn will be called after buyProperty or skipProperty
      }, 500);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      movePlayer,
      setGamePhase,
      tryJailDoubles,
    ]
  );

  return {
    gameState,
    movePlayer,
    nextTurn,
    setGamePhase,
    handleDiceRoll,
    buyProperty,
    skipProperty,
    handleSpecialCard,
    handleCardDrawn,
    closeCardModal,
    payJailFine,
    useJailFreeCard,
    tryJailDoubles,
    buildHouse,
    buildHotel,
    mortgageProperty,
    unmortgageProperty,
    ownsFullColorGroup,
    currentPlayer: gameState.players[gameState.currentPlayerIndex],
    drawnCards,
  };
};
