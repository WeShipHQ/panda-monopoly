"use client";

import React, { useState } from "react";
import { boardSpaces } from "@/data/monopoly-data";

interface RightPanelProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  gameManager: ReturnType<typeof import("@/hooks").useGameManager>;
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
    currentPlayer,
  } = gameManager;

  // Reset dialog visibility when action changes
  React.useEffect(() => {
    if (gameState.currentAction) {
      setCurrentDialogVisible(true);
    }
  }, [gameState.currentAction]);

  return (
    <div
      className="w-[34rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
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
            <div className="font-bold text-gray-800">{currentPlayer.name}</div>
            <div className="text-sm text-gray-700 font-semibold">
              Money: ${currentPlayer.money}
            </div>
            <div className="text-sm text-gray-700 font-semibold">
              Position: {currentPlayer.position}
            </div>
            <div className="text-xs text-blue-700 font-medium">
              {boardSpaces[currentPlayer.position]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="p-4 bg-white rounded-lg shadow flex-1">
        <h3 className="text-lg font-bold mb-4">Players List</h3>
        <div className="space-y-3">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-2 rounded ${
                index === gameState.currentPlayerIndex
                  ? "bg-blue-100"
                  : "bg-gray-50"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src={player.avatar}
                  alt={`${player.name} avatar`}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{player.name}</div>
                <div className="text-xs text-gray-700 font-semibold">${player.money}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Controls</h3>

        {/* Current Dialog Toggle - only show when there's an active dialog */}
        {(gameState.gamePhase === "property-action" ||
          gameState.gamePhase === "special-action") && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
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
            className="flex-1 px-3 py-2 bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm font-semibold"
          >
            ↺ Left
          </button>
          <button
            onClick={onRotateClockwise}
            className="flex-1 px-3 py-2 bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm font-semibold"
          >
            ↻ Right
          </button>
        </div>
      </div>
    </div>
  );
};
