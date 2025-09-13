"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameContext } from "./game-provider";

interface DiceProps {
  disabled?: boolean;
  isMyTurn?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  disabled = false,
  isMyTurn = false,
}) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to store the animation interval
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're waiting for a transaction result
  const waitingForResultRef = useRef(false);

  // Track the player's hasRolledDice state to detect when it changes
  const prevHasRolledDiceRef = useRef<boolean | null>(null);

  // Demo dice values for testing
  const [demoDice1, setDemoDice1] = useState(0);
  const [demoDice2, setDemoDice2] = useState(0);

  const {
    gameState,
    currentPlayerAddress,
    currentPlayerState,
    currentPlayerSigner,
    rollDice,
  } = useGameContext();

  const setDemoValues = () => {
    setDice1(demoDice1);
    setDice2(demoDice2);
  };

  useEffect(() => {
    // Check if the player's hasRolledDice state changed from false to true
    // This indicates a successful dice roll transaction
    const currentHasRolledDice = currentPlayerState?.hasRolledDice;
    const prevHasRolledDice = prevHasRolledDiceRef.current;

    if (
      waitingForResultRef.current &&
      prevHasRolledDice === false &&
      currentHasRolledDice === true
    ) {
      // Stop the animation
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }

      // Update dice values with the real result
      if (
        currentPlayerState?.lastDiceRoll &&
        currentPlayerState.lastDiceRoll.length >= 2
      ) {
        const dices = Array.from(currentPlayerState.lastDiceRoll);
        setDice1(dices[0]);
        setDice2(dices[1]);
      }

      setIsRolling(false);
      waitingForResultRef.current = false;
    }

    // Update the previous state for next comparison
    prevHasRolledDiceRef.current = currentHasRolledDice ?? null;
  }, [
    currentPlayerState?.hasRolledDice,
    gameState?.diceResult,
    waitingForResultRef.current,
  ]);

  // Update dice display when game state changes (for initial load or other updates)
  useEffect(() => {
    if (
      !isRolling &&
      currentPlayerState?.lastDiceRoll &&
      currentPlayerState.lastDiceRoll.length >= 2
    ) {
      const dices = Array.from(currentPlayerState.lastDiceRoll);
      setDice1(dices[0]);
      setDice2(dices[1]);
    }
  }, [currentPlayerState?.lastDiceRoll, isRolling]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  const canRoll =
    !!currentPlayerState &&
    gameState?.players[gameState?.currentTurn] === currentPlayerAddress &&
    !currentPlayerState.hasRolledDice;

  const rollDiceHandler = async () => {
    if (
      disabled ||
      isRolling ||
      !canRoll ||
      !gameState?.address ||
      !currentPlayerSigner
    ) {
      return;
    }

    setIsRolling(true);
    setError(null);
    waitingForResultRef.current = true;

    try {
      // Start animation that continues until transaction completes
      animationIntervalRef.current = setInterval(() => {
        setDice1(Math.floor(Math.random() * 6) + 1);
        setDice2(Math.floor(Math.random() * 6) + 1);
      }, 100);

      // Call the smart contract
      await rollDice(dice1 > 0 && dice2 > 0 ? [dice1, dice2] : undefined);

      // Note: Animation will be stopped by the useEffect when hasRolledDice changes to true
    } catch (err) {
      console.error("Failed to roll dice:", err);
      setError(err instanceof Error ? err.message : "Failed to roll dice");

      // Stop animation on error
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setIsRolling(false);
      waitingForResultRef.current = false;
    }
  };

  const getDiceFace = (value: number) => {
    const dots: React.ReactNode[] = [];
    const positions = [
      [], // 0 - not used
      [[50, 50]], // 1
      [
        [25, 25],
        [75, 75],
      ], // 2
      [
        [25, 25],
        [50, 50],
        [75, 75],
      ], // 3
      [
        [25, 25],
        [75, 25],
        [25, 75],
        [75, 75],
      ], // 4
      [
        [25, 25],
        [75, 25],
        [50, 50],
        [25, 75],
        [75, 75],
      ], // 5
      [
        [25, 25],
        [75, 25],
        [25, 50],
        [75, 50],
        [25, 75],
        [75, 75],
      ], // 6
    ];

    positions[value]?.forEach((pos, index) => {
      dots.push(
        <div
          key={index}
          className="absolute w-2 h-2 bg-black rounded-full"
          style={{
            left: `${pos[0]}%`,
            top: `${pos[1]}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      );
    });

    return dots;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {/* Dice 1 */}
        <div
          className={`relative w-16 h-16 bg-white border-2 border-gray-800 rounded-lg shadow-lg ${
            isRolling ? "animate-bounce" : ""
          }`}
        >
          {getDiceFace(dice1)}
        </div>

        {/* Dice 2 */}
        <div
          className={`relative w-16 h-16 bg-white border-2 border-gray-800 rounded-lg shadow-lg ${
            isRolling ? "animate-bounce" : ""
          }`}
        >
          {getDiceFace(dice2)}
        </div>
      </div>

      {isMyTurn && !currentPlayerState?.hasRolledDice && (
        <button
          onClick={rollDiceHandler}
          disabled={disabled || isRolling || !canRoll}
          className={`z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu outline-none px-4 min-w-20 gap-2 transition-transform-colors-opacity motion-reduce:transition-none w-full text-center h-12 rounded-full text-white font-medium border-b-2 transition-transform text-base font-cherry-bomb shadow-lg ${
            disabled || isRolling || !canRoll
              ? "bg-gray-400 border-gray-500 cursor-not-allowed opacity-50"
              : "bg-[#4BD467] border-[#27AC4B] hover:opacity-85 active:scale-[98%] hover:shadow-xl"
          }`}
          style={{ fontFamily: "var(--font-cherry-bomb-one)" }}
        >
          {isRolling
            ? "🎲 Rolling..."
            : !canRoll
            ? "🎲 Wait Your Turn"
            : "🎲 Roll Dice"}
        </button>
      )}

      {/* Demo Dice Controls */}
      <div className="w-full border-t pt-4 mt-2">
        <div className="text-sm font-medium text-gray-700 mb-2 text-center">
          Demo Controls
        </div>
        <div className="flex gap-2 items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs text-gray-600">Dice 1</label>
            <input
              type="number"
              min="1"
              max="6"
              value={demoDice1}
              onChange={(e) =>
                setDemoDice1(
                  Math.max(1, Math.min(6, parseInt(e.target.value) || 1))
                )
              }
              className="w-12 h-8 text-center border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs text-gray-600">Dice 2</label>
            <input
              type="number"
              min="1"
              max="6"
              value={demoDice2}
              onChange={(e) =>
                setDemoDice2(
                  Math.max(1, Math.min(6, parseInt(e.target.value) || 1))
                )
              }
              className="w-12 h-8 text-center border border-gray-300 rounded text-sm"
            />
          </div>
          <button
            onClick={setDemoValues}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Set
          </button>
        </div>
      </div>

      {/* <div className="text-center">
        <div className="text-lg font-bold">Total: {dice1 + dice2}</div>
        <div className="text-sm text-gray-600">
          ({dice1} + {dice2})
        </div>
        {currentPlayerState?.hasRolledDice && (
          <div className="text-xs text-blue-600 mt-1">
            Already rolled this turn
          </div>
        )}
      </div> */}
    </div>
  );
};
