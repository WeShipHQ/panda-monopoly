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
import { useGameManager } from "@/components/game-manager";
import { PropertyDialog, SpecialCardDialog, JailDialog } from "@/components/property-dialog";
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

const MonopolyBoard = () => {
  const [boardRotation, setBoardRotation] = useState(0);
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
    drawnCards
  } = useGameManager();

  // Reset dialog visibility when action changes
  React.useEffect(() => {
    if (gameState.currentAction) {
      setCurrentDialogVisible(true);
    }
  }, [gameState.currentAction]);

  const rotateBoardClockwise = () => {
    setBoardRotation(prev => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation(prev => (prev - 90 + 360) % 360);
  };

  return (
    <div className="flex h-screen w-screen monopoly-board overflow-hidden" style={{ backgroundImage: 'url("/images/monopoly-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Message Display */}
      <MessageDisplay message={gameState.currentMessage} />
      {/* Left Panel - Game Controls */}
      <div className="w-80 bg-gray-100 p-4 flex flex-col">
        {/* Current Player Info */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Current Turn</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={currentPlayer.avatar}
                alt={`${currentPlayer.name} avatar`}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div>
              <div className="font-semibold">{currentPlayer.name}</div>
              <div className="text-sm text-gray-600">Money: ${currentPlayer.money}</div>
              <div className="text-sm text-gray-600">Position: {currentPlayer.position}</div>
              <div className="text-xs text-blue-600">{boardSpaces[currentPlayer.position]?.name}</div>
            </div>
          </div>
        </div>

        {/* Dice */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Roll Dice</h3>
          <Dice
            onRoll={handleDiceRoll}
            disabled={gameState.gamePhase !== 'waiting'}
          />
        </div>

        {/* Players List */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Players List</h3>
          <div className="space-y-3">
            {gameState.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-2 rounded ${index === gameState.currentPlayerIndex ? 'bg-blue-100' : 'bg-gray-50'
                  }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={player.avatar}
                    alt={`${player.name} avatar`}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs text-gray-600">${player.money}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Log */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow flex-1">
          <h3 className="text-lg font-bold mb-4">Game Log</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {gameState.gameLog.slice(-10).map((log, index) => (
              <div key={index} className="text-xs text-gray-600 p-1 bg-gray-50 rounded">
                {log}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Phase: {gameState.gamePhase}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Controls</h3>

          {/* Current Dialog Toggle - only show when there's an active dialog */}
          {(gameState.gamePhase === 'property-action' || gameState.gamePhase === 'special-action') && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={currentDialogVisible}
                  onChange={(e) => setCurrentDialogVisible(e.target.checked)}
                  className="rounded"
                />
                Show Current Dialog
              </label>
            </div>
          )}

          {/* Rotation Controls */}
          <div className="flex gap-2">
            <button
              onClick={rotateBoardCounterClockwise}
              className="flex-1 px-3 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm"
            >
              ↺ Left
            </button>
            <button
              onClick={rotateBoardClockwise}
              className="flex-1 px-3 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm"
            >
              ↻ Right
            </button>
          </div>
        </div>
      </div>

      {/* Board Container */}
      <div className="flex-1 flex items-center justify-center p-4">

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
        isOpen={currentDialogVisible && gameState.gamePhase === 'property-action' && gameState.currentAction?.type === 'buy-property'}
        propertyName={gameState.currentAction?.data?.position ? boardSpaces[gameState.currentAction.data.position]?.name || 'Unknown Property' : 'Unknown Property'}
        propertyPrice={gameState.currentAction?.data?.price || 0}
        playerMoney={currentPlayer.money}
        onBuy={() => {
          if (gameState.currentAction?.data?.position) {
            buyProperty(gameState.currentAction.data.position);
          }
        }}
        onSkip={skipProperty}
        onClose={() => setCurrentDialogVisible(false)}
      />

      {/* Card Draw Modal */}
      <CardDrawModal
        isOpen={gameState.cardDrawModal?.isOpen || false}
        cardType={gameState.cardDrawModal?.cardType || 'chance'}
        onCardDrawn={handleCardDrawn}
        onClose={closeCardModal}
      />

      {/* Jail Dialog */}
      <JailDialog
        isOpen={currentPlayer.inJail && gameState.gamePhase === 'waiting'}
        playerName={currentPlayer.name}
        playerMoney={currentPlayer.money}
        jailTurns={currentPlayer.jailTurns}
        hasJailFreeCard={(drawnCards.playerJailCards[currentPlayer.id] || 0) > 0}
        onPayFine={payJailFine}
        onUseCard={useJailFreeCard}
        onRollDice={() => {
          // The dice component will handle the roll and call handleDiceRoll
          setCurrentDialogVisible(false);
        }}
        onClose={() => setCurrentDialogVisible(false)}
      />
    </div>
  );
};

export default MonopolyBoard;
