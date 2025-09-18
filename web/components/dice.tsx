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
    const [diceTheme, setDiceTheme] = useState<'classic' | 'golden' | 'neon'>('classic');
    
    // State for dice rotation trajectories
    const [dice1Rotation, setDice1Rotation] = useState({ x: -10, y: 15, z: 0 });
    const [dice2Rotation, setDice2Rotation] = useState({ x: -10, y: -15, z: 0 });

    // Dice theme configurations
    const themes = {
        classic: {
            name: 'Classic White',
            gradient: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
            border: '#333',
            dotColor: '#000',
            shadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
            dotShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3), 1px 1px 2px rgba(255, 255, 255, 0.5)'
        },
        golden: {
            name: 'Golden Luxury',
            gradient: 'linear-gradient(145deg, #ffd700 0%, #ffb347 100%)',
            border: '#b8860b',
            dotColor: '#8b4513',
            shadow: '2px 2px 12px rgba(255, 215, 0, 0.6)',
            dotShadow: 'inset 1px 1px 3px rgba(139, 69, 19, 0.4), 1px 1px 2px rgba(255, 255, 255, 0.6)'
        },
        neon: {
            name: 'Neon Glow',
            gradient: 'linear-gradient(145deg, #00ffff 0%, #0080ff 100%)',
            border: '#00bfff',
            dotColor: '#000080',
            shadow: '2px 2px 15px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.4)',
            dotShadow: 'inset 1px 1px 2px rgba(0, 0, 128, 0.5), 1px 1px 3px rgba(255, 255, 255, 0.8), 0 0 5px rgba(0, 255, 255, 0.3)'
        }
    };

    const currentTheme = themes[diceTheme];

    const rollDice = () => {
        if (disabled || isRolling) return;

        setIsRolling(true);

        // Generate different rotation patterns for more variety
        const rotationPatterns = [
            // Pattern 1: Clockwise with bounce
            { 
                dice1: { xMult: 1, yMult: 1, zMult: 0.5, xBase: 360, yBase: 270, zBase: 180 },
                dice2: { xMult: -1, yMult: 1, zMult: -0.5, xBase: 450, yBase: 360, zBase: 270 }
            },
            // Pattern 2: Counter-clockwise with wobble
            { 
                dice1: { xMult: -1, yMult: -1, zMult: 1, xBase: 540, yBase: 720, zBase: 360 },
                dice2: { xMult: 1, yMult: -1, zMult: 0.8, xBase: 630, yBase: 450, zBase: 540 }
            },
            // Pattern 3: Fast spin with slow roll
            { 
                dice1: { xMult: 0.5, yMult: 2, zMult: -1, xBase: 270, yBase: 900, zBase: 450 },
                dice2: { xMult: 2, yMult: 0.5, zMult: 1.5, xBase: 720, yBase: 540, zBase: 720 }
            },
            // Pattern 4: Erratic tumbling
            { 
                dice1: { xMult: 1.5, yMult: -0.8, zMult: 2, xBase: 810, yBase: 360, zBase: 630 },
                dice2: { xMult: -1.2, yMult: 1.8, zMult: -0.6, xBase: 450, yBase: 810, zBase: 270 }
            }
        ];

        // Randomly select a rotation pattern
        const selectedPattern = rotationPatterns[Math.floor(Math.random() * rotationPatterns.length)];

        // Dice rolling animation with selected pattern
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            setDice1(Math.floor(Math.random() * 6) + 1);
            setDice2(Math.floor(Math.random() * 6) + 1);
            
            // Calculate rotation progress (0 to 1)
            const progress = rollCount / 10;
            
            // Apply easing function for more natural movement
            const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            const easedProgress = easeInOut(progress);
            
            // Update dice rotations with pattern and easing
            setDice1Rotation({
                x: selectedPattern.dice1.xBase * easedProgress * selectedPattern.dice1.xMult + Math.sin(progress * Math.PI * 4) * 20,
                y: selectedPattern.dice1.yBase * easedProgress * selectedPattern.dice1.yMult + Math.cos(progress * Math.PI * 6) * 15,
                z: selectedPattern.dice1.zBase * easedProgress * selectedPattern.dice1.zMult + Math.sin(progress * Math.PI * 8) * 10
            });

            setDice2Rotation({
                x: selectedPattern.dice2.xBase * easedProgress * selectedPattern.dice2.xMult + Math.cos(progress * Math.PI * 5) * 20,
                y: selectedPattern.dice2.yBase * easedProgress * selectedPattern.dice2.yMult + Math.sin(progress * Math.PI * 7) * 15,
                z: selectedPattern.dice2.zBase * easedProgress * selectedPattern.dice2.zMult + Math.cos(progress * Math.PI * 9) * 10
            });

            rollCount++;

            if (rollCount >= 10) {
                clearInterval(rollInterval);

                // Final result
                const finalDice1 = Math.floor(Math.random() * 6) + 1;
                const finalDice2 = Math.floor(Math.random() * 6) + 1;

                setDice1(finalDice1);
                setDice2(finalDice2);
                setIsRolling(false);

                // Set final resting positions with slight random variation
                setDice1Rotation({
                    x: -10 + (Math.random() - 0.5) * 20,
                    y: 15 + (Math.random() - 0.5) * 30,
                    z: (Math.random() - 0.5) * 15
                });
                setDice2Rotation({
                    x: -10 + (Math.random() - 0.5) * 20,
                    y: -15 + (Math.random() - 0.5) * 30,
                    z: (Math.random() - 0.5) * 15
                });

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
                    className="absolute w-2.5 h-2.5 rounded-full"
                    style={{
                        left: `${pos[0]}%`,
                        top: `${pos[1]}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: currentTheme.dotColor,
                        boxShadow: currentTheme.dotShadow
                    }}
                />
            );
        });

        return dots;
    };

    const DiceFace = ({ value, className }: { value: number; className: string }) => (
        <div 
            className={`dice-face ${className}`}
            style={{
                background: currentTheme.gradient,
                borderColor: currentTheme.border,
                boxShadow: `inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.1), ${currentTheme.shadow}`
            }}
        >
            {getDiceFace(value)}
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Theme Selector */}
            <div className="flex gap-1 sm:gap-2 mb-2">
                {(Object.keys(themes) as Array<keyof typeof themes>).map((theme) => (
                    <button
                        key={theme}
                        onClick={() => setDiceTheme(theme)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-full transition-all min-h-[36px] sm:min-h-[44px] min-w-[50px] sm:min-w-[60px] ${
                            diceTheme === theme
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        disabled={isRolling}
                    >
                        {themes[theme].name}
                    </button>
                ))}
            </div>
            
            <div className="flex gap-4 perspective-1000">
                {/* Dice 1 - 3D */}
                <div className="dice-container">
                    <div
                        className={`dice-3d ${isRolling ? 'dice-rolling' : ''}`}
                        style={{
                            transform: `rotateX(${dice1Rotation.x}deg) rotateY(${dice1Rotation.y}deg) rotateZ(${dice1Rotation.z}deg)`,
                            transition: isRolling ? 'none' : 'transform 0.5s ease-out'
                        }}
                    >
                        <DiceFace value={dice1} className="dice-front" />
                        <DiceFace value={7 - dice1} className="dice-back" />
                        <DiceFace value={(dice1 + 1) % 6 + 1} className="dice-right" />
                        <DiceFace value={(dice1 + 2) % 6 + 1} className="dice-left" />
                        <DiceFace value={(dice1 + 3) % 6 + 1} className="dice-top" />
                        <DiceFace value={(dice1 + 4) % 6 + 1} className="dice-bottom" />
                    </div>
                </div>

                {/* Dice 2 - 3D */}
                <div className="dice-container">
                    <div
                        className={`dice-3d ${isRolling ? 'dice-rolling' : ''}`}
                        style={{
                            transform: `rotateX(${dice2Rotation.x}deg) rotateY(${dice2Rotation.y}deg) rotateZ(${dice2Rotation.z}deg)`,
                            transition: isRolling ? 'none' : 'transform 0.5s ease-out'
                        }}
                    >
                        <DiceFace value={dice2} className="dice-front" />
                        <DiceFace value={7 - dice2} className="dice-back" />
                        <DiceFace value={(dice2 + 1) % 6 + 1} className="dice-right" />
                        <DiceFace value={(dice2 + 2) % 6 + 1} className="dice-left" />
                        <DiceFace value={(dice2 + 3) % 6 + 1} className="dice-top" />
                        <DiceFace value={(dice2 + 4) % 6 + 1} className="dice-bottom" />
                    </div>
                </div>
            </div>

            <button
                onClick={rollDice}
                disabled={disabled || isRolling}
                className={`z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu outline-none px-4 min-w-20 gap-2 transition-transform-colors-opacity motion-reduce:transition-none w-full text-center h-12 rounded-full text-white font-medium border-b-2 transition-transform text-base font-cherry-bomb shadow-lg ${disabled || isRolling
                    ? 'bg-gray-400 border-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-[#4BD467] border-[#27AC4B] hover:opacity-85 active:scale-[98%] hover:shadow-xl'
                    }`}
                style={{ fontFamily: 'var(--font-cherry-bomb-one)' }}
            >
                {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
            </button>

            <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">
                    Total: {dice1 + dice2}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                    ({dice1} + {dice2})
                </div>
            </div>
        </div>
    );
};
