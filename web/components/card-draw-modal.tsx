"use client";

import React, { useState, useEffect } from "react";
import {
  CardData,
  chanceCards,
  communityChestCards,
} from "@/data/monopoly-data";

interface CardDrawModalProps {
  isOpen: boolean;
  cardType: "chance" | "community-chest";
  onCardDrawn: (card: CardData) => void;
}

export const CardDrawModal: React.FC<CardDrawModalProps> = ({
  isOpen,
  cardType,
  onCardDrawn,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingCards, setRollingCards] = useState<CardData[]>([]);

  const cardDeck = cardType === "chance" ? chanceCards : communityChestCards;
  const cardTitle = cardType === "chance" ? "CHANCE" : "COMMUNITY CHEST";
  const cardColor =
    cardType === "chance"
      ? "from-orange-400 to-orange-600"
      : "from-blue-400 to-blue-600";
  const cardIcon = cardType === "chance" ? "?" : "💰";

  useEffect(() => {
    if (isOpen) {
      setIsSpinning(false);
      setDrawnCard(null);
      setShowCard(false);
      setIsRolling(false);
      setRollingCards([]);
    }
  }, [isOpen]);

  const drawCard = () => {
    if (isSpinning || isRolling) return;

    setIsRolling(true);
    
    // Generate rolling cards - mix of random cards for animation
    const shuffledDeck = [...cardDeck].sort(() => Math.random() - 0.5);
    const rollingCardsList = shuffledDeck.slice(0, 8); // Show 8 cards rolling
    setRollingCards(rollingCardsList);

    // After rolling animation, show the final card
    setTimeout(() => {
      const randomCard = cardDeck[Math.floor(Math.random() * cardDeck.length)];
      setDrawnCard(randomCard);
      setIsRolling(false);
      setShowCard(true);
    }, 2000); // 2 second rolling animation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-30"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {cardTitle}
            </h2>
            <p className="text-gray-600">Draw a card to see what happens!</p>
          </div>

          {/* Card Rolling Area */}
          <div className="flex justify-center mb-6">
            {!isRolling && !showCard && (
              <div className="relative">
                {/* Card Stack Background */}
                <div className="absolute inset-0 transform rotate-2 translate-x-1 translate-y-1">
                  <div
                    className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-30`}
                  ></div>
                </div>
                <div className="absolute inset-0 transform -rotate-1 translate-x-0.5 translate-y-0.5">
                  <div
                    className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-50`}
                  ></div>
                </div>

                {/* Main Card */}
                <div
                  className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105`}
                  onClick={drawCard}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <div className="text-4xl mb-2">{cardIcon}</div>
                    <div className="text-sm font-semibold text-center px-2">
                      {cardTitle}
                    </div>
                    <div className="text-xs mt-2 opacity-80">Click to draw</div>
                  </div>
                </div>
              </div>
            )}

            {/* Rolling Cards Animation */}
            {isRolling && (
              <div className="relative w-full h-56 overflow-hidden">
                <div className="flex animate-scroll-horizontal">
                  {rollingCards.concat(rollingCards).map((card, index) => (
                    <div
                      key={`${card.title}-${index}`}
                      className={`flex-shrink-0 w-32 h-48 mx-2 rounded-lg bg-gradient-to-br ${cardColor} shadow-lg`}
                    >
                      <div className="flex flex-col items-center justify-center h-full text-white p-2">
                        <div className="text-2xl mb-1">{cardIcon}</div>
                        <div className="text-xs font-semibold text-center mb-1">
                          {card.title}
                        </div>
                        <div className="text-xs text-center opacity-80 leading-tight">
                          {card.description.length > 50 
                            ? `${card.description.substring(0, 50)}...` 
                            : card.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawn Card Display */}
          {showCard && drawnCard && (
            <div
              className={`transform transition-all duration-500 ${showCard ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {drawnCard.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{drawnCard.description}</p>

                  {/* Action indicator */}
                  {drawnCard.value > 0 && (
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${drawnCard.action.includes("collect") ||
                          drawnCard.action.includes("advance-to-go")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {drawnCard.action.includes("collect") ||
                        drawnCard.action.includes("advance-to-go")
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
            {!showCard && !isRolling && (
              <button
                onClick={drawCard}
                className={`px-6 py-3 bg-gradient-to-r ${cardColor} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 pulse-glow`}
              >
                Draw Card
              </button>
            )}

            {isRolling && (
              <div className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg opacity-75">
                Rolling...
              </div>
            )}

            {showCard && (
              <button
                onClick={() => {
                  if (drawnCard) {
                    onCardDrawn(drawnCard);
                    // Don't call handleClose() - let the game logic handle modal closing
                  }
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Apply Card Effect
              </button>
            )}
          </div>

          {/* Decorative elements with floating animation */}
          <div className="absolute top-2 left-2 text-2xl opacity-20 float-animation">
            🎲
          </div>
          <div
            className="absolute top-2 right-2 text-2xl opacity-20 float-animation"
            style={{ animationDelay: "0.5s" }}
          >
            🎯
          </div>
          <div
            className="absolute bottom-2 left-2 text-2xl opacity-20 float-animation"
            style={{ animationDelay: "1s" }}
          >
            💎
          </div>
          <div
            className="absolute bottom-2 right-2 text-2xl opacity-20 float-animation"
            style={{ animationDelay: "1.5s" }}
          >
            🏆
          </div>
        </div>
      </div>
    </div>
  );
};
