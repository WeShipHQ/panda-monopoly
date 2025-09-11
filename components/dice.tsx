"use client";

import React, { useState } from "react";

interface DiceProps {
    onRoll: (total: number, dice1: number, dice2: number) => void;
    disabled?: boolean;
}

export const Dice: React.FC<DiceProps> = ({ onRoll, disabled = false }) => {
    const [dice1, setDice1] = useState(1);
    const [dice2, setDice2] = useState(1);
    const [isRolling, setIsRolling] = useState(false);

    const rollDice = () => {
        if (disabled || isRolling) return;

        setIsRolling(true);

        // Dice rolling animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            setDice1(Math.floor(Math.random() * 6) + 1);
            setDice2(Math.floor(Math.random() * 6) + 1);
            rollCount++;

            if (rollCount >= 10) {
                clearInterval(rollInterval);

                // Final result
                const finalDice1 = Math.floor(Math.random() * 6) + 1;
                const finalDice2 = Math.floor(Math.random() * 6) + 1;

                setDice1(finalDice1);
                setDice2(finalDice2);
                setIsRolling(false);

                onRoll(finalDice1 + finalDice2, finalDice1, finalDice2);
            }
        }, 100);
    };

    const getDiceFace = (value: number) => {
        const dots: React.ReactNode[] = [];
        const positions = [
            [], // 0 - not used
            [[50, 50]], // 1
            [[25, 25], [75, 75]], // 2
            [[25, 25], [50, 50], [75, 75]], // 3
            [[25, 25], [75, 25], [25, 75], [75, 75]], // 4
            [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], // 5
            [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]], // 6
        ];

        positions[value]?.forEach((pos, index) => {
            dots.push(
                <div
                    key={index}
                    className="absolute w-2 h-2 bg-black rounded-full"
                    style={{
                        left: `${pos[0]}%`,
                        top: `${pos[1]}%`,
                        transform: 'translate(-50%, -50%)',
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
                    className={`relative w-16 h-16 bg-white border-2 border-gray-800 rounded-lg shadow-lg ${isRolling ? 'animate-bounce' : ''
                        }`}
                >
                    {getDiceFace(dice1)}
                </div>

                {/* Dice 2 */}
                <div
                    className={`relative w-16 h-16 bg-white border-2 border-gray-800 rounded-lg shadow-lg ${isRolling ? 'animate-bounce' : ''
                        }`}
                >
                    {getDiceFace(dice2)}
                </div>
            </div>

            <button
                onClick={rollDice}
                disabled={disabled || isRolling}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${disabled || isRolling
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                    }`}
            >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>

            <div className="text-center">
                <div className="text-lg font-bold">
                    Total: {dice1 + dice2}
                </div>
                <div className="text-sm text-gray-600">
                    ({dice1} + {dice2})
                </div>
            </div>
        </div>
    );
};
