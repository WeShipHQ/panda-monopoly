"use client";

import { useEffect } from "react";
import GameBoard from "./game-board";

import { useGameContext } from "@/components/providers/game-provider";
import { useParams } from "next/navigation";
import { address } from "@solana/kit";
import { LeftPanel } from "./left-panel";
import { RightPanel } from "./right-panel";
import { DiceLoading } from "@/components/dice-loading";

export function GameView() {
  const { address: gameAddress } = useParams<{ address: string }>();
  const { setGameAddress, gameState, gameLoading, gameError } =
    useGameContext();

  useEffect(() => {
    if (gameAddress) {
      setGameAddress(address(gameAddress));
    }
  }, [gameAddress]);

  if (gameLoading || !gameAddress || !gameState) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <DiceLoading />
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
    <div className="max-h-screen game-container w-full h-full">
      <div
        style={{
          gridArea: "left",
        }}
        className="overflow-hidden h-screen"
      >
        <LeftPanel />
      </div>
      <div
        style={{
          gridArea: "center",
        }}
        className="bg-green-200 aspect-square w-[100vw] lg:w-[55vw]"
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
