"use client";

import { useGameState } from "@/hooks/useGameState";
import { sdk } from "@/lib/sdk/sdk";
import { buildAndSendTransactionWithPrivy } from "@/lib/tx";
import { GameAccount, PlayerAccount, PropertyAccount, TradeData, TradeOffer } from "@/types/schema";
import { Address, address, TransactionSigner } from "@solana/kit";
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
import { getTypedSpaceData } from "@/lib/board-utils";
import { GameLogEntry } from "@/types/space-types";
import { formatAddress } from "@/lib/utils";
import { useGameLogs } from "@/hooks/useGameLogs";
import { useRpcContext } from "./rpc-provider";
import { useWallet } from "@/hooks/use-wallet";

interface GameContextType {
  gameAddress: Address | null;
  setGameAddress: (address: Address | null) => void;

  // Current player management
  currentPlayerAddress: string | null;
  currentPlayerState: PlayerAccount | null;
  signer: TransactionSigner | null;

  // Game data (from useGameState hook)
  gameState: GameAccount | null;
  players: PlayerAccount[];
  properties: PropertyAccount[];
  gameLoading: boolean;
  gameError: Error | null;
  refetch: () => Promise<void>;

  // Game actions
  startGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  closeGame: () => Promise<void>;
  joinGame: () => Promise<void>;
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
  payMevTax: () => Promise<void>;
  payPriorityFeeTax: () => Promise<void>;

  // Trade actions
  createTrade: (targetPlayer: string, initiatorOffer: TradeOffer, targetOffer: TradeOffer) => Promise<void>;
  acceptTrade: (tradeId: string) => Promise<void>;
  rejectTrade: (tradeId: string) => Promise<void>;
  cancelTrade: (tradeId: string) => Promise<void>;

  // UI state management
  selectedProperty: number | null;
  setSelectedProperty: (position: number | null) => void;
  isPropertyDialogOpen: boolean;
  setIsPropertyDialogOpen: (open: boolean) => void;
  isCardDrawModalOpen: boolean;
  setIsCardDrawModalOpen: (open: boolean) => void;
  cardDrawType: "chance" | "community-chest" | null;
  setCardDrawType: (type: "chance" | "community-chest" | null) => void;

  // Trade UI state
  isTradeDialogOpen: boolean;
  setIsTradeDialogOpen: (open: boolean) => void;
  activeTrades: TradeData[];
  setActiveTrades: (trades: TradeData[]) => void;

  // Game logs
  gameLogs: GameLogEntry[];

  // Utility functions
  getPropertyByPosition: (position: number) => PropertyAccount | null;
  getPlayerByAddress: (address: Address) => PlayerAccount | null;
  isCurrentPlayerTurn: () => boolean;
  canRollDice: () => boolean;
  canPlayerAct: () => boolean;

  // events
  cardDrawEvents: GameEvent[];
  latestCardDraw: GameEvent | null;
  addCardDrawEvent: (event: Omit<GameEvent, "id" | "timestamp">) => void;
  clearCardDrawEvents: () => void;
  acknowledgeCardDraw: () => void; // Mark the latest card as acknowledged

  // demo
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

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameAddress, setGameAddress] = useState<Address | null>(null);
  const { wallet } = useWallet();
  const signer =
    wallet?.address && wallet?.delegated
      ? ({ address: address(wallet.address) } as TransactionSigner)
      : null;

  // UI state
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isCardDrawModalOpen, setIsCardDrawModalOpen] = useState(false);
  const [cardDrawType, setCardDrawType] = useState<
    "chance" | "community-chest" | null
  >(null);

  // Trade UI state
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [activeTrades, setActiveTrades] = useState<TradeData[]>([]);

  const { gameLogs, addGameLog } = useGameLogs();

  // events
  const [cardDrawEvents, setCardDrawEvents] = useState<GameEvent[]>([]);
  const [latestCardDraw, setLatestCardDraw] = useState<GameEvent | null>(null);

  const [demoDices, setDemoDices] = useState<number[] | null>(null);

  const { rpc, erRpc } = useRpcContext();

  const addCardDrawEvent = useCallback(
    (newEvent: GameEvent) => {
      setCardDrawEvents((prev) => [...prev, newEvent].slice(-50)); // Keep last 50 events
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
    if (!gameState || !currentPlayerAddress || !wallet?.address) return false;
    return gameState.players[gameState.currentTurn] === wallet.address;
  }, [gameState, currentPlayerAddress, wallet]);

  const canRollDice = useCallback((): boolean => {
    if (!currentPlayerState || !isCurrentPlayerTurn()) return false;

    const hasPendingActions =
      currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard ||
      currentPlayerState.needsBankruptcyCheck ||
      currentPlayerState.needsSpecialSpaceAction;

    // Player can roll dice if they haven't rolled dice yet and are not in jail
    // FIXME Need test all cases
    return (
      (!currentPlayerState.hasRolledDice &&
        !currentPlayerState.inJail &&
        !hasPendingActions) ||
      (currentPlayerState.hasRolledDice &&
        currentPlayerState.lastDiceRoll[0] ===
          currentPlayerState.lastDiceRoll[1])
    );
  }, [currentPlayerState, isCurrentPlayerTurn]);

  const canPlayerAct = useCallback((): boolean => {
    if (!currentPlayerState || !isCurrentPlayerTurn()) return false;

    // Player can act if they haven't rolled dice yet or need to handle actions
    return (
      !currentPlayerState.hasRolledDice ||
      currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard
      // ||
      // currentPlayerState.canEndTurn
    );
  }, [currentPlayerState, isCurrentPlayerTurn]);

  // Game action handlers
  const startGame = useCallback(async (): Promise<void> => {
    if (!gameAddress || !gameState || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }
    if (gameState.players.length < 2) {
      throw new Error("Game must have at least 2 players");
    }

    try {
      const instruction = await sdk.startGameIx({
        gameAddress,
        players: gameState?.players.map(address) || [],
        authority: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        rpc,
        [instruction],
        wallet
      );

      console.log("[startGame] tx", signature);
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  }, [rpc, gameAddress, gameState, wallet, addGameLog]);

  const resetGame = useCallback(async (): Promise<void> => {
    if (!gameAddress || !gameState || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.resetGameIx({
        gameAddress,
        players: gameState?.players.map(address) || [],
        authority: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[resetGame] tx", signature);
    } catch (error) {
      console.error("Error resetting game:", error);
      throw error;
    }
  }, [erRpc, gameAddress, gameState, wallet]);

  const closeGame = useCallback(async (): Promise<void> => {
    if (!gameAddress || !gameState || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const [undelegateIx, closeIx] = await sdk.closeGameIx({
        gameAddress,
        players: gameState?.players.map(address) || [],
        authority: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [undelegateIx],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[undelegateIx] tx", signature);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const signature1 = await buildAndSendTransactionWithPrivy(
        rpc,
        [closeIx],
        wallet
      );

      console.log("[closeIx] tx", signature1);
    } catch (error) {
      console.error("Error closing game:", error);
      throw error;
    }
  }, [erRpc, gameAddress, gameState, wallet]);

  const joinGame = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const { instruction } = await sdk.joinGameIx({
        rpc,
        gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        rpc,
        [instruction],
        wallet
      );

      console.log("[joinGame] tx", signature);
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  }, [rpc, gameAddress, wallet]);

  const rollDice = useCallback(
    async (diceRoll?: number[]): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.rollDiceIx({
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          diceRoll: diceRoll || null,
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[rollDice] tx", signature);

        addGameLog({
          type: "dice",
          playerId: wallet.address,
          message: `${formatAddress(wallet.address)} rolled the dice`,
          details: {
            diceRoll: diceRoll as [number, number] | undefined,
            signature,
          },
        });
      } catch (error) {
        console.error("Error rolling dice:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const buyProperty = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const initPropertyInstruction = await sdk.initPropertyIx({
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position,
        });

        const signature1 = await buildAndSendTransactionWithPrivy(
          rpc,
          [initPropertyInstruction],
          wallet
        );

        const instruction = await sdk.buyPropertyIx({
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position,
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[buyProperty] tx", signature);

        const propertyData = getTypedSpaceData(position, "property");
        addGameLog({
          type: "purchase",
          playerId: wallet.address,
          message: `${formatAddress(wallet.address)} bought ${
            propertyData?.name || "N/A"
          }`,
          details: {
            position,
            propertyName: propertyData?.name || "N/A",
            price: propertyData?.price || 0,
            signature,
          },
        });
      } catch (error) {
        console.error("Error buying property:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const skipProperty = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.declinePropertyIx({
          rpc,
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position,
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[skipProperty] tx", signature);

        const propertyData = getTypedSpaceData(position, "property");
        addGameLog({
          type: "skip",
          playerId: wallet.address,
          message: `${formatAddress(wallet.address)} skipped ${
            propertyData?.name || "property"
          }`,
          details: { position },
        });
      } catch (error) {
        console.error("Error skipping property:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const payRent = useCallback(
    async (position: number, owner: string): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.payRentIx({
          rpc,
          gameAddress: gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position: position,
          propertyOwner: address(owner),
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[payRent] tx", signature);

        const propertyData = getTypedSpaceData(position, "property");

        addGameLog({
          type: "rent",
          playerId: wallet.address,
          message: `${formatAddress(
            wallet.address
          )} paid rent to ${formatAddress(owner)}`,
          details: {
            position,
            propertyName: propertyData?.name || "N/A",
            owner,
            signature,
          },
        });

        console.log("Rent paid:", signature);
      } catch (error) {
        console.error("Error paying rent:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const endTurn = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.endTurnIx({
        rpc,
        gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[endTurn] tx", signature);

      addGameLog({
        type: "turn",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} ended their turn`,
      });
    } catch (error) {
      console.error("Error ending turn:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const drawChanceCard = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.drawChanceCardIx({
        rpc: erRpc,
        gameAddress: gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[drawChanceCard] tx", signature);

      addGameLog({
        type: "card",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} drew a Chance card`,
        details: { cardType: "chance", signature },
      });

      console.log("Chance card drawn:", signature);
    } catch (error) {
      console.error("Error drawing chance card:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const drawCommunityChestCard = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.drawCommunityChestCardIx({
        rpc,
        gameAddress: gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[drawCommunityChestCard] tx", signature);

      addGameLog({
        type: "card",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} drew a Community Chest card`,
        details: { cardType: "community-chest", signature },
      });

      console.log("Community Chest card drawn:", signature);
    } catch (error) {
      console.error("Error drawing community chest card:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const payJailFine = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.payJailFineIx({
        rpc,
        gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      addGameLog({
        type: "jail",
        playerId: wallet.address,
        message: `${formatAddress(
          wallet.address
        )} paid jail fine and was released`,
      });

      console.log("[payJailFine] tx", signature);
    } catch (error) {
      console.error("Error paying jail fine:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const buildHouse = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.buildHouseIx({
          rpc,
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position,
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[buildHouse] tx", signature);

        const propertyData = getTypedSpaceData(position, "property");
        addGameLog({
          type: "building",
          playerId: wallet.address,
          message: `${formatAddress(wallet.address)} built a house on ${
            propertyData?.name || "property"
          }`,
          details: { position, buildingType: "house" },
        });
      } catch (error) {
        console.error("Error building house:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const buildHotel = useCallback(
    async (position: number): Promise<void> => {
      if (!gameAddress || !wallet?.address || !wallet.delegated) {
        throw new Error("Game address or player signer not available");
      }

      try {
        const instruction = await sdk.buildHotelIx({
          rpc,
          gameAddress,
          player: { address: address(wallet.address) } as TransactionSigner,
          position,
        });

        const signature = await buildAndSendTransactionWithPrivy(
          erRpc,
          [instruction],
          wallet,
          [],
          "confirmed",
          true
        );

        console.log("[buildHotel] tx", signature);

        const propertyData = getTypedSpaceData(position, "property");
        addGameLog({
          type: "building",
          playerId: wallet.address,
          message: `${formatAddress(wallet.address)} built a hotel on ${
            propertyData?.name || "property"
          }`,
          details: { position, buildingType: "hotel" },
        });
      } catch (error) {
        console.error("Error building hotel:", error);
        throw error;
      }
    },
    [gameAddress, wallet, addGameLog]
  );

  const payMevTax = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.payMevTaxIx({
        gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[payMevTax] tx", signature);

      // addGameLog({
      //   type: "move",
      //   playerId: wallet.address,
      //   message: `${formatAddress(
      //     wallet.address
      //   )} paid MEV tax of $${"MEV_TAX_AMOUNT"}`,
      //   details: { taxType: "mev", amount: 9999, signature },
      // });
    } catch (error) {
      console.error("Error paying MEV tax:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const payPriorityFeeTax = useCallback(async (): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      throw new Error("Game address or player signer not available");
    }

    try {
      const instruction = await sdk.payPriorityFeeTaxIx({
        rpc,
        gameAddress,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        erRpc,
        [instruction],
        wallet,
        [],
        "confirmed",
        true
      );

      console.log("[payPriorityFeeTax] tx", signature);

      addGameLog({
        type: "move",
        playerId: wallet.address,
        message: `${formatAddress(
          wallet.address
        )} paid Priority Fee tax of $${"PRIORITY_FEE_TAX_AMOUNT"}`,
        details: {
          taxType: "priority_fee",
          amount: 9999,
          signature,
        },
      });
    } catch (error) {
      console.error("Error paying Priority Fee tax:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  // Trade action handlers
  const createTrade = useCallback(async (
    targetPlayer: string,
    initiatorOffer: TradeOffer,
    targetOffer: TradeOffer
  ): Promise<void> => {
    if (!gameAddress || !wallet?.address || !wallet.delegated) {
      console.error("Missing required data for trade creation");
      return;
    }

    try {
      // For now, just simulate trade creation since we're not implementing actual SDK calls
      const newTrade: TradeData = {
        id: `trade_${Date.now()}`,
        gameAddress: gameAddress,
        initiator: wallet.address,
        target: targetPlayer,
        initiatorOffer,
        targetOffer,
        status: 0, // Pending
        type: 0, // Will be determined based on offers
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      setActiveTrades(prev => [...prev, newTrade]);

      addGameLog({
        type: "trade",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} created a trade with ${formatAddress(targetPlayer)}`,
        details: {
          tradeId: newTrade.id,
          action: "created",
        },
      });

      console.log("Trade created:", newTrade);
    } catch (error) {
      console.error("Error creating trade:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  const acceptTrade = useCallback(async (tradeId: string): Promise<void> => {
    if (!wallet?.address || !wallet.delegated) {
      console.error("Missing required data for trade acceptance");
      return;
    }

    try {
      setActiveTrades(prev => 
        prev.map(trade => 
          trade.id === tradeId 
            ? { ...trade, status: 1 } // Accepted
            : trade
        )
      );

      addGameLog({
        type: "trade",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} accepted a trade`,
        details: {
          tradeId,
          action: "accepted",
        },
      });

      console.log("Trade accepted:", tradeId);
    } catch (error) {
      console.error("Error accepting trade:", error);
      throw error;
    }
  }, [wallet, addGameLog]);

  const rejectTrade = useCallback(async (tradeId: string): Promise<void> => {
    if (!wallet?.address || !wallet.delegated) {
      console.error("Missing required data for trade rejection");
      return;
    }

    try {
      setActiveTrades(prev => 
        prev.map(trade => 
          trade.id === tradeId 
            ? { ...trade, status: 2 } // Rejected
            : trade
        )
      );

      addGameLog({
        type: "trade",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} rejected a trade`,
        details: {
          tradeId,
          action: "rejected",
        },
      });

      console.log("Trade rejected:", tradeId);
    } catch (error) {
      console.error("Error rejecting trade:", error);
      throw error;
    }
  }, [wallet, addGameLog]);

  const cancelTrade = useCallback(async (tradeId: string): Promise<void> => {
    if (!wallet?.address || !wallet.delegated) {
      console.error("Missing required data for trade cancellation");
      return;
    }

    try {
      setActiveTrades(prev => 
        prev.map(trade => 
          trade.id === tradeId 
            ? { ...trade, status: 3 } // Cancelled
            : trade
        )
      );

      addGameLog({
        type: "trade",
        playerId: wallet.address,
        message: `${formatAddress(wallet.address)} cancelled their trade offer`,
        details: {
          tradeId,
          action: "cancelled",
        },
      });

      console.log("Trade cancelled:", tradeId);
    } catch (error) {
      console.error("Error cancelling trade:", error);
      throw error;
    }
  }, [gameAddress, wallet, addGameLog]);

  useEffect(() => {
    async function handleAction(player: PlayerAccount) {
      console.log("Auto-handling player action for player:", player.wallet);

      // Priority 1: Handle bankruptcy check first (most critical)
      if (player.needsBankruptcyCheck) {
        console.log("Player needs bankruptcy check");
        // TODO: Implement bankruptcy handling
        addGameLog({
          type: "bankruptcy",
          playerId: player.wallet,
          message: `${formatAddress(player.wallet)} is checking for bankruptcy`,
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
      if (player.needsPropertyAction && player.pendingPropertyPosition) {
        const pendingPropertyPosition = player.pendingPropertyPosition;

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
        if (!!property.owner && property.owner !== player.wallet) {
          console.log("Auto-paying rent to property owner");
          try {
            await payRent(pendingPropertyPosition, property.owner);
          } catch (error) {
            console.error("Error auto-paying rent:", error);
          }
          return;
        }

        // If property is unowned, show buy dialog
        if (!!property.owner) {
          console.log("Showing buy property dialog");
          setSelectedProperty(pendingPropertyPosition);
          setIsPropertyDialogOpen(true);
          return;
        }

        // If property is owned by current player, check for building opportunities
        if (!!property.owner && property.owner === player.wallet) {
          console.log(
            "Player owns this property - checking for building opportunities"
          );
          // TODO: Check if player has monopoly and can build
          // For now, just clear the pending action
          return;
        }
      }

      // Priority 5: Handle special space actions
      // const position = player.position;

      // if (position === 0) {
      //   console.log("Player landed on MEV Tax space");
      //   try {
      //     await payMevTax();
      //   } catch (error) {
      //     console.error("Failed to pay MEV tax:", error);
      //   }
      //   return;
      // }

      // if (position === 0) {
      //   console.log("Player landed on Priority Fee Tax space");
      //   try {
      //     await payPriorityFeeTax();
      //   } catch (error) {
      //     console.error("Failed to pay Priority Fee tax:", error);
      //   }
      //   return;
      // }

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
      // if (player.canEndTurn) {
      //   console.log("Player can end turn");
      //   // Don't auto-end turn - let player click the end turn button
      //   // This gives them time to review their situation and make decisions
      //   return;
      // }

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
          message: `${formatAddress(
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
        // canEndTurn: player.canEndTurn,
        inJail: player.inJail,
        doublesCount: player.doublesCount,
      });
    }

    if (gameAddress && currentPlayerState && signer && isCurrentPlayerTurn()) {
      handleAction(currentPlayerState);
    }
  }, [
    currentPlayerState,
    gameAddress,
    signer,
    properties,
    payRent,
    isCurrentPlayerTurn,
    addGameLog,
  ]);

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
    signer,

    // Game data
    gameState: gameState || null,
    players: players || [],
    properties: properties || [],
    gameLoading,
    gameError,
    refetch,

    // Game actions
    startGame,
    resetGame,
    closeGame,
    joinGame,
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
    payMevTax,
    payPriorityFeeTax,

    // Trade actions
    createTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,

    // UI state management
    selectedProperty,
    setSelectedProperty,
    isPropertyDialogOpen,
    setIsPropertyDialogOpen,
    isCardDrawModalOpen,
    setIsCardDrawModalOpen,
    cardDrawType,
    setCardDrawType,

    // Trade UI state
    isTradeDialogOpen,
    setIsTradeDialogOpen,
    activeTrades,
    setActiveTrades,

    // Game logs
    gameLogs,
    // addGameLog,
    // clearGameLogs,

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
    canRollDice,
    canPlayerAct,
    // demo
    demoDices,
    setDemoDices,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
