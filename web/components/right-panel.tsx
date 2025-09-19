"use client";

import React, { useState, useCallback } from "react";
import { Dice } from "@/components/dice";
import { useGameContext } from "@/components/game-provider";
import { sdk } from "@/lib/sdk/sdk";
import { buildAndSendTransaction } from "@/lib/tx";
import { createSolanaRpc } from "@solana/kit";
import { truncateAddress, generatePlayerIcon } from "@/lib/utils";
import { GameStatus } from "@/lib/sdk/generated";

interface RightPanelProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  boardRotation,
  onRotateClockwise,
  onRotateCounterClockwise,
}) => {
  const connected = true;

  const [currentDialogVisible, setCurrentDialogVisible] = useState(true);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [isEndingTurn, setIsEndingTurn] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );

  const {
    gameAddress,
    currentPlayerAddress,
    currentPlayerSigner,
    currentPlayerState,
    gameState,
    gameLoading,
    gameError,
    players,
    refetch,
  } = useGameContext();

  const currentPlayerIndex = gameState?.currentPlayers || 0;
  const gamePhase = gameState?.gameStatus;

  const canEndTurn =
    gamePhase === GameStatus.InProgress &&
    !!currentPlayerState &&
    currentPlayerState.hasRolledDice &&
    !currentPlayerState.needsPropertyAction &&
    !currentPlayerState.needsChanceCard &&
    !currentPlayerState.needsCommunityChestCard &&
    !currentPlayerState.needsBankruptcyCheck;

  // Handle dice roll with blockchain integration
  const handleDiceRoll = useCallback(
    async (dice1: number, dice2: number) => {},
    [gameAddress, currentPlayerAddress]
  );

  // Handle end turn with blockchain integration
  const handleEndTurn = useCallback(async () => {
    try {
      if (!gameAddress || !currentPlayerSigner) {
        return;
      }

      setIsEndingTurn(true);
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      console.log("end turn", gameAddress.toString());

      const instruction = await sdk.endTurnIx({
        rpc,
        gameAddress: gameAddress,
        player: currentPlayerSigner,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("handleEndTurn", signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEndingTurn(false);
      refetch();
    }
  }, [gameAddress, currentPlayerSigner]);

  // Loading state
  if (gameLoading) {
    return (
      <div className="w-[20rem] bg-background p-4 flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading game data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (gameError) {
    return (
      <div className="w-[20rem] bg-background p-4 flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <p className="font-semibold">Error loading game</p>
            <p className="text-sm">{gameError.message || "Unknown error"}</p>
          </div>
        </div>
      </div>
    );
  }

  // No current player found
  if (!currentPlayerState) {
    return (
      <div className="w-[20rem] bg-background p-4 flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-yellow-600">
            <p className="font-semibold">Player not found</p>
            <p className="text-sm">You are not part of this game</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
      style={{ height: "100vh" }}
    >
      {/* Current Player Info */}
      {/* <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Current Turn</h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {generatePlayerIcon(currentPlayerState.wallet.toString())}
            </div>
          </div>
          <div>
            <div className="font-semibold">
              {truncateAddress(currentPlayerState.wallet.toString())}
            </div>
            <div className="text-sm text-gray-600">
              Balance: {currentPlayerState.cashBalance.toString()} SOL
            </div>
            <div className="text-xs text-gray-500">
              Position: {currentPlayerState.position}
              {currentPlayerState.inJail && " (In Jail)"}
            </div>
          </div>
        </div>
      </div> */}

      {/* Dice Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-3">Roll Dice</h3>
        <Dice
          onRoll={handleDiceRoll}
          disabled={
            isRollingDice || !connected || gamePhase !== GameStatus.InProgress
          }
        />

        {/* Turn Actions */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleEndTurn}
            disabled={isEndingTurn || !connected || !canEndTurn}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isEndingTurn ? "Ending Turn..." : "End Turn"}
          </button>
        </div>

        {/* Connection Status */}
        {!connected && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
            Connect your wallet to play
          </div>
        )}

        {/* Transaction Status */}
        {transactionStatus && (
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
            {transactionStatus}
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="hidden mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-3">Game Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Game Phase:</span>
            <span className="font-medium capitalize">{gamePhase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Player:</span>
            <span className="font-medium">{currentPlayerIndex + 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Players:</span>
            <span className="font-medium">{players.length}</span>
          </div>
          {gameAddress && (
            <div className="flex justify-between">
              <span className="text-gray-600">Game Address:</span>
              <span className="font-mono text-xs">
                {truncateAddress(gameAddress.toString())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-3">Controls</h3>

        {/* Board Rotation */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onRotateCounterClockwise}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              ↺ Rotate Left
            </button>
            <button
              onClick={onRotateClockwise}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              ↻ Rotate Right
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Current rotation: {boardRotation}°
          </div>
        </div>
      </div>
    </div>
  );
};
