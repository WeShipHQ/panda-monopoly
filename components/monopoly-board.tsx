"use client";

import React, { useState } from "react";
import {
  PropertySpace,
  ChanceSpace,
  CommunityChestSpace,
} from "@/components/board-spaces";
import { monopolyData, PropertyData, boardSpaces } from "@/data/monopoly-data";
import { PlayerTokensContainer } from "@/components/player-tokens";
import { Dice } from "@/components/dice";
import {
  PropertyDialog,
  SpecialCardDialog,
  JailDialog,
} from "@/components/property-dialog";
import { CardDrawModal } from "@/components/card-draw-modal";
import { PropertyIndicatorsContainer } from "@/components/property-indicators";
import { MessageDisplay } from "@/components/message-display";

const renderSpace = (space: PropertyData, index: number) => {
  const key = `${space.name}-${index}`;

  if (space.type === "property") {
    return (
      <PropertySpace
        key={key}
        name={space.name}
        price={space.price}
        colorClass={space.colorClass}
        rotate={space.rotate}
        longName={space.longName}
        threeLines={space.threeLines}
      />
    );
  } else if (space.type === "chance") {
    return (
      <ChanceSpace key={key} rotate={space.rotate} blueIcon={space.blueIcon} />
    );
  } else if (space.type === "community-chest") {
    return <CommunityChestSpace key={key} rotate={space.rotate} />;
  }

  return null;
};

interface MonopolyBoardProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  gameManager: ReturnType<typeof import("@/hooks").useGameManager>;
}

const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  boardRotation,
  onRotateClockwise,
  onRotateCounterClockwise,
  gameManager,
}) => {
  const [currentDialogVisible, setCurrentDialogVisible] = useState(true);
  const {
    gameState,
    handleDiceRoll,
    currentPlayer,
    buyProperty,
    skipProperty,
    handleSpecialCard,
    handleCardDrawn,
    closeCardModal,
    payJailFine,
    useJailFreeCard,
    drawnCards,
  } = gameManager;

  // Reset dialog visibility when action changes
  React.useEffect(() => {
    if (gameState.currentAction) {
      setCurrentDialogVisible(true);
    }
  }, [gameState.currentAction]);

  return (
    <div
      className="h-screen w-full monopoly-board overflow-hidden"
      style={{
        backgroundImage: 'url("/images/monopoly-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Message Display */}
      <MessageDisplay message={gameState.currentMessage} />

      {/* Board Container */}
      <div className="h-full flex items-center justify-center p-4">
        <div
          className="relative aspect-square h-full max-h-screen w-auto bg-black border-2 border-black transition-transform duration-500 ease-in-out"
          style={{ transform: `rotate(${boardRotation}deg)` }}
        >
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 gap-[0.2%] p-[0.2%]">
            {/* Player Tokens */}
            <PlayerTokensContainer
              players={gameState.players}
              boardRotation={boardRotation}
            />

            {/* Property Indicators */}
            <PropertyIndicatorsContainer
              propertyOwnership={gameState.propertyOwnership}
              players={gameState.players}
              propertyBuildings={gameState.propertyBuildings}
              mortgagedProperties={gameState.mortgagedProperties}
            />

            {/* Center */}
            <div className="col-start-2 col-end-7 row-start-2 row-end-7 bg-[#fafaf8] grid grid-cols-3 grid-rows-3 justify-items-center items-center">
              <h1 className="col-start-1 col-end-4 row-start-2 center-title">
                MONOPOLY
              </h1>
            </div>

            {/* Corner Spaces */}
            <div className="col-start-7 row-start-7 bg-[#fafaf8] text-center">
              <div className="corner-space transform">
                <div className="px-2 text-sx">
                  Collect $200.00 salary as you pass
                </div>
                <div className="icon-large text-[#f50c2b] font-bold">GO</div>
              </div>
            </div>

            <div className="col-start-1 row-start-7 bg-[#fafaf8] text-center flex items-center justify-center">
              <div className="corner-space flex items-center justify-center">
                <img
                  src="/images/JAIL.png"
                  alt="Jail"
                  className="w-35 h-35 object-contain"
                />
              </div>
            </div>

            <div className="col-start-1 row-start-1 bg-[#fafaf8] text-center flex items-center justify-center">
              <div className="corner-space flex items-center justify-center">
                <img
                  src="/images/FREEPARKING.png"
                  alt="Free Parking"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <div className="col-start-7 row-start-1 bg-[#fafaf8] text-center flex items-center justify-center">
              <div className="corner-space flex items-center justify-center">
                <img
                  src="/images/GOTOJAIL.png"
                  alt="Go To Jail"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="col-start-2 col-end-7 row-start-7 grid grid-cols-5 grid-rows-1 gap-[0.2%]">
              {monopolyData.bottomRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Left Row */}
            <div className="col-start-1 row-start-2 row-end-7 grid grid-cols-1 grid-rows-5 gap-[0.2%]">
              {monopolyData.leftRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Top Row */}
            <div className="col-start-2 col-end-7 row-start-1 grid grid-cols-5 grid-rows-1 gap-[0.2%]">
              {monopolyData.topRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Right Row */}
            <div className="col-start-7 row-start-2 row-end-7 grid grid-cols-1 grid-rows-5 gap-[0.2%]">
              {monopolyData.rightRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Dialog */}
      <PropertyDialog
        isOpen={
          currentDialogVisible &&
          gameState.gamePhase === "property-action" &&
          gameState.currentAction?.type === "buy-property"
        }
        propertyName={
          gameState.currentAction?.data?.position
            ? boardSpaces[gameState.currentAction.data.position]?.name ||
              "Unknown Property"
            : "Unknown Property"
        }
        propertyPrice={gameState.currentAction?.data?.price || 0}
        playerMoney={currentPlayer.money}
        onBuy={() => {
          if (gameState.currentAction?.data?.position) {
            buyProperty(gameState.currentAction.data.position);
          }
        }}
        onSkip={skipProperty}
      />

      {/* Card Draw Modal */}
      <CardDrawModal
        isOpen={gameState.cardDrawModal?.isOpen || false}
        cardType={gameState.cardDrawModal?.cardType || "chance"}
        onCardDrawn={handleCardDrawn}
      />

      {/* Jail Dialog */}
      <JailDialog
        isOpen={currentPlayer.inJail && gameState.gamePhase === "waiting"}
        playerName={currentPlayer.name}
        playerMoney={currentPlayer.money}
        jailTurns={currentPlayer.jailTurns}
        hasJailFreeCard={
          (drawnCards.playerJailCards[currentPlayer.id] || 0) > 0
        }
        onPayFine={payJailFine}
        onUseCard={useJailFreeCard}
        onRollDice={() => {
          // The dice component will handle the roll and call handleDiceRoll
          setCurrentDialogVisible(false);
        }}
      />
    </div>
  );
};

export default MonopolyBoard;
