"use client";

import React from "react";

interface PropertyDialogProps {
  isOpen: boolean;
  propertyName: string;
  propertyPrice: number;
  playerMoney: number;
  onBuy: () => void;
  onSkip: () => void;
  onClose?: () => void;
}

export const PropertyDialog: React.FC<PropertyDialogProps> = ({
  isOpen,
  propertyName,
  propertyPrice,
  playerMoney,
  onBuy,
  onSkip,
  onClose,
}) => {
  if (!isOpen) return null;

  const canAfford = playerMoney >= propertyPrice;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Lighter background overlay */}
      <div
        className="absolute inset-0 bg-white bg-opacity-40"
        onClick={onClose}
      />

      {/* Dialog with slide-up animation */}
      <div
        className={`relative bg-white border-2 border-gray-300 p-6 max-w-sm w-full mx-4 transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}

        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            {propertyName}
          </h3>
          <p className="text-xl font-bold text-gray-900">${propertyPrice}</p>
        </div>

        <div className="mb-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Your Money:</span>
            <span className="font-medium">${playerMoney}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">After Purchase:</span>
            <span
              className={`font-medium ${
                canAfford ? "text-gray-900" : "text-red-600"
              }`}
            >
              ${playerMoney - propertyPrice}
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm mb-4">
            Not enough money!
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`flex-1 px-3 py-2 transition-colors text-sm ${
              canAfford
                ? "bg-gray-800 text-white hover:bg-gray-900"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

interface SpecialCardDialogProps {
  isOpen: boolean;
  cardType: "chance" | "community-chest";
  message: string;
  onContinue: () => void;
  onClose?: () => void;
}

interface JailDialogProps {
  isOpen: boolean;
  playerName: string;
  playerMoney: number;
  jailTurns: number;
  hasJailFreeCard: boolean;
  onPayFine: () => void;
  onUseCard: () => void;
  onRollDice: () => void;
  onClose?: () => void;
}

export const SpecialCardDialog: React.FC<SpecialCardDialogProps> = ({
  isOpen,
  cardType,
  message,
  onContinue,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Lighter background overlay */}
      <div
        className="absolute inset-0 bg-white bg-opacity-40"
        onClick={onClose}
      />

      {/* Dialog with slide-up animation */}
      <div
        className={`relative bg-white border-2 border-gray-300 p-6 max-w-sm w-full mx-4 transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}

        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {cardType === "chance" ? "Chance" : "Community Chest"}
          </h3>
          <div className="w-12 h-12 mx-auto mb-3 border-2 border-gray-300 flex items-center justify-center text-lg">
            {cardType === "chance" ? "?" : "💰"}
          </div>
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <button
          onClick={onContinue}
          className="w-full px-3 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export const JailDialog: React.FC<JailDialogProps> = ({
  isOpen,
  playerName,
  playerMoney,
  jailTurns,
  hasJailFreeCard,
  onPayFine,
  onUseCard,
  onRollDice,
  onClose,
}) => {
  if (!isOpen) return null;

  const canAffordFine = playerMoney >= 50;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-white bg-opacity-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative bg-white border-2 border-gray-300 p-6 max-w-sm w-full mx-4 transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}

        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {playerName} is in Jail
          </h3>
          <div className="w-12 h-12 mx-auto mb-3 border-2 border-gray-300 flex items-center justify-center text-lg bg-orange-100">
            🏢
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Turn {jailTurns + 1}/3 in jail
          </p>
          <p className="text-xs text-gray-600">
            Choose how to get out of jail:
          </p>
        </div>

        <div className="mb-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Your Money:</span>
            <span className="font-medium">${playerMoney}</span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Roll for doubles */}
          <button
            onClick={onRollDice}
            className="w-full px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
          >
            Roll Dice (Try for doubles)
          </button>

          {/* Pay fine */}
          <button
            onClick={onPayFine}
            disabled={!canAffordFine}
            className={`w-full px-3 py-2 transition-colors text-sm ${
              canAffordFine
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Pay $50 Fine
          </button>

          {/* Use Get Out of Jail Free card */}
          {hasJailFreeCard && (
            <button
              onClick={onUseCard}
              className="w-full px-3 py-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm"
            >
              Use "Get Out of Jail Free" Card
            </button>
          )}
        </div>

        {!canAffordFine && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm mt-4">
            Not enough money to pay fine!
          </div>
        )}

        {jailTurns >= 2 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 text-sm mt-4">
            Warning: You must pay the fine if you don't roll doubles this turn!
          </div>
        )}
      </div>
    </div>
  );
};
