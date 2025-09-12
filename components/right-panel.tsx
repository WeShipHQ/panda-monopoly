"use client";

import React, { useState } from "react";
import { Dice } from "@/components/dice";
import { boardSpaces } from "@/data/monopoly-data";

interface RightPanelProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  gameManager: ReturnType<
    typeof import("@/components/game-manager").useGameManager
  >;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardRotation,
  onRotateClockwise,
  onRotateCounterClockwise,
  gameManager,
}) => {
  const [currentDialogVisible, setCurrentDialogVisible] = useState(true);
  const {
    gameState,
    handleDiceRoll,
    currentPlayer,
    buyProperty,
    skipProperty,
    handleSpecialCard,
    handleCardDrawn,
    closeCardModal,
    payJailFine,
    useJailFreeCard,
    drawnCards,
  } = gameManager;

  // Reset dialog visibility when action changes
  React.useEffect(() => {
    if (gameState.currentAction) {
      setCurrentDialogVisible(true);
    }
  }, [gameState.currentAction]);

  return (
    <div
      className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
      style={{ height: "100vh" }}
    >
      {/* Current Player Info */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Current Turn</h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src={currentPlayer.avatar}
              alt={`${currentPlayer.name} avatar`}
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="font-semibold">{currentPlayer.name}</div>
            <div className="text-sm text-gray-600">
              Money: ${currentPlayer.money}
            </div>
            <div className="text-sm text-gray-600">
              Position: {currentPlayer.position}
            </div>
            <div className="text-xs text-blue-600">
              {boardSpaces[currentPlayer.position]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Dice */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Roll Dice</h3>
        <Dice
          onRoll={handleDiceRoll}
          disabled={gameState.gamePhase !== "waiting"}
        />
        <div className="text-xs text-gray-500 mt-2">
          Phase: {gameState.gamePhase} | Player: {currentPlayer.name}
        </div>
      </div>

      {/* Game Log */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow flex-1">
        <h3 className="text-lg font-bold mb-4">Game Log</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {gameState.gameLog.slice(-10).map((log, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 p-1 bg-background rounded"
            >
              {log}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-blue-600">
          Phase: {gameState.gamePhase}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Controls</h3>

        {/* Current Dialog Toggle - only show when there's an active dialog */}
        {(gameState.gamePhase === "property-action" ||
          gameState.gamePhase === "special-action") && (
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={currentDialogVisible}
                onChange={(e) => setCurrentDialogVisible(e.target.checked)}
                className="rounded"
              />
              Show Current Dialog
            </label>
          </div>
        )}

        {/* Rotation Controls */}
        <div className="flex gap-2">
          <button
            onClick={onRotateCounterClockwise}
            className="flex-1 px-3 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm"
          >
            ↺ Left
          </button>
          <button
            onClick={onRotateClockwise}
            className="flex-1 px-3 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm"
          >
            ↻ Right
          </button>
        </div>
      </div>
    </div>
  );
};
