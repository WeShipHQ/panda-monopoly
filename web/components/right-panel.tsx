"use client";

import React, { useState } from "react";
import { boardSpaces } from "@/data/monopoly-data";
import { SoundControl } from "@/components/sound-control";
import { playSound } from "@/lib/soundUtil";

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
    <div className="w-full lg:w-[34rem] bg-background p-2 sm:p-4 flex flex-col h-full overflow-y-auto">
      {/* Current Player Info - Hide on small mobile */}
      <div className="hidden sm:block mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg lg:text-xl font-bold mb-2">Current Turn</h2>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center">
            <img
              src={currentPlayer.avatar}
              alt={`${currentPlayer.name} avatar`}
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm lg:text-base">{currentPlayer.name}</div>
            <div className="text-xs lg:text-sm text-gray-700 font-semibold">
              Money: ${currentPlayer.money}
            </div>
            <div className="text-xs lg:text-sm text-gray-700 font-semibold">
              Position: {currentPlayer.position}
            </div>
            <div className="text-xs text-blue-700 font-medium">
              {boardSpaces[currentPlayer.position]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 p-3 lg:p-4 bg-white rounded-lg shadow overflow-y-auto">
        <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">Players</h2>
        <div className="space-y-2 lg:space-y-3">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`p-2 lg:p-3 rounded-lg transition-colors ${
                player.id === currentPlayer.id
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img
                    src={player.avatar}
                    alt={`${player.name} avatar`}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-xs lg:text-sm">{player.name}</div>
                  <div className="text-xs text-gray-600 font-semibold">${player.money}</div>
                </div>
                {/* Position indicator - only show on larger screens */}
                <div className="hidden sm:block text-xs text-gray-500">
                  Position: {player.position}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls - Hide on mobile, show on desktop */}
      <div className="hidden lg:block mt-4 p-3 lg:p-4 bg-white rounded-lg shadow">
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

        {/* Sound Controls */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Sound Settings</h3>
          <SoundControl />
        </div>

        {/* Rotation Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              playSound("button-click", 0.5);
              onRotateCounterClockwise();
            }}
            onMouseEnter={() => playSound("button-hover", 0.2)}
            className="flex-1 px-3 py-3 min-h-[44px] bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm font-semibold rounded-lg"
          >
            ↺ Left
          </button>
          <button
            onClick={() => {
              playSound("button-click", 0.5);
              onRotateClockwise();
            }}
            onMouseEnter={() => playSound("button-hover", 0.2)}
            className="flex-1 px-3 py-3 min-h-[44px] bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm font-semibold rounded-lg"
          >
            ↻ Right
          </button>
        </div>
      </div>
    </div>
  );
};
