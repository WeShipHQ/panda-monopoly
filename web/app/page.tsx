"use client";

import { useState } from "react";
import MonopolyBoard from "@/components/monopoly-board";
import { RightPanel } from "@/components/right-panel";
import { LeftSidebar } from "@/components/left-sidebar";
import { useGameManager } from "@/hooks";

export default function Home() {
  const [boardRotation, setBoardRotation] = useState(0);

  // Move game state management to parent component
  const gameManager = useGameManager();

  const rotateBoardClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ height: "100vh", width: "100vw" }}
    >
      <LeftSidebar gameManager={gameManager} />
      <MonopolyBoard
        boardRotation={boardRotation}
        onRotateClockwise={rotateBoardClockwise}
        onRotateCounterClockwise={rotateBoardCounterClockwise}
        gameManager={gameManager}
      />
      <RightPanel
        boardRotation={boardRotation}
        onRotateClockwise={rotateBoardClockwise}
        onRotateCounterClockwise={rotateBoardCounterClockwise}
        gameManager={gameManager}
      />
    </div>
  );
}
