"use client";

import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { playDiceRollSequence, stopDiceRollSequence } from "@/lib/soundUtil";
import { useGameContext } from "@/components/providers/game-provider";
import "../../../styles/dice.css";
import { Button } from "@/components/ui/button";

interface DiceProps {}

const diceRotations = {
  1: [-0.1, 0.3, -1],
  2: [-0.1, 0.6, -0.4],
  3: [-0.85, -0.42, 0.73],
  4: [-0.8, 0.3, -0.75],
  5: [0.3, 0.45, 0.9],
  6: [-0.16, 0.6, 0.18],
};

export const Dice: React.FC<DiceProps> = () => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isThrowAnimation, setIsThrowAnimation] = useState(false);

  // Refs to control animation
  const animationFrameRef = useRef<number | null>(null);
  const isWaitingForResult = useRef(false);
  const dice1Ref = useRef<HTMLDivElement>(null);
  const dice2Ref = useRef<HTMLDivElement>(null);

  const { currentPlayerState, canRollDice, rollDice, demoDices } =
    useGameContext();

  const canRoll = canRollDice();
  const hasPendingActions =
    !!currentPlayerState &&
    (currentPlayerState.needsPropertyAction ||
      currentPlayerState.needsChanceCard ||
      currentPlayerState.needsCommunityChestCard ||
      currentPlayerState.needsBankruptcyCheck ||
      currentPlayerState.needsSpecialSpaceAction);

  useEffect(() => {
    console.log("Dice roll data:", currentPlayerState?.lastDiceRoll);
    if (
      isWaitingForResult.current &&
      currentPlayerState?.lastDiceRoll &&
      currentPlayerState.lastDiceRoll.length >= 2
    ) {
      // Extract dice values from the ReadonlyUint8Array
      const dice1Value = currentPlayerState.lastDiceRoll[0];
      const dice2Value = currentPlayerState.lastDiceRoll[1];

      console.log("Received dice values:", dice1Value, dice2Value);

      // Validate dice values are in valid range (1-6)
      if (
        dice1Value >= 1 &&
        dice1Value <= 6 &&
        dice2Value >= 1 &&
        dice2Value <= 6
      ) {
        // Stop rolling animation
        setIsRolling(false);

        // Set final dice values
        setDice1(dice1Value);
        setDice2(dice2Value);

        // Start throw animation
        setIsThrowAnimation(true);

        // Set final rotations
        if (dice1Ref.current) {
          const [x, y, z] =
            diceRotations[dice1Value as keyof typeof diceRotations];
          dice1Ref.current.style.transform = `rotate3d(${x}, ${y}, ${z}, 180deg)`;
        }

        if (dice2Ref.current) {
          const [x, y, z] =
            diceRotations[dice2Value as keyof typeof diceRotations];
          dice2Ref.current.style.transform = `rotate3d(${x}, ${y}, ${z}, 180deg)`;
        }

        stopDiceRollSequence();

        // Reset states after animation
        setTimeout(() => {
          setIsThrowAnimation(false);
          isWaitingForResult.current = false;
        }, 300);
      }
    }
  }, [currentPlayerState?.lastDiceRoll]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;

    playDiceRollSequence();
    setIsRolling(true);
    // Play dice roll sound sequence
    setIsThrowAnimation(false);
    isWaitingForResult.current = true;

    // Reset dice rotations and start rolling animation
    if (dice1Ref.current) {
      dice1Ref.current.style.transform = "rotate3d(0, 0.9, 0.9, 90deg)";
    }
    if (dice2Ref.current) {
      dice2Ref.current.style.transform = "rotate3d(0, 0.9, 0.9, 90deg)";
    }

    // Call Solana program to roll dice (this happens in parallel with animation)
    try {
      await rollDice(demoDices ? demoDices : undefined);
    } catch (error) {
      console.error("Error rolling dice:", error);
      // Reset state on error
      stopDiceRollSequence();
      setIsRolling(false);
      setIsThrowAnimation(false);
      isWaitingForResult.current = false;
      return;
    }
  };

  const getDiceFace = (value: number) => {
    // This function is no longer needed as we're using CSS for dots
    return null;
  };

  const DiceFace = ({
    value,
    className,
  }: {
    value: number;
    className: string;
  }) => (
    <div className={`dice-face ${className}`}>
      {/* Dots are now handled by CSS */}
    </div>
  );

  if (hasPendingActions) return null;

  return (
    <div className="relative">
      <div className="absolute -top-[80px] left-1/2 translate-x-[-50%] flex gap-8">
        {" "}
        {/* Increased gap from gap-4 to gap-8 for more spacing */}
        {/* Dice 1 - 3D */}
        <div className="dice-wrapper">
          <div
            ref={dice1Ref}
            className={`dice-3d ${isRolling ? "dice-rolling" : ""} ${
              isThrowAnimation ? "dice-throw" : ""
            }`}
          >
            <DiceFace value={dice1} className="dice-front" />
            <DiceFace value={7 - dice1} className="dice-back" />
            <DiceFace value={((dice1 + 1) % 6) + 1} className="dice-right" />
            <DiceFace value={((dice1 + 2) % 6) + 1} className="dice-left" />
            <DiceFace value={((dice1 + 3) % 6) + 1} className="dice-top" />
            <DiceFace value={((dice1 + 4) % 6) + 1} className="dice-bottom" />
          </div>
        </div>
        {/* Dice 2 - 3D with different animation */}
        <div className="dice-wrapper">
          <div
            ref={dice2Ref}
            className={`dice-3d dice-2 ${isRolling ? "dice-rolling" : ""} ${
              isThrowAnimation ? "dice-throw" : ""
            }`}
          >
            <DiceFace value={dice2} className="dice-front" />
            <DiceFace value={7 - dice2} className="dice-back" />
            <DiceFace value={((dice2 + 1) % 6) + 1} className="dice-right" />
            <DiceFace value={((dice2 + 2) % 6) + 1} className="dice-left" />
            <DiceFace value={((dice2 + 3) % 6) + 1} className="dice-top" />
            <DiceFace value={((dice2 + 4) % 6) + 1} className="dice-bottom" />
          </div>
        </div>
      </div>
      <Button
        disabled={!canRoll || isRolling}
        onClick={handleRollDice}
        size="sm"
        // loading={isRolling}
      >
        Roll dice
      </Button>
    </div>
  );
};

interface DiceContextType {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  isThrowAnimation: boolean;
  canRoll: boolean;
  handleRollDice: () => Promise<void>;
  dice1Ref: React.RefObject<HTMLDivElement | null>;
  dice2Ref: React.RefObject<HTMLDivElement | null>;
}

const DiceContext = createContext<DiceContextType | null>(null);

export const DiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isThrowAnimation, setIsThrowAnimation] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const isWaitingForResult = useRef(false);
  const dice1Ref = useRef<HTMLDivElement>(null);
  const dice2Ref = useRef<HTMLDivElement>(null);

  const { currentPlayerState, canRollDice, rollDice, demoDices } =
    useGameContext();

  const canRoll = canRollDice();

  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;

    playDiceRollSequence();
    setIsRolling(true);
    setIsThrowAnimation(false);
    isWaitingForResult.current = true;

    // Reset dice rotations and start rolling animation
    if (dice1Ref.current) {
      dice1Ref.current.style.transform = "rotate3d(0, 0.9, 0.9, 60deg)";
    }
    if (dice2Ref.current) {
      dice2Ref.current.style.transform = "rotate3d(0, 0.9, 0.9, 120deg)";
    }

    // Call Solana program to roll dice
    try {
      await rollDice(demoDices ? demoDices : undefined);
    } catch (error) {
      console.error("Error rolling dice:", error);
      stopDiceRollSequence();
      setIsRolling(false);
      setIsThrowAnimation(false);
      isWaitingForResult.current = false;
      return;
    }
  };

  useEffect(() => {
    if (
      isWaitingForResult.current &&
      currentPlayerState?.lastDiceRoll &&
      currentPlayerState.lastDiceRoll.length >= 2
    ) {
      const dice1Value = currentPlayerState.lastDiceRoll[0];
      const dice2Value = currentPlayerState.lastDiceRoll[1];

      console.log("Received dice values:", dice1Value, dice2Value);

      if (
        dice1Value >= 1 &&
        dice1Value <= 6 &&
        dice2Value >= 1 &&
        dice2Value <= 6
      ) {
        // Stop rolling animation
        setIsRolling(false);

        // Set final dice values
        setDice1(dice1Value);
        setDice2(dice2Value);

        // Start throw animation
        setIsThrowAnimation(true);

        // Set final rotations
        if (dice1Ref.current) {
          const [x, y, z] =
            diceRotations[dice1Value as keyof typeof diceRotations];
          dice1Ref.current.style.transform = `rotate3d(${x}, ${y}, ${z}, 180deg)`;
        }

        if (dice2Ref.current) {
          const [x, y, z] =
            diceRotations[dice2Value as keyof typeof diceRotations];
          dice2Ref.current.style.transform = `rotate3d(${x}, ${y}, ${z}, 180deg)`;
        }

        stopDiceRollSequence();

        // Reset states after animation
        setTimeout(() => {
          setIsThrowAnimation(false);
          isWaitingForResult.current = false;
        }, 1000);
      }
    }
  }, [currentPlayerState?.lastDiceRoll]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const contextValue: DiceContextType = {
    dice1,
    dice2,
    isRolling,
    isThrowAnimation,
    canRoll,
    handleRollDice,
    dice1Ref,
    dice2Ref,
  };

  return (
    <DiceContext.Provider value={contextValue}>{children}</DiceContext.Provider>
  );
};

export const useDiceContext = () => {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error("useDiceContext must be used within a DiceProvider");
  }
  return context;
};

export const DicesOnly: React.FC = () => {
  const { dice1, dice2, isRolling, isThrowAnimation, dice1Ref, dice2Ref } =
    useDiceContext();

  const DiceFace = ({
    value,
    className,
  }: {
    value: number;
    className: string;
  }) => (
    <div className={`dice-face ${className}`}>
      {/* Dots are now handled by CSS */}
    </div>
  );

  return (
    <div className="flex justify-center">
      <div className="flex gap-8">
        {/* Dice 1 - 3D */}
        <div className="dice-wrapper">
          <div
            ref={dice1Ref}
            className={`dice-3d dice-1 ${isRolling ? "dice-rolling" : ""} ${
              isThrowAnimation ? "dice-throw" : ""
            }`}
          >
            <DiceFace value={dice1} className="dice-front" />
            <DiceFace value={7 - dice1} className="dice-back" />
            <DiceFace value={((dice1 + 1) % 6) + 1} className="dice-right" />
            <DiceFace value={((dice1 + 2) % 6) + 1} className="dice-left" />
            <DiceFace value={((dice1 + 3) % 6) + 1} className="dice-top" />
            <DiceFace value={((dice1 + 4) % 6) + 1} className="dice-bottom" />
          </div>
        </div>
        {/* Dice 2 - 3D with different animation */}
        <div className="dice-wrapper">
          <div
            ref={dice2Ref}
            className={`dice-3d dice-2 ${isRolling ? "dice-rolling" : ""} ${
              isThrowAnimation ? "dice-throw" : ""
            }`}
          >
            <DiceFace value={dice2} className="dice-front" />
            <DiceFace value={7 - dice2} className="dice-back" />
            <DiceFace value={((dice2 + 1) % 6) + 1} className="dice-right" />
            <DiceFace value={((dice2 + 2) % 6) + 1} className="dice-left" />
            <DiceFace value={((dice2 + 3) % 6) + 1} className="dice-top" />
            <DiceFace value={((dice2 + 4) % 6) + 1} className="dice-bottom" />
          </div>
        </div>
      </div>
    </div>
  );
};
