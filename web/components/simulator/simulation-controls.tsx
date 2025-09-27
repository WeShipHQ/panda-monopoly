"use client";

import React from "react";
import { useGameSimulation } from "@/hooks/useGameSimulation";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause } from "lucide-react";

export const SimulationControls: React.FC = () => {
  // const { resetGame, gameState } = useGameSimulation();

  // const handleResetGame = () => {
  //   if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
  //     resetGame();
  //   }
  // };

  return (
    <div className="flex items-center gap-2 p-4 bg-black/20 backdrop-blur-sm rounded-lg">
      <h3 className="text-white font-medium mr-4">Simulation Controls</h3>

      <Button
        // onClick={handleResetGame}
        size="sm"
        className="flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Game
      </Button>

      <div className="flex items-center gap-2 text-sm text-gray-300 ml-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Simulation Active
      </div>
    </div>
  );
};
