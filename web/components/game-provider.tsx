"use client";

import { useGameState } from "@/hooks/useGameStatev2";
import { PlayerState } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { fakePlayerA, fakePlayerB } from "@/lib/sdk/utils";
import { buildAndSendTransaction } from "@/lib/tx";
import { GameAccount, PlayerAccount, PropertyAccount } from "@/types/schema";
import { getPropertyData } from "@/data/unified-monopoly-data";
import {
  Address,
  getAddressFromPublicKey,
  KeyPairSigner,
  createSignerFromKeyPair,
  isSome,
  createSolanaRpc,
} from "@solana/kit";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { GameEvent } from "@/lib/sdk/types";
import {
  MEV_TAX_POSITION,
  PRIORITY_FEE_TAX_POSITION,
  MEV_TAX_AMOUNT,
  PRIORITY_FEE_TAX_AMOUNT,
} from "@/lib/constants";

// Game Log Types
export interface GameLogEntry {
  id: string;
  timestamp: number;
  type:
    | "move"
    | "purchase"
    | "rent"
    | "card"
    | "jail"
    | "bankruptcy"
    | "turn"
    | "dice"
    | "building"
    | "trade"
    | "game"
    | "skip";
  playerId: Address;
  playerName?: string;
  message: string;
  details?: Record<string, any>;
}

interface GameContextType {
  // Game identification
  gameAddress: Address | null;
  setGameAddress: (address: Address | null) => void;

  // Current player management
  currentPlayerAddress: Address | null;
  currentPlayerState: PlayerState | null;
  currentPlayerSigner: KeyPairSigner<string> | null;

  // Game data (from useGameState hook)
  gameState: GameAccount | null;
  players: PlayerAccount[];
  properties: PropertyAccount[];
  gameLoading: boolean;
  gameError: Error | null;
  refetch: () => Promise<void>;

  // Game actions
  rollDice: (diceRoll?: number[]) => Promise<void>;
  buyProperty: (position: number) => Promise<void>;
  skipProperty: (position: number) => Promise<void>;
  payRent: (position: number, owner: Address) => Promise<void>;
  endTurn: () => Promise<void>;
  drawChanceCard: () => Promise<void>;
  drawCommunityChestCard: () => Promise<void>;
  payJailFine: () => Promise<void>;
  buildHouse: (position: number) => Promise<void>;
  buildHotel: (position: number) => Promise<void>;

  // UI state management
  selectedProperty: number | null;
  setSelectedProperty: (position: number | null) => void;
  isPropertyDialogOpen: boolean;
  setIsPropertyDialogOpen: (open: boolean) => void;
  isCardDrawModalOpen: boolean;
  setIsCardDrawModalOpen: (open: boolean) => void;
  cardDrawType: "chance" | "community-chest" | null;
  setCardDrawType: (type: "chance" | "community-chest" | null) => void;

  // Game logs
  gameLogs: GameLogEntry[];
  addGameLog: (log: Omit<GameLogEntry, "id" | "timestamp">) => void;
  clearGameLogs: () => void;

  // Utility functions
  getPropertyByPosition: (position: number) => PropertyAccount | null;
  getPlayerByAddress: (address: Address) => PlayerAccount | null;
  isCurrentPlayerTurn: () => boolean;
  canPlayerAct: () => boolean;
  getPlayerName: (address: Address) => string;

  // events
  cardDrawEvents: GameEvent[];
  latestCardDraw: GameEvent | null;
  addCardDrawEvent: (event: Omit<GameEvent, "id" | "timestamp">) => void;
  clearCardDrawEvents: () => void;
  acknowledgeCardDraw: () => void; // Mark the latest card as acknowledged
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Core state
  const [gameAddress, setGameAddress] = useState<Address | null>(null);
  const [currentPlayerSigner, setCurrentPlayerSigner] =
    useState<KeyPairSigner<string> | null>(null);

  // UI state
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isCardDrawModalOpen, setIsCardDrawModalOpen] = useState(false);
  const [cardDrawType, setCardDrawType] = useState<
    "chance" | "community-chest" | null
  >(null);

  // Game logs
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);

  // events
  const [cardDrawEvents, setCardDrawEvents] = useState<GameEvent[]>([]);
  const [latestCardDraw, setLatestCardDraw] = useState<GameEvent | null>(null);

  // Game log management
  const addGameLog = useCallback(
    (entry: Omit<GameLogEntry, "id" | "timestamp">) => {
      const newLog: GameLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setGameLogs((prev) => [...prev, newLog].slice(-100)); // Keep last 100 entries
    },
    []
  );

  const clearGameLogs = useCallback(() => {
    setGameLogs([]);
  }, []);

  const getPlayerName = useCallback((address: Address): string => {
    // TODO: Implement player name mapping or use address as fallback
    return address.slice(0, 8) + "...";
  }, []);

  const addCardDrawEvent = useCallback(
    (newEvent: GameEvent) => {
      // const newEvent: GameEvent = {
      //   ...event,
      //   id: crypto.randomUUID(),
      //   timestamp: Date.now(),
      // };

      setCardDrawEvents((prev) => [...prev, newEvent].slice(-50)); // Keep last 50 events
      setLatestCardDraw(newEvent);

      // Also add to game logs
      addGameLog({
        type: "card",
        playerId: newEvent.data.player,
        message: `${getPlayerName(newEvent.data.player)} drew a ${
          newEvent.type === "ChanceCardDrawn" ? "Chance" : "Community Chest"
        } card`,
        details: {
          cardType: newEvent.type,
          cardIndex: newEvent.data.cardIndex,
          effectType: newEvent.data.effectType,
          amount: newEvent.data.amount,
        },
      });
    },
    [addGameLog, getPlayerName]
  );

  // Game state from hook
  const {
    players,
    properties,
    gameData: gameState,
    isLoading: gameLoading,
    error: gameError,
    refetch,
  } = useGameState(gameAddress, {
    onCardDrawEvent: addCardDrawEvent,
  });

  // Derived state
  const currentPlayerAddress = useMemo(() => {
    return gameState?.players?.[gameState?.currentTurn] || null;
  }, [gameState]);

  const currentPlayerState = useMemo(() => {
    const player = players?.find(
      (player) => player.wallet === currentPlayerAddress
    );
    return player || null;
  }, [currentPlayerAddress, players]);

  // Utility functions
  const getPropertyByPosition = useCallback(
    (position: number): PropertyAccount | null => {
      return properties.find((prop) => prop.position === position) || null;
    },
    [properties]
  );

  const getPlayerByAddress = useCallback(
    (address: Address): PlayerAccount | null => {
      return players.find((player) => player.wallet === address) || null;
    },
    [players]
  );

  const isCurrentPlayerTurn = useCallback((): boolean => {
    if (!gameState || !currentPlayerAddress) return false;
    return gameState.players[gameState.currentTurn] === currentPlayerAddress;
  }, [gameState, currentPlayerAddress]);

  const canPlayerAct = useCallback((): boolean => {
    if (!currentPlayerState || !isCurrentPlayerTurn()) return false;

    // Player can act if they haven't rolled dice yet or need to handle actions
    return (
      !currentPlayerState.hasRolledDice ||
      currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard ||
      currentPlayerState.canEndTurn
    );
  }, [currentPlayerState, isCurrentPlayerTurn]);

  // Game action handlers
  const rollDice = useCallback(
    async (diceRoll?: number[]): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.rollDiceIx({
          rpc: createSolanaRpc("http://127.0.0.1:8899"),
          gameAddress,
          player: currentPlayerSigner,
          diceRoll: diceRoll || null,
        });

        const signature = await buildAndSendTransaction(
          createSolanaRpc("http://127.0.0.1:8899"),
          [instruction],
          currentPlayerSigner
        );

        console.log("[rollDice] tx", signature);

        addGameLog({
          type: "dice",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(
            currentPlayerSigner.address
          )} rolled the dice`,
        });
      } catch (error) {
        console.error("Error rolling dice:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const buyProperty = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.buyPropertyIx({
          rpc: createSolanaRpc("http://127.0.0.1:8899"),
          gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          createSolanaRpc("http://127.0.0.1:8899"),
          [instruction],
          currentPlayerSigner
        );

        console.log("[buyProperty] tx", signature);

        const propertyData = getPropertyData(position);
        addGameLog({
          type: "purchase",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(currentPlayerSigner.address)} bought ${
            propertyData?.name || "property"
          } for $${propertyData?.price || 0}`,
          details: { position, price: propertyData?.price },
        });
      } catch (error) {
        console.error("Error buying property:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const skipProperty = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.declinePropertyIx({
          rpc: createSolanaRpc("http://127.0.0.1:8899"),
          gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          createSolanaRpc("http://127.0.0.1:8899"),
          [instruction],
          currentPlayerSigner
        );

        console.log("[skipProperty] tx", signature);

        const propertyData = getPropertyData(position);
        addGameLog({
          type: "skip",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(currentPlayerSigner.address)} skipped ${
            propertyData?.name || "property"
          }`,
          details: { position },
        });
      } catch (error) {
        console.error("Error skipping property:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const payRent = useCallback(
    async (position: number, owner: Address): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        const instruction = await sdk.payRentIx({
          rpc,
          gameAddress: gameAddress,
          player: currentPlayerSigner,
          position: position,
          propertyOwner: owner,
        });

        const signature = await buildAndSendTransaction(
          rpc,
          [instruction],
          currentPlayerSigner
        );

        console.log("[payRent] tx", signature);

        const propertyData = getPropertyData(position);
        addGameLog({
          type: "rent",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(
            currentPlayerSigner.address
          )} paid rent to ${getPlayerName(owner)} for ${
            propertyData?.name || "property"
          }`,
          details: { position, owner, signature },
        });

        console.log("Rent paid:", signature);
      } catch (error) {
        console.error("Error paying rent:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const endTurn = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.endTurnIx({
        rpc,
        gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("[endTurn] tx", signature);

      addGameLog({
        type: "turn",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} ended their turn`,
      });
    } catch (error) {
      console.error("Error ending turn:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  const drawChanceCard = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.drawChanceCardIx({
        rpc,
        gameAddress: gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("[drawChanceCard] tx", signature);

      addGameLog({
        type: "card",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} drew a Chance card`,
        details: { cardType: "chance", signature },
      });

      console.log("Chance card drawn:", signature);
    } catch (error) {
      console.error("Error drawing chance card:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  const drawCommunityChestCard = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.drawCommunityChestCardIx({
        rpc,
        gameAddress: gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("[drawCommunityChestCard] tx", signature);

      addGameLog({
        type: "card",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} drew a Community Chest card`,
        details: { cardType: "community-chest", signature },
      });

      console.log("Community Chest card drawn:", signature);
    } catch (error) {
      console.error("Error drawing community chest card:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  const payJailFine = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      // TODO: Implement payJailFine instruction call
      // const instruction = await sdk.payJailFineIx({
      //   rpc: createSolanaRpc("http://127.0.0.1:8899"),
      //   gameAddress,
      //   player: currentPlayerSigner,
      // });
      //
      // const signature = await buildAndSendTransaction(
      //   createSolanaRpc("http://127.0.0.1:8899"),
      //   [instruction],
      //   currentPlayerSigner
      // );

      addGameLog({
        type: "jail",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} paid jail fine and was released`,
      });

      console.log("TODO: Implement payJailFine");
    } catch (error) {
      console.error("Error paying jail fine:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  const buildHouse = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.buildHouseIx({
          rpc: createSolanaRpc("http://127.0.0.1:8899"),
          gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          createSolanaRpc("http://127.0.0.1:8899"),
          [instruction],
          currentPlayerSigner
        );

        console.log("[buildHouse] tx", signature);

        const propertyData = getPropertyData(position);
        addGameLog({
          type: "building",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(
            currentPlayerSigner.address
          )} built a house on ${propertyData?.name || "property"}`,
          details: { position, buildingType: "house" },
        });
      } catch (error) {
        console.error("Error building house:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const buildHotel = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !currentPlayerSigner) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.buildHotelIx({
          rpc: createSolanaRpc("http://127.0.0.1:8899"),
          gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          createSolanaRpc("http://127.0.0.1:8899"),
          [instruction],
          currentPlayerSigner
        );

        console.log("[buildHotel] tx", signature);

        const propertyData = getPropertyData(position);
        addGameLog({
          type: "building",
          playerId: currentPlayerSigner.address,
          message: `${getPlayerName(
            currentPlayerSigner.address
          )} built a hotel on ${propertyData?.name || "property"}`,
          details: { position, buildingType: "hotel" },
        });
      } catch (error) {
        console.error("Error building hotel:", error);
        throw error;
      }
    },
    [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]
  );

  const payMevTax = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.payMevTaxIx({
        rpc,
        gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("[payMevTax] tx", signature);

      addGameLog({
        type: "move",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} paid MEV tax of $${MEV_TAX_AMOUNT}`,
        details: { taxType: "mev", amount: MEV_TAX_AMOUNT, signature },
      });
    } catch (error) {
      console.error("Error paying MEV tax:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  const payPriorityFeeTax = useCallback(async (): Promise<void> => {
    if (!gameAddress || !currentPlayerSigner) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.payPriorityFeeTaxIx({
        rpc,
        gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("[payPriorityFeeTax] tx", signature);

      addGameLog({
        type: "move",
        playerId: currentPlayerSigner.address,
        message: `${getPlayerName(
          currentPlayerSigner.address
        )} paid Priority Fee tax of $${PRIORITY_FEE_TAX_AMOUNT}`,
        details: {
          taxType: "priority_fee",
          amount: PRIORITY_FEE_TAX_AMOUNT,
          signature,
        },
      });
    } catch (error) {
      console.error("Error paying Priority Fee tax:", error);
      throw error;
    }
  }, [gameAddress, currentPlayerSigner, addGameLog, getPlayerName]);

  useEffect(() => {
    async function handleAction(
      gameAddress: Address,
      player: PlayerAccount,
      currentPlayerSigner: KeyPairSigner<string>
    ) {
      console.log("Auto-handling player action for player:", player.wallet);

      // Only handle actions if it's the current player's turn
      if (!isCurrentPlayerTurn()) {
        console.log("Not current player's turn, skipping auto-actions");
        return;
      }

      // Priority 1: Handle bankruptcy check first (most critical)
      if (player.needsBankruptcyCheck) {
        console.log("Player needs bankruptcy check");
        // TODO: Implement bankruptcy handling
        addGameLog({
          type: "bankruptcy",
          playerId: player.wallet,
          message: `${getPlayerName(player.wallet)} is checking for bankruptcy`,
        });
        return;
      }

      // Priority 2: Handle jail-related actions
      if (player.inJail && player.jailTurns > 0) {
        console.log("Player is in jail");
        // Don't auto-handle jail - let player choose to pay fine or roll dice
        // This is handled by the ActionPanel component
        return;
      }

      // Priority 3: Handle dice rolling (if player hasn't rolled yet)
      if (!player.hasRolledDice && !player.inJail) {
        console.log("Player needs to roll dice");
        // Don't auto-roll - let player click the dice button
        // This is handled by the ActionPanel component
        return;
      }

      // Priority 4: Handle property actions (after landing on a property)
      if (
        player.needsPropertyAction &&
        isSome(player.pendingPropertyPosition)
      ) {
        const pendingPropertyPosition = player.pendingPropertyPosition.value;

        const property = properties.find(
          (prop) => prop.position === pendingPropertyPosition
        );

        if (!property) {
          console.error(
            "Property not found at position:",
            pendingPropertyPosition
          );
          return;
        }

        // If property is owned by another player, auto-pay rent
        if (isSome(property.owner) && property.owner.value !== player.wallet) {
          console.log("Auto-paying rent to property owner");
          try {
            await payRent(pendingPropertyPosition, property.owner.value);
          } catch (error) {
            console.error("Error auto-paying rent:", error);
          }
          return;
        }

        // If property is unowned, show buy dialog
        if (!isSome(property.owner)) {
          console.log("Showing buy property dialog");
          setSelectedProperty(pendingPropertyPosition);
          setIsPropertyDialogOpen(true);
          return;
        }

        // If property is owned by current player, check for building opportunities
        if (isSome(property.owner) && property.owner.value === player.wallet) {
          console.log(
            "Player owns this property - checking for building opportunities"
          );
          // TODO: Check if player has monopoly and can build
          // For now, just clear the pending action
          return;
        }
      }

      // Priority 5: Handle special space actions
      const position = player.position;

      if (position === MEV_TAX_POSITION) {
        console.log("Player landed on MEV Tax space");
        try {
          await payMevTax();
        } catch (error) {
          console.error("Failed to pay MEV tax:", error);
        }
        return;
      }

      if (position === PRIORITY_FEE_TAX_POSITION) {
        console.log("Player landed on Priority Fee Tax space");
        try {
          await payPriorityFeeTax();
        } catch (error) {
          console.error("Failed to pay Priority Fee tax:", error);
        }
        return;
      }

      // if (
      //   player.needsSpecialSpaceAction &&
      //   isSome(player.pendingSpecialSpacePosition)
      // ) {
      //   const specialPosition = player.pendingSpecialSpacePosition.value;
      //   console.log(
      //     "Player needs special space action at position:",
      //     specialPosition
      //   );

      //   // Handle specific special spaces
      //   if (specialPosition === MEV_TAX_POSITION) {
      //     console.log("Player landed on MEV Tax space");
      //     try {
      //       await payMevTax();
      //     } catch (error) {
      //       console.error("Failed to pay MEV tax:", error);
      //       // addGameLog({
      //       //   type: "move",
      //       //   playerId: player.wallet,
      //       //   message: `${getPlayerName(player.wallet)} failed to pay MEV tax`,
      //       //   details: { position: specialPosition, error: error.message },
      //       // });
      //     }
      //     return;
      //   }

      //   if (specialPosition === PRIORITY_FEE_TAX_POSITION) {
      //     console.log("Player landed on Priority Fee Tax space");
      //     try {
      //       await payPriorityFeeTax();
      //     } catch (error) {
      //       console.error("Failed to pay Priority Fee tax:", error);
      //       // addGameLog({
      //       //   type: "move",
      //       //   playerId: player.wallet,
      //       //   message: `${getPlayerName(player.wallet)} failed to pay Priority Fee tax`,
      //       //   details: { position: specialPosition, error: error.message },
      //       // });
      //     }
      //     return;
      //   }

      //   // For other special spaces (FREE_PARKING, etc.)
      //   addGameLog({
      //     type: "move",
      //     playerId: player.wallet,
      //     message: `${getPlayerName(player.wallet)} landed on a special space`,
      //     details: { position: specialPosition },
      //   });
      //   return;
      // }

      // Priority 6: Handle card drawing
      if (player.needsChanceCard) {
        setTimeout(() => {
          console.log("Player needs to draw Chance card");
          setCardDrawType("chance");
          setIsCardDrawModalOpen(true);
        }, 300);
        return;
      }

      if (player.needsCommunityChestCard) {
        console.log("Player needs to draw Community Chest card");
        setTimeout(() => {
          setCardDrawType("community-chest");
          setIsCardDrawModalOpen(true);
        }, 300);
        return;
      }

      // Priority 7: Check if player can end turn
      if (player.canEndTurn) {
        console.log("Player can end turn");
        // Don't auto-end turn - let player click the end turn button
        // This gives them time to review their situation and make decisions
        return;
      }

      // Priority 8: Handle doubles (if player rolled doubles and can roll again)
      if (
        player.doublesCount > 0 &&
        player.doublesCount < 3 &&
        player.hasRolledDice
      ) {
        console.log("Player rolled doubles and can roll again");
        // Reset hasRolledDice flag so they can roll again
        // This should be handled by the smart contract, but we can show UI feedback
        addGameLog({
          type: "dice",
          playerId: player.wallet,
          message: `${getPlayerName(
            player.wallet
          )} rolled doubles and gets another turn!`,
          details: { doublesCount: player.doublesCount },
        });
        return;
      }

      // If none of the above conditions are met, log the current state
      console.log("No auto-actions needed. Player state:", {
        hasRolledDice: player.hasRolledDice,
        needsPropertyAction: player.needsPropertyAction,
        needsChanceCard: player.needsChanceCard,
        needsCommunityChestCard: player.needsCommunityChestCard,
        needsSpecialSpaceAction: player.needsSpecialSpaceAction,
        needsBankruptcyCheck: player.needsBankruptcyCheck,
        canEndTurn: player.canEndTurn,
        inJail: player.inJail,
        doublesCount: player.doublesCount,
      });
    }

    // Only trigger handleAction if we have all required data and it's the current player's turn
    if (
      gameAddress &&
      currentPlayerState &&
      currentPlayerSigner &&
      isCurrentPlayerTurn()
    ) {
      handleAction(gameAddress, currentPlayerState, currentPlayerSigner);
    }
  }, [
    currentPlayerState,
    gameAddress,
    currentPlayerSigner,
    properties,
    payRent,
    isCurrentPlayerTurn,
    addGameLog,
    getPlayerName,
  ]);

  useEffect(() => {
    async function getCurrentPlayer(address: Address) {
      const playerAKp = await fakePlayerA();
      const playerAPk = await getAddressFromPublicKey(playerAKp.publicKey);
      const playerBKp = await fakePlayerB();
      const playerBPk = await getAddressFromPublicKey(playerBKp.publicKey);

      if (playerAPk === address) {
        setCurrentPlayerSigner(await createSignerFromKeyPair(playerAKp));
      }
      if (playerBPk === address) {
        setCurrentPlayerSigner(await createSignerFromKeyPair(playerBKp));
      }
    }

    if (currentPlayerAddress) {
      getCurrentPlayer(currentPlayerAddress);
    }
  }, [currentPlayerAddress]);

  // events
  const clearCardDrawEvents = useCallback(() => {
    setCardDrawEvents([]);
    setLatestCardDraw(null);
  }, []);

  const acknowledgeCardDraw = useCallback(() => {
    setLatestCardDraw(null);
  }, []);

  const value: GameContextType = {
    // Game identification
    gameAddress,
    setGameAddress,

    // Current player management
    currentPlayerAddress,
    currentPlayerState,
    currentPlayerSigner,

    // Game data
    gameState: gameState || null,
    players: players || [],
    properties: properties || [],
    gameLoading,
    gameError,
    refetch,

    // Game actions
    rollDice,
    buyProperty,
    skipProperty,
    payRent,
    endTurn,
    drawChanceCard,
    drawCommunityChestCard,
    payJailFine,
    buildHouse,
    buildHotel,

    // UI state management
    selectedProperty,
    setSelectedProperty,
    isPropertyDialogOpen,
    setIsPropertyDialogOpen,
    isCardDrawModalOpen,
    setIsCardDrawModalOpen,
    cardDrawType,
    setCardDrawType,

    // Game logs
    gameLogs,
    addGameLog,
    clearGameLogs,

    // events
    cardDrawEvents,
    latestCardDraw,
    addCardDrawEvent,
    clearCardDrawEvents,
    acknowledgeCardDraw,

    // Utility functions
    getPropertyByPosition,
    getPlayerByAddress,
    isCurrentPlayerTurn,
    canPlayerAct,
    getPlayerName,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
