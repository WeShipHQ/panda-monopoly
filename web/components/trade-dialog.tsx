"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// import { PlayerSelectionStep } from "./player-selection-step";
// import { TradeConfigurationStep } from "./trade-configuration-step";
import { useGameContext } from "@/components/providers/game-provider";
import type { PlayerAccount, TradeOffer } from "@/types/schema";
import { TradeConfigurationStep } from "./trade-configuration-step";
import { PlayerSelectionStep } from "./player-selection-step";

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TradeStep = "player-selection" | "trade-configuration";

export function TradeDialog({ isOpen, onClose }: TradeDialogProps) {
  const [currentStep, setCurrentStep] = useState<TradeStep>("player-selection");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerAccount | null>(null);
  const [initiatorOffer, setInitiatorOffer] = useState<TradeOffer>({
    money: "0",
    properties: [],
  });
  const [targetOffer, setTargetOffer] = useState<TradeOffer>({
    money: "0",
    properties: [],
  });

  const { players, currentPlayerState, createTrade } = useGameContext();

  const handlePlayerSelect = (player: PlayerAccount) => {
    setSelectedPlayer(player);
    setCurrentStep("trade-configuration");
  };

  const handleBack = () => {
    if (currentStep === "trade-configuration") {
      setCurrentStep("player-selection");
      setSelectedPlayer(null);
      // Reset offers when going back
      setInitiatorOffer({ money: "0", properties: [] });
      setTargetOffer({ money: "0", properties: [] });
    }
  };

  const handleCreateTrade = async () => {
    if (!selectedPlayer || !currentPlayerState) return;

    try {
      await createTrade(selectedPlayer.wallet, initiatorOffer, targetOffer);
      
      onClose();
      handleReset();
    } catch (error) {
      console.error("Error creating trade:", error);
    }
  };

  const handleReset = () => {
    setCurrentStep("player-selection");
    setSelectedPlayer(null);
    setInitiatorOffer({ money: "0", properties: [] });
    setTargetOffer({ money: "0", properties: [] });
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const canCreateTrade = () => {
    const hasInitiatorOffer = 
      parseInt(initiatorOffer.money) > 0 || initiatorOffer.properties.length > 0;
    const hasTargetOffer = 
      parseInt(targetOffer.money) > 0 || targetOffer.properties.length > 0;
    
    return hasInitiatorOffer || hasTargetOffer;
  };

  // Filter out current player from available players
  const availablePlayers = players.filter(
    (player) => player.wallet !== currentPlayerState?.wallet
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`overflow-y-auto rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${currentStep === "player-selection" ? "max-w-[280px] p-4 bg-[#ffe0e3] border-4 border-black" : "max-w-md p-6 bg-[#FFF5E6] border-4 border-black"}`}>
        <DialogHeader className={`${currentStep === "player-selection" ? "pb-2" : "pb-3 border-b-4 border-black"}`}>
          <div className="flex items-center gap-2 justify-between">
            {currentStep === "trade-configuration" && (
              <Button
                variant="default"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 rounded-none bg-[#4ECDC4] hover:bg-[#3BB3AA] border-2 border-black text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className={`${currentStep === "player-selection" ? "text-base font-black flex-grow text-center text-black" : "text-lg font-black flex-grow text-black"}`}>
              {currentStep === "player-selection"
                ? "Create a trade"
                : "Trade Properties & Money"}
            </DialogTitle>
            <Button
              variant="default"
              size="icon"
              onClick={handleClose}
              className={`${currentStep === "player-selection" ? "h-7 w-7" : "h-9 w-9"} rounded-none bg-[#FF6B6B] hover:bg-[#FF5252] border-2 border-black text-white font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all`}
            >
              <span className="text-base">×</span>
            </Button>
          </div>
        </DialogHeader>

        {currentStep === "player-selection" && (
          <>
            <p className="text-black text-center text-xs font-bold mt-1 mb-2">Select a player to trade with:</p>
            <PlayerSelectionStep
              players={availablePlayers}
              onPlayerSelect={handlePlayerSelect}
            />
          </>
        )}

        {currentStep === "trade-configuration" && selectedPlayer && (
          <TradeConfigurationStep
            selectedPlayer={selectedPlayer}
            currentPlayer={currentPlayerState!}
            initiatorOffer={initiatorOffer}
            targetOffer={targetOffer}
            onInitiatorOfferChange={setInitiatorOffer}
            onTargetOfferChange={setTargetOffer}
            onCreateTrade={handleCreateTrade}
            canCreateTrade={canCreateTrade()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}