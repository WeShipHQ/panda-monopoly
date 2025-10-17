"use client";

import { useEffect } from "react";
import GameBoard from "./game-board";

import { useGameContext } from "@/components/providers/game-provider";
import { useParams } from "next/navigation";
import { address } from "@solana/kit";
import { LeftPanel } from "./left-panel";
import { RightPanel } from "./right-panel";
import { Spinner } from "@/components/ui/spinner";
import { SoundControl } from "@/components/sound-control";

export function GameView() {
  const { address: gameAddress } = useParams<{ address: string }>();
  const { setGameAddress, gameState, gameLoading, gameError } =
    useGameContext();

  useEffect(() => {
    if (gameAddress) {
      setGameAddress(address(gameAddress));
    }
  }, [gameAddress]);

  if (gameLoading || !gameState) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner variant="bars" />
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div id="error">
          <p>ERROR: {gameError?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen xl:h-screen game-container w-full h-full relative">
      {/* Sound Control - Fixed position in bottom left */}
      <div className="fixed bottom-6 left-6 z-50">
        <SoundControl />
      </div>
      
      <div
        style={{
          gridArea: "left",
        }}
        className="overflow-hidden h-full"
      >
        <LeftPanel />
      </div>
      <div
        style={{
          gridArea: "center",
        }}
        className="aspect-square w-screen lg:w-auto lg:h-[80vh] xl:h-screen"
      >
        <GameBoard />
      </div>
      <div
        style={{
          gridArea: "right",
        }}
      >
        <RightPanel />
      </div>
    </div>
  );
}
