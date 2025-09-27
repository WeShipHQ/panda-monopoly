"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Address } from "@solana/kit";
import { GameAccount, PlayerAccount, PropertyAccount } from "@/types/schema";
import { GameLogEntry } from "@/types/space-types";
import { formatAddress } from "@/lib/utils";
import { useGameLogs } from "@/hooks/useGameLogs";
import { useGameSimulation } from "@/hooks/useGameSimulation";
import { GameEvent } from "@/lib/sdk/types";
import { getTypedSpaceData } from "@/lib/board-utils";
import {
  MEV_TAX_POSITION,
  PRIORITY_FEE_TAX_POSITION,
  MEV_TAX_AMOUNT,
  PRIORITY_FEE_TAX_AMOUNT,
  CHANCE_POSITIONS,
  COMMUNITY_CHEST_POSITIONS,
} from "@/lib/constants";

interface GameContextType {
  // Game identification
  gameAddress: Address | null;
  setGameAddress: (address: Address | null) => void;

  // Current player management
  currentPlayerAddress: Address | null;
  currentPlayerState: PlayerAccount | null;
  currentPlayerSigner: any | null;

  // Game data
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

  // Utility functions
  getPropertyByPosition: (position: number) => PropertyAccount | null;
  getPlayerByAddress: (address: Address) => PlayerAccount | null;
  isCurrentPlayerTurn: () => boolean;
  canRollDice: () => boolean;
  canPlayerAct: () => boolean;

  // Events
  cardDrawEvents: GameEvent[];
  latestCardDraw: GameEvent | null;
  addCardDrawEvent: (event: GameEvent) => void;
  clearCardDrawEvents: () => void;
  acknowledgeCardDraw: () => void;

  // Demo
  demoDices: number[] | null;
  setDemoDices: (dices: number[] | null) => void;
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

export const GameProviderSimulation: React.FC<GameProviderProps> = ({
  children,
}) => {
  // Core state
  const [gameAddress, setGameAddress] = useState<Address | null>(
    "simulation-game-address" as Address
  );
  const [currentPlayerSigner, setCurrentPlayerSigner] = useState<any | null>(
    null
  );

  // UI state
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isCardDrawModalOpen, setIsCardDrawModalOpen] = useState(false);
  const [cardDrawType, setCardDrawType] = useState<
    "chance" | "community-chest" | null
  >(null);

  // Game logs
  const { gameLogs, addGameLog } = useGameLogs();

  // Events
  const [cardDrawEvents, setCardDrawEvents] = useState<GameEvent[]>([]);
  const [latestCardDraw, setLatestCardDraw] = useState<GameEvent | null>(null);
  const [demoDices, setDemoDices] = useState<number[] | null>(null);

  // Game simulation
  const {
    gameState,
    players,
    properties,
    gameLogs: simulationLogs,
    rollDice: simulationRollDice,
    buyProperty: simulationBuyProperty,
    declineProperty: simulationDeclineProperty,
    payRent: simulationPayRent,
    endTurn: simulationEndTurn,
    drawChanceCard: simulationDrawChanceCard,
    drawCommunityChestCard: simulationDrawCommunityChestCard,
    payJailFine: simulationPayJailFine,
    buildHouse: simulationBuildHouse,
    buildHotel: simulationBuildHotel,
    useGetOutOfJailCard: simulationUseGetOutOfJailCard,
    resetGame,
  } = useGameSimulation();

  const addCardDrawEvent = useCallback(
    (newEvent: GameEvent) => {
      setCardDrawEvents((prev) => [...prev, newEvent].slice(-50));
      setLatestCardDraw(newEvent);

      addGameLog({
        type: "card",
        playerId: newEvent.data.player,
        message: `${formatAddress(newEvent.data.player)} drew a card`,
        details: {
          cardType:
            newEvent.type === "ChanceCardDrawn" ? "chance" : "community-chest",
          cardIndex: newEvent.data.cardIndex,
          effectType: newEvent.data.effectType,
          amount: newEvent.data.amount,
        },
      });
    },
    [addGameLog]
  );

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

  const canRollDice = useCallback((): boolean => {
    if (!currentPlayerState || !isCurrentPlayerTurn()) return false;

    const hasPendingActions =
      currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard ||
      currentPlayerState.needsBankruptcyCheck ||
      currentPlayerState.needsSpecialSpaceAction;

    return (
      !currentPlayerState.hasRolledDice &&
      !currentPlayerState.inJail &&
      !hasPendingActions
    );
  }, [currentPlayerState, isCurrentPlayerTurn]);

  const canPlayerAct = useCallback((): boolean => {
    if (!currentPlayerState || !isCurrentPlayerTurn()) return false;

    return (
      !currentPlayerState.hasRolledDice ||
      currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard
    );
  }, [currentPlayerState, isCurrentPlayerTurn]);

  // Game action handlers with simulation integration
  const rollDice = useCallback(
    async (diceRoll?: number[]): Promise<void> => {
      try {
        const result = await simulationRollDice(diceRoll);

        addGameLog({
          type: "dice",
          playerId: result.playerId,
          message: `${formatAddress(result.playerId)} rolled ${
            result.dice[0]
          } and ${result.dice[1]}`,
          details: {
            diceRoll: result.dice as [number, number],
            newPosition: result.newPosition,
            passedGo: result.passedGo,
          },
        });

        // Handle special spaces automatically
        if (result.newPosition === MEV_TAX_POSITION) {
          addGameLog({
            type: "move",
            playerId: result.playerId,
            message: `${formatAddress(result.playerId)} landed on MEV Tax`,
            details: { position: result.newPosition },
          });
        } else if (result.newPosition === PRIORITY_FEE_TAX_POSITION) {
          addGameLog({
            type: "move",
            playerId: result.playerId,
            message: `${formatAddress(
              result.playerId
            )} landed on Priority Fee Tax`,
            details: { position: result.newPosition },
          });
        } else if (CHANCE_POSITIONS.includes(result.newPosition)) {
          setTimeout(() => {
            setCardDrawType("chance");
            setIsCardDrawModalOpen(true);
          }, 500);
        } else if (COMMUNITY_CHEST_POSITIONS.includes(result.newPosition)) {
          setTimeout(() => {
            setCardDrawType("community-chest");
            setIsCardDrawModalOpen(true);
          }, 500);
        }

        if (result.passedGo) {
          addGameLog({
            type: "move",
            playerId: result.playerId,
            message: `${formatAddress(
              result.playerId
            )} passed GO and collected $200`,
            details: { passedGo: true },
          });
        }
      } catch (error) {
        console.error("Error rolling dice:", error);
        throw error;
      }
    },
    [simulationRollDice, addGameLog]
  );

  const buyProperty = useCallback(
    async (position: number): Promise<void> => {
      try {
        const result = await simulationBuyProperty(position);
        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "purchase",
          playerId: result.playerId,
          message: `${formatAddress(result.playerId)} bought ${
            propertyData?.name || "property"
          }`,
          details: {
            position,
            propertyName: propertyData?.name || "N/A",
            price: result.price,
          },
        });

        setIsPropertyDialogOpen(false);
        setSelectedProperty(null);
      } catch (error) {
        console.error("Error buying property:", error);
        throw error;
      }
    },
    [simulationBuyProperty, addGameLog]
  );

  const skipProperty = useCallback(
    async (position: number): Promise<void> => {
      try {
        const result = await simulationDeclineProperty(position);
        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "skip",
          playerId: result.playerId,
          message: `${formatAddress(result.playerId)} declined to buy ${
            propertyData?.name || "property"
          }`,
          details: { position },
        });

        setIsPropertyDialogOpen(false);
        setSelectedProperty(null);
      } catch (error) {
        console.error("Error skipping property:", error);
        throw error;
      }
    },
    [simulationDeclineProperty, addGameLog]
  );

  const payRent = useCallback(
    async (position: number, owner: Address): Promise<void> => {
      try {
        const result = await simulationPayRent(position, owner);
        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "rent",
          playerId: result.payerId,
          message: `${formatAddress(result.payerId)} paid $${
            result.amount
          } rent to ${formatAddress(result.ownerId)}`,
          details: {
            position,
            propertyName: propertyData?.name || "N/A",
            owner: result.ownerId,
            amount: result.amount,
          },
        });
      } catch (error) {
        console.error("Error paying rent:", error);
        throw error;
      }
    },
    [simulationPayRent, addGameLog]
  );

  const endTurn = useCallback(async (): Promise<void> => {
    try {
      const result = await simulationEndTurn();

      addGameLog({
        type: "turn",
        playerId: result.previousPlayerId,
        message: `${formatAddress(result.previousPlayerId)} ended their turn`,
      });

      addGameLog({
        type: "turn",
        playerId: result.nextPlayerId,
        message: `It's now ${formatAddress(result.nextPlayerId)}'s turn`,
      });
    } catch (error) {
      console.error("Error ending turn:", error);
      throw error;
    }
  }, [simulationEndTurn, addGameLog]);

  const drawChanceCard = useCallback(async (): Promise<void> => {
    try {
      const result = await simulationDrawChanceCard();

      addGameLog({
        type: "card",
        playerId: result.playerId,
        message: `${formatAddress(result.playerId)} drew: "${
          result.card.title
        }"`,
        details: {
          cardType: "chance",
          cardTitle: result.card.title,
          cardDescription: result.card.description,
          effect: result.effect,
        },
      });

      setIsCardDrawModalOpen(false);
      setCardDrawType(null);
    } catch (error) {
      console.error("Error drawing chance card:", error);
      throw error;
    }
  }, [simulationDrawChanceCard, addGameLog]);

  const drawCommunityChestCard = useCallback(async (): Promise<void> => {
    try {
      const result = await simulationDrawCommunityChestCard();

      addGameLog({
        type: "card",
        playerId: result.playerId,
        message: `${formatAddress(result.playerId)} drew: "${
          result.card.title
        }"`,
        details: {
          cardType: "community-chest",
          cardTitle: result.card.title,
          cardDescription: result.card.description,
          effect: result.effect,
        },
      });

      setIsCardDrawModalOpen(false);
      setCardDrawType(null);
    } catch (error) {
      console.error("Error drawing community chest card:", error);
      throw error;
    }
  }, [simulationDrawCommunityChestCard, addGameLog]);

  const payJailFine = useCallback(async (): Promise<void> => {
    try {
      const result = await simulationPayJailFine();

      addGameLog({
        type: "jail",
        playerId: result.playerId,
        message: `${formatAddress(
          result.playerId
        )} paid $50 jail fine and was released`,
        details: { amount: 50 },
      });
    } catch (error) {
      console.error("Error paying jail fine:", error);
      throw error;
    }
  }, [simulationPayJailFine, addGameLog]);

  const buildHouse = useCallback(
    async (position: number): Promise<void> => {
      try {
        const result = await simulationBuildHouse(position);
        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "building",
          playerId: result.playerId,
          message: `${formatAddress(result.playerId)} built a house on ${
            propertyData?.name || "property"
          }`,
          details: {
            position,
            buildingType: "house",
            cost: result.cost,
            housesNow: result.housesNow,
          },
        });
      } catch (error) {
        console.error("Error building house:", error);
        throw error;
      }
    },
    [simulationBuildHouse, addGameLog]
  );

  const buildHotel = useCallback(
    async (position: number): Promise<void> => {
      try {
        const result = await simulationBuildHotel(position);
        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "building",
          playerId: result.playerId,
          message: `${formatAddress(result.playerId)} built a hotel on ${
            propertyData?.name || "property"
          }`,
          details: {
            position,
            buildingType: "hotel",
            cost: result.cost,
          },
        });
      } catch (error) {
        console.error("Error building hotel:", error);
        throw error;
      }
    },
    [simulationBuildHotel, addGameLog]
  );

  // Auto-handle game actions
  useEffect(() => {
    async function handleAction(player: PlayerAccount) {
      if (!isCurrentPlayerTurn()) return;

      // Handle property actions
      if (
        player.needsPropertyAction &&
        player.pendingPropertyPosition !== null
      ) {
        const position = player.pendingPropertyPosition;
        const property = getPropertyByPosition(position);

        if (!property) return;

        // If property is owned by another player, auto-pay rent
        if (property.owner && property.owner !== player.wallet) {
          try {
            await payRent(position, property.owner);
          } catch (error) {
            console.error("Error auto-paying rent:", error);
          }
          return;
        }

        // If property is unowned, show buy dialog
        if (!property.owner) {
          setSelectedProperty(position);
          setIsPropertyDialogOpen(true);
          return;
        }
      }

      // Handle special space actions
      if (
        player.needsSpecialSpaceAction &&
        player.pendingSpecialSpacePosition !== null
      ) {
        const position = player.pendingSpecialSpacePosition;

        if (position === MEV_TAX_POSITION) {
          // Auto-pay MEV tax
          addGameLog({
            type: "move",
            playerId: player.wallet,
            message: `${formatAddress(
              player.wallet
            )} paid MEV tax of $${MEV_TAX_AMOUNT}`,
            details: { taxType: "mev", amount: MEV_TAX_AMOUNT },
          });
        } else if (position === PRIORITY_FEE_TAX_POSITION) {
          // Auto-pay Priority Fee tax
          addGameLog({
            type: "move",
            playerId: player.wallet,
            message: `${formatAddress(
              player.wallet
            )} paid Priority Fee tax of $${PRIORITY_FEE_TAX_AMOUNT}`,
            details: {
              taxType: "priority_fee",
              amount: PRIORITY_FEE_TAX_AMOUNT,
            },
          });
        }
      }

      // Handle card drawing
      if (player.needsChanceCard) {
        setTimeout(() => {
          setCardDrawType("chance");
          setIsCardDrawModalOpen(true);
        }, 300);
        return;
      }

      if (player.needsCommunityChestCard) {
        setTimeout(() => {
          setCardDrawType("community-chest");
          setIsCardDrawModalOpen(true);
        }, 300);
        return;
      }
    }

    if (currentPlayerState && gameAddress) {
      handleAction(currentPlayerState);
    }
  }, [
    currentPlayerState,
    gameAddress,
    isCurrentPlayerTurn,
    getPropertyByPosition,
    payRent,
    addGameLog,
  ]);

  // Mock refetch function
  const refetch = useCallback(async (): Promise<void> => {
    // In simulation mode, this is a no-op since state is managed locally
    console.log("Refetch called in simulation mode");
  }, []);

  // Events
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
    gameLoading: false,
    gameError: null,
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

    // Events
    cardDrawEvents,
    latestCardDraw,
    addCardDrawEvent,
    clearCardDrawEvents,
    acknowledgeCardDraw,

    // Utility functions
    getPropertyByPosition,
    getPlayerByAddress,
    isCurrentPlayerTurn,
    canRollDice,
    canPlayerAct,

    // Demo
    demoDices,
    setDemoDices,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
