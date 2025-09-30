"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGameContext } from "@/components/providers/game-provider";
import { TradeItems } from "./trade-items";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import envConfig from "@/configs/env";

export function RightPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <TradeItems />
      {envConfig.IS_DEVELOPMENT && <DebugUI />}
    </div>
  );
}

function DebugUI() {
  const { gameState, players, properties, currentPlayerState } =
    useGameContext();
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
    <Sheet>
      <SheetTrigger asChild>
        <Button>DEBUG</Button>
      </SheetTrigger>
      <SheetContent className="max-w-3xl w-full">
        <SheetHeader>
          <SheetTitle>Debug</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          <p className="mb-3">Current player</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[200px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(currentPlayerState, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Game account</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[200px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(gameState, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Player accounts</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[300px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(players, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Properties</p>
          <div className="w-full overflow-hidden p-4">
            <pre className="w-full h-[300px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(properties, null, 2)}
            </pre>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleResetGame} loading={isLoading}>
            {isLoading ? "Resetting..." : "Reset Game"}
          </Button>
          <Button onClick={handleCloseGame} loading={isLoading}>
            {isLoading ? "Closing..." : "Close Game"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
