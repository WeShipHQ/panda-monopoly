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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {currentStep === "trade-configuration" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {currentStep === "player-selection"
                ? "Select Player to Trade With"
                : `Trade with ${selectedPlayer?.wallet.slice(0, 8)}...`}
            </DialogTitle>
          </div>
        </DialogHeader>

        {currentStep === "player-selection" && (
          <PlayerSelectionStep
            players={availablePlayers}
            onPlayerSelect={handlePlayerSelect}
          />
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