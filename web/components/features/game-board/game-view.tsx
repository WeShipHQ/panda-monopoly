"use client";

import { useState, useEffect } from "react";
import GameBoard from "./game-board";

import { useGameContext } from "@/components/providers/game-provider";
import { useParams } from "next/navigation";
import { address } from "@solana/kit";

export function GameView() {
  const { address: gameAddress } = useParams<{ address: string }>();
  const [boardRotation, setBoardRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");
  const { gameState, setGameAddress } = useGameContext();

  const rotateBoardClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  useEffect(() => {
    if (gameAddress) {
      setGameAddress(address(gameAddress));
    }
  }, [gameAddress]);

  return (
    <GameBoard
      boardRotation={boardRotation}
      onRotateClockwise={rotateBoardClockwise}
      onRotateCounterClockwise={rotateBoardCounterClockwise}
    />
  );
}
