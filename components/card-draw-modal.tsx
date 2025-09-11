"use client";

import React, { useState, useEffect } from "react";
import { CardData, chanceCards, communityChestCards } from "@/data/monopoly-data";

interface CardDrawModalProps {
    isOpen: boolean;
    cardType: "chance" | "community-chest";
    onClose: () => void;
    onCardDrawn: (card: CardData) => void;
}

export const CardDrawModal: React.FC<CardDrawModalProps> = ({
    isOpen,
    cardType,
    onClose,
    onCardDrawn,
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
    const [showCard, setShowCard] = useState(false);

    const cardDeck = cardType === "chance" ? chanceCards : communityChestCards;
    const cardTitle = cardType === "chance" ? "CHANCE" : "COMMUNITY CHEST";
    const cardColor = cardType === "chance" ? "from-orange-400 to-orange-600" : "from-blue-400 to-blue-600";
    const cardIcon = cardType === "chance" ? "?" : "💰";

    useEffect(() => {
        if (isOpen) {
            setIsSpinning(false);
            setDrawnCard(null);
            setShowCard(false);
        }
    }, [isOpen]);

    const drawCard = () => {
        if (isSpinning) return;

        setIsSpinning(true);

        // Simulate card drawing with simple animation
        setTimeout(() => {
            const randomCard = cardDeck[Math.floor(Math.random() * cardDeck.length)];
            setDrawnCard(randomCard);
            setIsSpinning(false);
            setShowCard(true);
            // Don't automatically apply card effect - let user see the card first
        }, 1000);
    };

    const handleClose = () => {
        setShowCard(false);
        setDrawnCard(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-30"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{cardTitle}</h2>
                        <p className="text-gray-600">Draw a card to see what happens!</p>
                    </div>

                    {/* Card Stack/Spinning Area */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Card Stack Background */}
                            <div className="absolute inset-0 transform rotate-2 translate-x-1 translate-y-1">
                                <div className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-30`}></div>
                            </div>
                            <div className="absolute inset-0 transform -rotate-1 translate-x-0.5 translate-y-0.5">
                                <div className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-50`}></div>
                            </div>

                            {/* Main Card */}
                            <div
                                className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} shadow-lg cursor-pointer transform transition-all duration-500 ${isSpinning ? 'animate-pulse scale-110' : 'hover:scale-105'
                                    } ${showCard ? 'opacity-0' : 'opacity-100'}`}
                                onClick={drawCard}
                            >
                                <div className="flex flex-col items-center justify-center h-full text-white">
                                    <div className="text-4xl mb-2">{cardIcon}</div>
                                    <div className="text-sm font-semibold text-center px-2">
                                        {cardTitle}
                                    </div>
                                    {!isSpinning && (
                                        <div className="text-xs mt-2 opacity-80">Click to draw</div>
                                    )}
                                </div>
                            </div>

                            {/* Spinning indicator */}
                            {isSpinning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-lg font-bold animate-pulse">
                                        Drawing...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawn Card Display */}
                    {showCard && drawnCard && (
                        <div className={`transform transition-all duration-500 ${showCard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {drawnCard.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {drawnCard.description}
                                    </p>

                                    {/* Action indicator */}
                                    {drawnCard.value > 0 && (
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${drawnCard.action.includes('collect') || drawnCard.action.includes('advance-to-go')
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {drawnCard.action.includes('collect') || drawnCard.action.includes('advance-to-go')
                                                ? `+$${drawnCard.value}`
                                                : `-$${drawnCard.value}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-6">
                        {!showCard && !isSpinning && (
                            <button
                                onClick={drawCard}
                                className={`px-6 py-3 bg-gradient-to-r ${cardColor} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 pulse-glow`}
                            >
                                Draw Card
                            </button>
                        )}

                        {showCard && (
                            <button
                                onClick={() => {
                                    if (drawnCard) {
                                        onCardDrawn(drawnCard);
                                    }
                                    handleClose();
                                }}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Apply Card Effect
                            </button>
                        )}

                        {!showCard && (
                            <button
                                onClick={handleClose}
                                className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Decorative elements with floating animation */}
                    <div className="absolute top-2 left-2 text-2xl opacity-20 float-animation">🎲</div>
                    <div className="absolute top-2 right-2 text-2xl opacity-20 float-animation" style={{ animationDelay: '0.5s' }}>🎯</div>
                    <div className="absolute bottom-2 left-2 text-2xl opacity-20 float-animation" style={{ animationDelay: '1s' }}>💎</div>
                    <div className="absolute bottom-2 right-2 text-2xl opacity-20 float-animation" style={{ animationDelay: '1.5s' }}>🏆</div>
                </div>
            </div>
        </div>
    );
};
