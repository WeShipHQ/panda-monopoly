"use client";

import { useGameContext } from "@/components/providers/game-provider";
import { TradeItems } from "./trade-items";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RightPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const { resetGame, closeGame } = useGameContext();

  const handleResetGame = async () => {
    try {
      setIsLoading(true);
      await resetGame();
    } catch (error) {
      console.error("Failed to reset game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    try {
      setIsLoading(true);
      await closeGame();
    } catch (error) {
      console.error("Failed to close game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <TradeItems />
      <Button onClick={handleResetGame} loading={isLoading}>
        {isLoading ? "Resetting..." : "Reset Game"}
      </Button>
      <Button onClick={handleCloseGame} loading={isLoading}>
        {isLoading ? "Closing..." : "Close Game"}
      </Button>
    </div>
  );
}
