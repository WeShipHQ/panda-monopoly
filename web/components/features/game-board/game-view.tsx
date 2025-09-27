"use client";

import { useState, useEffect } from "react";
import GameBoard from "./game-board";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/components/providers/game-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { address, createSignerFromKeyPair, createSolanaRpc } from "@solana/kit";
import { fakePlayerA, fakePlayerB } from "@/lib/sdk/utils";
import { sdk } from "@/lib/sdk/sdk";
import { buildAndSendTransaction } from "@/lib/tx";
import { useGameState } from "@/hooks/useGameStatev2";
import { GameStatus } from "@/lib/sdk/generated";

export function GameView() {
  const [boardRotation, setBoardRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");
  const { gameState } = useGameContext();

  const rotateBoardClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  if (!gameState || gameState.gameStatus !== GameStatus.InProgress) {
    return <NewGame />;
  }

  // return (
  //   <div className="min-h-screen w-full overflow-hidden">
  //     {/* Desktop Layout */}
  //     <div className="hidden lg:flex h-screen w-screen overflow-hidden">
  //       {/* <LeftSidebar gameManager={gameManager} /> */}
  //       <GameBoard
  //         boardRotation={boardRotation}
  //         onRotateClockwise={rotateBoardClockwise}
  //         onRotateCounterClockwise={rotateBoardCounterClockwise}
  //       />
  //       <RightPanel
  //         boardRotation={boardRotation}
  //         onRotateClockwise={rotateBoardClockwise}
  //         onRotateCounterClockwise={rotateBoardCounterClockwise}
  //       />
  //     </div>

  //     {/* Mobile & Tablet Layout */}
  //     <div className="lg:hidden flex flex-col h-screen w-screen overflow-hidden">
  //       {/* Board Section - Takes most of screen */}
  //       <div className="flex-1 relative overflow-hidden">
  //         <GameBoard
  //           boardRotation={boardRotation}
  //           onRotateClockwise={rotateBoardClockwise}
  //           onRotateCounterClockwise={rotateBoardCounterClockwise}
  //           // boardRotation={boardRotation}
  //           // onRotateClockwise={rotateBoardClockwise}
  //           // onRotateCounterClockwise={rotateBoardCounterClockwise}
  //           // gameManager={gameManager}
  //         />
  //       </div>

  //       {/* Bottom Panel - Taller on tablets, shorter on mobile */}
  //       <div className="h-1/3 md:h-2/5 max-h-80 md:max-h-96 min-h-60 flex flex-col bg-gray-900">
  //         {/* Tab Navigation - Hidden on small mobile, visible on tablet */}
  //         <div className="hidden sm:flex border-b border-gray-700">
  //           <button
  //             onClick={() => setActiveTab("players")}
  //             className={`flex-1 py-4 px-4 min-h-[48px] font-semibold transition-colors ${
  //               activeTab === "players"
  //                 ? "text-white bg-gray-800"
  //                 : "text-gray-400 hover:text-white hover:bg-gray-800"
  //             }`}
  //           >
  //             Players
  //           </button>
  //           <button
  //             onClick={() => setActiveTab("settings")}
  //             className={`flex-1 py-4 px-4 min-h-[48px] font-semibold transition-colors ${
  //               activeTab === "settings"
  //                 ? "text-white bg-gray-800"
  //                 : "text-gray-400 hover:text-white hover:bg-gray-800"
  //             }`}
  //           >
  //             Share Game
  //           </button>
  //         </div>

  //         {/* Content Area */}
  //         <div className="flex-1 overflow-hidden">
  //           {/* Mobile Referral Section - Always visible on small screens */}
  //           <div className="sm:hidden p-2 bg-gray-800 border-b border-gray-700">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex-1 min-w-0">
  //                 <div className="text-xs text-gray-400 mb-1">Share Game:</div>
  //                 <input
  //                   type="text"
  //                   value="https://pandamonopoly.io/room/mzuv3"
  //                   readOnly
  //                   className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 font-mono truncate"
  //                 />
  //               </div>
  //               <button
  //                 onClick={async () => {
  //                   try {
  //                     await navigator.clipboard.writeText(
  //                       "https://pandamonopoly.io/room/mzuv3"
  //                     );
  //                   } catch (err) {
  //                     console.error("Failed to copy: ", err);
  //                   }
  //                 }}
  //                 className="flex-shrink-0 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium min-h-[32px]"
  //               >
  //                 Copy
  //               </button>
  //             </div>
  //           </div>

  //           {/* Tab Content */}
  //           <div className="h-full overflow-hidden">
  //             {/* Players Tab - Always visible on mobile, switchable on tablet+ */}
  //             <div
  //               className={`h-full ${
  //                 activeTab === "players" ? "block" : "hidden sm:block"
  //               }`}
  //             >
  //               <div className="h-full p-2 sm:p-4 overflow-y-auto">
  //                 {/* <RightPanel
  //                   boardRotation={boardRotation}
  //                   onRotateClockwise={rotateBoardClockwise}
  //                   onRotateCounterClockwise={rotateBoardCounterClockwise}
  //                 /> */}
  //               </div>
  //             </div>

  //             {/* Share Game Tab - Only visible on tablet+ when active */}
  //             <div
  //               className={`h-full hidden sm:block ${
  //                 activeTab === "settings" ? "" : "sm:hidden"
  //               }`}
  //             >
  //               <div className="p-4 overflow-y-auto h-full">
  //                 {/* <LeftSidebar gameManager={gameManager} /> */}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <GameBoard
      boardRotation={boardRotation}
      onRotateClockwise={rotateBoardClockwise}
      onRotateCounterClockwise={rotateBoardCounterClockwise}
    />
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
  const { refetch } = useGameState(
    gameAddressParam ? address(gameAddressParam) : undefined
  );

  const handleCreateGame = async () => {
    try {
      const playerA = await createSignerFromKeyPair(await fakePlayerA());
      window.localStorage.removeItem("assignedPlayers");
      window.localStorage.removeItem("gameLogs");
      setIsCreatingGame(true);
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const { instruction, gameAccountAddress } = await sdk.createGameIx({
        rpc,
        creator: playerA,
        // @ts-expect-error
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
              //   variant="outline"
              size="lg"
              onClick={handleJoinGame}
            >
              {isJoiningGame ? "Joining..." : "Join Game"}
            </Button>
            <Button
              disabled={isStartingGame}
              onClick={handleStartGame}
              className="w-full"
              //   variant="secondary"
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
