"use client";

import React from "react";
interface LeftSidebarProps {
  gameManager: ReturnType<
    typeof import("@/components/game-manager").useGameManager
  >;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ gameManager }) => {
  const { gameState } = gameManager;

  return (
    <div
      className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
      style={{ height: "100vh" }}
    >
      {/* Players List */}
      <div className="p-4 bg-white rounded-lg shadow">
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
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-gray-600">${player.money}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
