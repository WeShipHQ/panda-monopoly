"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { useGameContext } from "@/components/game-provider";
// import { CardData, surpriseCards, treasureCards } from "@/data/monopoly-data";
import { cn } from "@/lib/utils";
import { CardData } from "@/types/space-types";
import { surpriseCards, treasureCards } from "@/configs/board-data";

interface CardDrawModalProps {
  isOpen: boolean;
  cardType: "chance" | "community-chest";
  onClose?: () => void;
}

export const CardDrawModal: React.FC<CardDrawModalProps> = ({
  isOpen,
  cardType,
  onClose,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "drawing" | "revealing" | "complete"
  >("idle");

  const [rollingCards, setRollingCards] = useState<CardData[]>([]);
  const [rollingIndex, setRollingIndex] = useState(0);
  const rollingTimerRef = React.useRef<number | null>(null);

  const {
    drawChanceCard,
    drawCommunityChestCard,
    latestCardDraw,
    acknowledgeCardDraw,
  } = useGameContext();

  const [isFlipped, setIsFlipped] = useState(false);

  const cardDeck = cardType === "chance" ? surpriseCards : treasureCards;
  const cardTitle = cardType === "chance" ? "SURPRISE DECK" : "TREASURE CHEST";
  const cardSubtitle =
    cardType === "chance" ? "Pump.fun Surprise" : "Airdrop Chest";
  const cardColor =
    cardType === "chance"
      ? "from-purple-500 to-pink-600"
      : "from-blue-500 to-cyan-600";
  const cardIcon = cardType === "chance" ? "🚀" : "🪂";

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setIsDrawing(false);
      setDrawnCard(null);
      setShowCard(false);
      setAnimationPhase("idle");
      setIsFlipped(false);
      setRollingCards(cardDeck);
      setRollingIndex(0);
      if (rollingTimerRef.current) {
        window.clearInterval(rollingTimerRef.current);
        rollingTimerRef.current = null;
      }
    } else {
      // Cleanup on close
      if (rollingTimerRef.current) {
        window.clearInterval(rollingTimerRef.current);
        rollingTimerRef.current = null;
      }
    }
  }, [isOpen, cardDeck]);

  // Listen for card draw events from the blockchain
  useEffect(() => {
    if (!latestCardDraw || !isDrawing) return;

    // Filter by event type so the modal doesn't react to the other deck's events
    const isChance = latestCardDraw.type === "ChanceCardDrawn";
    const isChest = latestCardDraw.type === "CommunityChestCardDrawn";
    if (
      (cardType === "chance" && !isChance) ||
      (cardType === "community-chest" && !isChest)
    ) {
      return;
    }

    const cardIndex = latestCardDraw.data.cardIndex ?? 0;
    const card = cardDeck[cardIndex];

    // Stop rolling and reveal card
    if (rollingTimerRef.current) {
      window.clearInterval(rollingTimerRef.current);
      rollingTimerRef.current = null;
    }

    if (card) {
      setDrawnCard(card);
      setAnimationPhase("revealing");

      // Show the card after a brief delay for smoothness
      setTimeout(() => {
        setShowCard(true);
        setAnimationPhase("complete");
        setIsDrawing(false);
        // We are already flipped at this point; ensure it stays front-facing
        setIsFlipped(true);
      }, 500);
    }
  }, [latestCardDraw, isDrawing, cardDeck, cardType]);

  const startRolling = React.useCallback(() => {
    // Cycle quickly through deck while waiting for the chain event
    if (rollingTimerRef.current) {
      window.clearInterval(rollingTimerRef.current);
    }
    rollingTimerRef.current = window.setInterval(() => {
      setRollingIndex(
        (prev) => (prev + 1) % Math.max(rollingCards.length || 1, 1)
      );
    }, 120);
  }, [rollingCards.length]);

  const drawCard = async () => {
    if (isDrawing) return;

    // Begin drawing UX
    setIsDrawing(true);
    setAnimationPhase("drawing");
    setIsFlipped(true);
    startRolling();

    try {
      // Invoke the appropriate on-chain instruction
      if (cardType === "chance") {
        await drawChanceCard();
      } else {
        await drawCommunityChestCard();
      }

      // Result will be revealed when the event arrives (latestCardDraw)
    } catch (error) {
      console.error("Error drawing card:", error);
      // Stop rolling and revert
      if (rollingTimerRef.current) {
        window.clearInterval(rollingTimerRef.current);
        rollingTimerRef.current = null;
      }
      setIsDrawing(false);
      setAnimationPhase("idle");
      setIsFlipped(false);
    }
  };

  const handleCardClick = async () => {
    if (!isDrawing && !drawnCard) {
      await drawCard();
      return;
    }
  };

  const handleClose = () => {
    setShowCard(false);
    setDrawnCard(null);
    setAnimationPhase("idle");
    if (rollingTimerRef.current) {
      window.clearInterval(rollingTimerRef.current);
      rollingTimerRef.current = null;
    }
    if (latestCardDraw) {
      acknowledgeCardDraw();
    }
    onClose?.();
  };

  // const handleApplyCard = () => {
  //   if (drawnCard) {
  //     onCardDrawn?.(drawnCard);
  //   }
  //   handleClose();
  // };

  const displayCard: CardData | null =
    drawnCard ?? (isDrawing ? cardDeck[rollingIndex] : null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="!max-w-xs aspect-[3/4] w-full bg-transparent border-none shadow-none outline-none p-0"
        showCloseButton={false}
      >
        <div
          className="w-full h-full relative transition-transform duration-700 transform cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={handleCardClick}
        >
          {/* Card back */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full bg-gradient-to-br rounded-xl border-2 border-purple-400 flex items-center justify-center backface-hidden",
              cardColor
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                {cardIcon}
              </div>
              <p className="text-purple-200 font-semibold">{cardTitle}</p>
              <p className="text-purple-300 text-sm mt-2">{cardSubtitle}</p>
              {!isFlipped && (
                <p className="text-xs text-purple-100/80 mt-4 animate-pulse">
                  Tap to draw
                </p>
              )}
            </div>
          </div>

          {/* Card front */}
          <div
            className={`absolute inset-0 w-full h-full bg-gradient-to-br ${cardColor} rounded-xl border-2 border-gray-300 p-4 text-white backface-hidden`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-balance">
                  {displayCard ? displayCard.title : "Drawing..."}
                </h3>
                <span className="text-sm px-2 py-1 rounded bg-white/20">
                  {cardType === "chance" ? "CHANCE" : "COMMUNITY CHEST"}
                </span>
              </div>

              <div className="flex-1 rounded-lg p-3 mb-4 bg-white/10">
                <div className="w-full h-32 rounded mb-3 flex items-center justify-center bg-white/20">
                  {/* Simple visual flourish while drawing */}
                  {animationPhase === "drawing" && !drawnCard ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl animate-bounce">🎴</span>
                      <span className="text-sm opacity-80 animate-pulse">
                        Shuffling...
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl opacity-70">🎴</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    {displayCard
                      ? displayCard.action.replaceAll("-", " ").toUpperCase()
                      : "PENDING"}
                  </span>
                  <span className="font-semibold">
                    {displayCard
                      ? displayCard.value
                        ? `±$${displayCard.value}`
                        : "—"
                      : "—"}
                  </span>
                </div>
                <p className="text-sm text-white/90">
                  {displayCard
                    ? displayCard.description
                    : "Waiting for on-chain result..."}
                </p>
              </div>

              {/* Confirm button if you want the player to acknowledge after reveal */}
              {/* {animationPhase === "complete" && drawnCard && (
                <button
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-white/20 px-3 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
                  onClick={handleApplyCard}
                >
                  Acknowledge
                </button>
              )} */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   CardData,
//   chanceCards,
//   communityChestCards,
// } from "@/data/monopoly-data";

// interface CardDrawModalProps {
//   isOpen: boolean;
//   cardType: "chance" | "community-chest";
//   onCardDrawn: (card: CardData) => void;
// }

// export const CardDrawModal: React.FC<CardDrawModalProps> = ({
//   isOpen,
//   cardType,
//   onCardDrawn,
// }) => {
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
//   const [showCard, setShowCard] = useState(false);
//   const [isRolling, setIsRolling] = useState(false);
//   const [rollingCards, setRollingCards] = useState<CardData[]>([]);

//   const cardDeck = cardType === "chance" ? chanceCards : communityChestCards;
//   const cardTitle = cardType === "chance" ? "CHANCE" : "COMMUNITY CHEST";
//   const cardColor =
//     cardType === "chance"
//       ? "from-orange-400 to-orange-600"
//       : "from-blue-400 to-blue-600";
//   const cardIcon = cardType === "chance" ? "?" : "💰";

//   useEffect(() => {
//     if (isOpen) {
//       setIsSpinning(false);
//       setDrawnCard(null);
//       setShowCard(false);
//       setIsRolling(false);
//       setRollingCards([]);
//     }
//   }, [isOpen]);

//   const drawCard = () => {
//     if (isSpinning || isRolling) return;

//     setIsRolling(true);

//     // Generate rolling cards - mix of random cards for animation
//     const shuffledDeck = [...cardDeck].sort(() => Math.random() - 0.5);
//     const rollingCardsList = shuffledDeck.slice(0, 8); // Show 8 cards rolling
//     setRollingCards(rollingCardsList);

//     // After rolling animation, show the final card
//     setTimeout(() => {
//       const randomCard = cardDeck[Math.floor(Math.random() * cardDeck.length)];
//       setDrawnCard(randomCard);
//       setIsRolling(false);
//       setShowCard(true);
//     }, 2000); // 2 second rolling animation
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
//         {/* Background decoration */}
//         <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-30"></div>

//         <div className="relative z-10">
//           {/* Header */}
//           <div className="text-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">
//               {cardTitle}
//             </h2>
//             <p className="text-gray-600">Draw a card to see what happens!</p>
//           </div>

//           {/* Card Rolling Area */}
//           <div className="flex justify-center mb-6">
//             {!isRolling && !showCard && (
//               <div className="relative">
//                 {/* Card Stack Background */}
//                 <div className="absolute inset-0 transform rotate-2 translate-x-1 translate-y-1">
//                   <div
//                     className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-30`}
//                   ></div>
//                 </div>
//                 <div className="absolute inset-0 transform -rotate-1 translate-x-0.5 translate-y-0.5">
//                   <div
//                     className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} opacity-50`}
//                   ></div>
//                 </div>

//                 {/* Main Card */}
//                 <div
//                   className={`w-40 h-56 rounded-lg bg-gradient-to-br ${cardColor} shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105`}
//                   onClick={drawCard}
//                 >
//                   <div className="flex flex-col items-center justify-center h-full text-white">
//                     <div className="text-4xl mb-2">{cardIcon}</div>
//                     <div className="text-sm font-semibold text-center px-2">
//                       {cardTitle}
//                     </div>
//                     <div className="text-xs mt-2 opacity-80">Click to draw</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Rolling Cards Animation */}
//             {isRolling && (
//               <div className="relative w-full h-56 overflow-hidden">
//                 <div className="flex animate-scroll-horizontal">
//                   {rollingCards.concat(rollingCards).map((card, index) => (
//                     <div
//                       key={`${card.title}-${index}`}
//                       className={`flex-shrink-0 w-32 h-48 mx-2 rounded-lg bg-gradient-to-br ${cardColor} shadow-lg`}
//                     >
//                       <div className="flex flex-col items-center justify-center h-full text-white p-2">
//                         <div className="text-2xl mb-1">{cardIcon}</div>
//                         <div className="text-xs font-semibold text-center mb-1">
//                           {card.title}
//                         </div>
//                         <div className="text-xs text-center opacity-80 leading-tight">
//                           {card.description.length > 50
//                             ? `${card.description.substring(0, 50)}...`
//                             : card.description}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Drawn Card Display */}
//           {showCard && drawnCard && (
//             <div
//               className={`transform transition-all duration-500 ${showCard ? "opacity-100 scale-100" : "opacity-0 scale-95"
//                 }`}
//             >
//               <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
//                 <div className="text-center">
//                   <h3 className="text-lg font-bold text-gray-800 mb-2">
//                     {drawnCard.title}
//                   </h3>
//                   <p className="text-gray-600 mb-4">{drawnCard.description}</p>

//                   {/* Action indicator */}
//                   {drawnCard.value > 0 && (
//                     <div
//                       className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${drawnCard.action.includes("collect") ||
//                           drawnCard.action.includes("advance-to-go")
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                         }`}
//                     >
//                       {drawnCard.action.includes("collect") ||
//                         drawnCard.action.includes("advance-to-go")
//                         ? `+$${drawnCard.value}`
//                         : `-$${drawnCard.value}`}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex justify-center gap-4 mt-6">
//             {!showCard && !isRolling && (
//               <button
//                 onClick={drawCard}
//                 className={`px-6 py-3 bg-gradient-to-r ${cardColor} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 pulse-glow`}
//               >
//                 Draw Card
//               </button>
//             )}

//             {isRolling && (
//               <div className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg opacity-75">
//                 Rolling...
//               </div>
//             )}

//             {showCard && (
//               <button
//                 onClick={() => {
//                   if (drawnCard) {
//                     onCardDrawn(drawnCard);
//                     // Don't call handleClose() - let the game logic handle modal closing
//                   }
//                 }}
//                 className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//               >
//                 Apply Card Effect
//               </button>
//             )}
//           </div>

//           {/* Decorative elements with floating animation */}
//           <div className="absolute top-2 left-2 text-2xl opacity-20 float-animation">
//             🎲
//           </div>
//           <div
//             className="absolute top-2 right-2 text-2xl opacity-20 float-animation"
//             style={{ animationDelay: "0.5s" }}
//           >
//             🎯
//           </div>
//           <div
//             className="absolute bottom-2 left-2 text-2xl opacity-20 float-animation"
//             style={{ animationDelay: "1s" }}
//           >
//             💎
//           </div>
//           <div
//             className="absolute bottom-2 right-2 text-2xl opacity-20 float-animation"
//             style={{ animationDelay: "1.5s" }}
//           >
//             🏆
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
