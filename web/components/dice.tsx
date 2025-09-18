"use client";

import React, { useState } from "react";
import { playDiceRollSequence, playThemeChangeSound, playSound } from "../lib/soundUtil";

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
        
        // Play dice roll sound sequence
        playDiceRollSequence();

        // Simplified rotation patterns for better performance
        const rotationPatterns = [
            // Pattern 1: Simple clockwise
            {
                dice1: { xMult: 1, yMult: 0.8, xBase: 720, yBase: 540 },
                dice2: { xMult: -0.8, yMult: 1, xBase: 900, yBase: 720 }
            },
            // Pattern 2: Counter-clockwise
            {
                dice1: { xMult: -1, yMult: -0.9, xBase: 900, yBase: 810 },
                dice2: { xMult: 0.9, yMult: -0.8, xBase: 810, yBase: 720 }
            },
            // Pattern 3: Balanced
            {
                dice1: { xMult: 0.7, yMult: 1.1, xBase: 630, yBase: 990 },
                dice2: { xMult: 1.2, yMult: 0.6, xBase: 1080, yBase: 540 }
            }
        ];

        // Randomly select a rotation pattern
        const selectedPattern = rotationPatterns[Math.floor(Math.random() * rotationPatterns.length)];

        // Use requestAnimationFrame for smoother animation
        const startTime = performance.now();
        const animationDuration = 1000; // 1 second duration
        let lastFaceUpdateTime = 0;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // Update dice faces less frequently to reduce lag
            if (currentTime - lastFaceUpdateTime > 80 && progress < 0.8) { // Every 80ms
                setDice1(Math.floor(Math.random() * 6) + 1);
                setDice2(Math.floor(Math.random() * 6) + 1);
                lastFaceUpdateTime = currentTime;
            }

            // Smoother easing with less computation
            const easeOut = 1 - Math.pow(1 - progress, 2);
            
            // Minimal oscillation for better performance
            const wobble = Math.sin(progress * Math.PI * 4) * (1 - progress) * 5;

            // Simplified rotation calculations
            setDice1Rotation({
                x: selectedPattern.dice1.xBase * easeOut * selectedPattern.dice1.xMult + wobble,
                y: selectedPattern.dice1.yBase * easeOut * selectedPattern.dice1.yMult + wobble * 0.7,
                z: wobble * 0.5
            });

            setDice2Rotation({
                x: selectedPattern.dice2.xBase * easeOut * selectedPattern.dice2.xMult - wobble,
                y: selectedPattern.dice2.yBase * easeOut * selectedPattern.dice2.yMult - wobble * 0.7,
                z: -wobble * 0.5
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                const finalDice1 = Math.floor(Math.random() * 6) + 1;
                const finalDice2 = Math.floor(Math.random() * 6) + 1;

                setDice1(finalDice1);
                setDice2(finalDice2);

                // Smooth return to original position
                setTimeout(() => {
                    setDice1Rotation({ x: 0, y: 0, z: 0 });
                    setDice2Rotation({ x: 0, y: 0, z: 0 });
                    setIsRolling(false);
                    onRoll(finalDice1 + finalDice2, finalDice1, finalDice2);
                }, 200);
            }
        };

        requestAnimationFrame(animate);
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
                        onClick={() => {
                            setDiceTheme(theme);
                            playThemeChangeSound();
                        }}
                        onMouseEnter={() => playSound("button-hover", 0.3)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-full transition-all min-h-[36px] sm:min-h-[44px] min-w-[50px] sm:min-w-[60px] ${diceTheme === theme
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
                            transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            willChange: isRolling ? 'transform' : 'auto',
                            backfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d'
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
                            transform: `rotateX(${dice1Rotation.x}deg) rotateY(${dice1Rotation.y}deg) rotateZ(${dice1Rotation.z}deg)`,
                            transition: isRolling ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            willChange: isRolling ? 'transform' : 'auto',
                            backfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d'
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
                onMouseEnter={() => !disabled && !isRolling && playSound("button-hover", 0.2)}
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
