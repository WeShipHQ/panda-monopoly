"use client";

import React from "react";
import { GameProviderWrapper } from "@/components/game-provider-wrapper";
import { GameBoard } from "@/components/game-board";
import { ActionPanel } from "@/components/action-panel";
import { PlayerList } from "@/components/player-list";
import { GameLogs } from "@/components/game-logs";

export default function SimulationPage() {
  return (
    <GameProviderWrapper useSimulation={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Monopoly Simulation Mode
            </h1>
            <p className="text-gray-300">
              Experience the full game without blockchain transactions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board - Takes up most space */}
            <div className="lg:col-span-3">
              <GameBoard />
            </div>

            {/* Side Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Action Panel */}
              <ActionPanel />
              
              {/* Player List */}
              <PlayerList />
              
              {/* Game Logs */}
              <div className="max-h-96 overflow-hidden">
                <GameLogs />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Simulation Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">✅ Implemented</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Complete dice rolling mechanics</li>
                  <li>• Property buying and rent collection</li>
                  <li>• Chance and Community Chest cards</li>
                  <li>• Jail mechanics and fines</li>
                  <li>• Building houses and hotels</li>
                  <li>• Turn management</li>
                  <li>• Game state persistence</li>
                  <li>• Real-time game logs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">🎮 How to Play</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Click "Roll Dice" to move</li>
                  <li>• Buy properties when you land on them</li>
                  <li>• Pay rent when landing on owned properties</li>
                  <li>• Draw cards from special spaces</li>
                  <li>• Build houses/hotels on monopolies</li>
                  <li>• End your turn when ready</li>
                  <li>• Watch the game logs for updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameProviderWrapper>
  );
}