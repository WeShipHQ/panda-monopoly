import { useGameState } from "@/hooks/useGameStateV2";
import { PlayerState } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { fakePlayerA, fakePlayerB } from "@/lib/sdk/utils";
import { buildAndSendTransaction } from "@/lib/tx";
import { GameAccount, PlayerAccount, PropertyAccount } from "@/types/types";
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

interface GameContextType {
  gameAddress: Address | null;
  currentPlayerAddress: Address | null;
  currentPlayerState: PlayerState | null;
  currentPlayerSigner: KeyPairSigner<string> | null;
  setGameAddress: (address: Address | null) => void;
  // data
  gameState?: GameAccount | null;
  gameLoading: boolean;
  gameError: Error | null;
  players: PlayerAccount[];
  properties: PropertyAccount[];
  refetch: () => Promise<void>;
  // ui
  isPropertyOpen: boolean;
  setIsPropertyOpen: (isOpen: boolean) => void;
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
  const [currentPlayerSigner, setCurrentPlayerSigner] =
    useState<KeyPairSigner<string> | null>(null);

  // ui state
  const [isPropertyOpen, setIsPropertyOpen] = useState(false);

  const {
    players,
    properties,
    gameData: gameState,
    isLoading: gameLoading,
    error: gameError,
    refetch,
  } = useGameState(gameAddress);

  const currentPlayerAddress = useMemo(() => {
    return gameState?.players?.[gameState?.currentTurn] || null;
  }, [gameState]);

  const currentPlayerState = useMemo(() => {
    const player = players?.find(
      (player) => player.wallet === currentPlayerAddress
    );
    if (!player) {
      return null;
    }
    return player;
  }, [currentPlayerAddress, players]);

  // game action
  const handlePayRent = useCallback(
    async (
      gameAddress: Address,
      currentPlayerSigner: KeyPairSigner<string>,
      position: number,
      propertyOwner: Address
    ) => {
      console.log("ZZZ handle pay", position);
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        const instruction = await sdk.payRentIx({
          rpc,
          gameAddress: gameAddress,
          player: currentPlayerSigner,
          position: position,
          propertyOwner: propertyOwner,
        });

        const signature = await buildAndSendTransaction(
          rpc,
          [instruction],
          currentPlayerSigner
        );

        console.log("ZZZ Pay rent", signature);
        return;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    []
  );

  const handleOpenChess = useCallback(
    async (
      gameAddress: Address,
      currentPlayerSigner: KeyPairSigner<string>
    ) => {
      console.log("ZZZ handleOpenChess");
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

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

        console.log("ZZZ drawCommunityChestCardIx", signature);
        return;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    []
  );

  const handleDrawChanceCard = useCallback(
    async (
      gameAddress: Address,
      currentPlayerSigner: KeyPairSigner<string>
    ) => {
      console.log("ZZZ handleDrawChanceCard");
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

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

        console.log("ZZZ drawChanceCardIx", signature);
        return;
      } catch (error) {
        console.error(error);
        return;
      }
    },
    []
  );

  useEffect(() => {
    async function handleAction(
      gameAddress: Address,
      player: PlayerAccount,
      currentPlayerSigner: KeyPairSigner<string>
    ) {
      console.log("ZZZZ handle action");

      if (player.needsPropertyAction) {
        const pendingPropertyPosition = isSome(player.pendingPropertyPosition)
          ? player.pendingPropertyPosition.value
          : -1;
        if (pendingPropertyPosition < 0) {
          return;
        }

        const property = properties.find(
          (property) => property.position === pendingPropertyPosition
        );
        if (
          property &&
          isSome(property.owner) &&
          property.owner.value !== player.wallet
        ) {
          handlePayRent(
            gameAddress,
            currentPlayerSigner,
            pendingPropertyPosition,
            property.owner.value
          );
          return;
        } else {
          console.log("ZZZZ WHYWHYWHWYWHWYWHWHWYWHWYWHWY");
          setIsPropertyOpen(true);
          return;
        }
      }

      if (player.needsCommunityChestCard) {
        await handleOpenChess(gameAddress, currentPlayerSigner);
        return;
      }

      if (player.needsChanceCard) {
        await handleDrawChanceCard(gameAddress, currentPlayerSigner);
        return;
      }
    }

    if (gameAddress && currentPlayerState && currentPlayerSigner) {
      handleAction(gameAddress, currentPlayerState, currentPlayerSigner);
    }
  }, [
    currentPlayerState,
    gameAddress,
    currentPlayerSigner,
    players,
    properties,
    handlePayRent,
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

  const value: GameContextType = {
    gameAddress,
    currentPlayerAddress,
    currentPlayerSigner,
    currentPlayerState,
    setGameAddress,
    gameState,
    gameLoading,
    gameError,
    players: players || [],
    properties: properties || [],
    refetch,
    // ui
    isPropertyOpen,
    setIsPropertyOpen,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
