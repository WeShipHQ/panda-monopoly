"use client";

import { useEffect, useState } from "react";
import GameBoard from "@/components/game-board";
import ActionPanel from "@/components/action-panel";
import GameLog from "@/components/game-log";
import { LeftSidebar } from "@/components/left-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/components/game-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useGamePlayers } from "@/hooks/useGame";
import { address, createSignerFromKeyPair, createSolanaRpc } from "@solana/kit";
import { fakePlayerA, fakePlayerB } from "@/lib/sdk/utils";
import { sdk } from "@/lib/sdk/sdk";
import { buildAndSendTransaction } from "@/lib/tx";
import { GameStatus } from "@/lib/sdk/generated";

export default function Home() {
  const { gameState } = useGameContext();
  const [boardRotation, setBoardRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");

  const rotateBoardClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  if (!gameState || gameState.gameStatus !== GameStatus.InProgress) {
    return <NewGame />;
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <div className="hone-container grid grid-cols-[repeat(2,calc(50%-.5rem))] lg:grid-cols-[auto_1fr] xl:grid-cols-[minmax(15rem,1fr)_auto_minmax(15rem,1fr)] w-full xl:h-screen overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />
        {/* <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1">
            <LeftSidebar />
          </div>
        </div> */}

        {/* Main Game Board */}
        <div className="w-full center-container">
          <GameBoard
            boardRotation={boardRotation}
            className="bg-gradient-to-br from-green-100 to-green-200"
          />
        </div>

        {/* Right Panel */}
        <div className="right-container bg-white border-l border-gray-200 flex flex-col h-screen overflow-auto">
          <ActionPanel />
          {/* <div className="flex-1">
            <RightPanel
              boardRotation={boardRotation}
              onRotateClockwise={rotateBoardClockwise}
              onRotateCounterClockwise={rotateBoardCounterClockwise}
            />
          </div> */}
          {/* <div className="p-4 border-t border-gray-200">
            <GameLog maxHeight="300px" />
          </div> */}
        </div>
      </div>
    </div>
  );
}

const gameId = Date.now();

export function NewGame() {
  const { gameAddress, setGameAddress } = useGameContext();
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const gameAddressParam = searchParams.get("game");
  const { refetch } = useGamePlayers(
    gameAddressParam ? address(gameAddressParam) : undefined
  );

  const handleCreateGame = async () => {
    try {
      const playerA = await createSignerFromKeyPair(await fakePlayerA());
      setIsCreatingGame(true);
      // const rpc = createSolanaRpc(devnet(process.env.NEXT_PUBLIC_HELIUS_RPC_URL!));
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const { instruction, gameAccountAddress } = await sdk.createGameIx({
        rpc,
        creator: playerA,
        gameId,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        playerA
      );
      console.log("handleCreateGame", signature);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("game", gameAccountAddress.toString());
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleJoinGame = async () => {
    try {
      if (!gameAddress) {
        return;
      }

      const playerb = await createSignerFromKeyPair(await fakePlayerB());
      setIsJoiningGame(true);
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      console.log("join gameAccountPDA", gameAddress.toString());

      const { instruction } = await sdk.joinGameIx({
        rpc,
        gameAddress: gameAddress,
        player: playerb,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        playerb
      );
      console.log("handleJoinGame", signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsJoiningGame(false);
      refetch();
    }
  };

  const handleStartGame = async () => {
    try {
      if (!gameAddress) {
        return;
      }

      const playerA = await createSignerFromKeyPair(await fakePlayerA());
      setIsStartingGame(true);
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      console.log("start gameAccountPDA", gameAddress.toString());

      const instruction = await sdk.startGameIx({
        rpc,
        gameAddress: gameAddress,
        authority: playerA,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        playerA
      );
      console.log("handleStartGame", signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsStartingGame(false);
      refetch();
    }
  };

  useEffect(() => {
    if (gameAddressParam) {
      setGameAddress(address(gameAddressParam));
    }
  }, [gameAddressParam]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          {/* Logo */}
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <img
              src="/images/red-figure.png"
              alt="Poo Town Logo"
              className="w-16 h-16"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground text-center">
            Poo Town
          </h1>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 w-full">
            <Button
              disabled={isCreatingGame}
              onClick={handleCreateGame}
              className="w-full"
              size="lg"
            >
              {isCreatingGame ? "Creating..." : "Create Game"}
            </Button>
            <Button
              disabled={isJoiningGame}
              className="w-full bg-transparent"
              variant="outline"
              size="lg"
              onClick={handleJoinGame}
            >
              {isJoiningGame ? "Joining..." : "Join Game"}
            </Button>
            <Button
              disabled={isStartingGame}
              onClick={handleStartGame}
              className="w-full"
              variant="secondary"
              size="lg"
            >
              {isStartingGame ? "Starting..." : "Start Game"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
