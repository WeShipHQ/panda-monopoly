// Trade configuration step component  
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGameContext } from "@/components/providers/game-provider";
import type { PlayerAccount, TradeOffer, PropertyAccount } from "@/types/schema";

interface TradeConfigurationStepProps {
  selectedPlayer: PlayerAccount;
  currentPlayer: PlayerAccount;
  initiatorOffer: TradeOffer;
  targetOffer: TradeOffer;
  onInitiatorOfferChange: (offer: TradeOffer) => void;
  onTargetOfferChange: (offer: TradeOffer) => void;
  onCreateTrade: () => void;
  canCreateTrade: boolean;
}

// Simple format function for SOL amounts
const formatSolAmount = (amount: string): string => {
  const numAmount = parseFloat(amount) / 1000000000; // Convert lamports to SOL
  return numAmount.toFixed(3);
};

// Helper to get property color group name
const getColorGroupName = (colorGroup: any): string => {
  const colorNames: { [key: string]: string } = {
    Brown: "Brown",
    LightBlue: "Light Blue", 
    Pink: "Pink",
    Orange: "Orange",
    Red: "Red",
    Yellow: "Yellow",
    Green: "Green",
    DarkBlue: "Dark Blue",
    Railroad: "Railroad",
    Utility: "Utility",
  };
  return colorNames[colorGroup] || "Unknown";
};

export function TradeConfigurationStep({
  selectedPlayer,
  currentPlayer,
  initiatorOffer,
  targetOffer,
  onInitiatorOfferChange,
  onTargetOfferChange,
  onCreateTrade,
  canCreateTrade,
}: TradeConfigurationStepProps) {
  const { properties } = useGameContext();
  const [activeTab, setActiveTab] = useState<"money" | "properties">("money");
  
  // Get properties owned by each player
  const currentPlayerProperties = properties.filter(
    prop => prop.owner === currentPlayer.wallet
  );
  
  const selectedPlayerProperties = properties.filter(
    prop => prop.owner === selectedPlayer.wallet
  );

  const handleMoneyChange = (
    value: string,
    type: "initiator" | "target"
  ) => {
    const numValue = value === "" ? "0" : value;
    if (type === "initiator") {
      onInitiatorOfferChange({
        ...initiatorOffer,
        money: numValue,
      });
    } else {
      onTargetOfferChange({
        ...targetOffer,
        money: numValue,
      });
    }
  };

  const handlePropertyToggle = (
    propertyPosition: number,
    checked: boolean,
    type: "initiator" | "target"
  ) => {
    if (type === "initiator") {
      const newProperties = checked
        ? [...initiatorOffer.properties, propertyPosition]
        : initiatorOffer.properties.filter(p => p !== propertyPosition);
      
      onInitiatorOfferChange({
        ...initiatorOffer,
        properties: newProperties,
      });
    } else {
      const newProperties = checked
        ? [...targetOffer.properties, propertyPosition]
        : targetOffer.properties.filter(p => p !== propertyPosition);
      
      onTargetOfferChange({
        ...targetOffer,
        properties: newProperties,
      });
    }
  };

  const PlayerOfferCard = ({
    player,
    isCurrentPlayer,
    offer,
    playerProperties,
    onMoneyChange,
    onPropertyToggle,
  }: {
    player: PlayerAccount;
    isCurrentPlayer: boolean;
    offer: TradeOffer;
    playerProperties: PropertyAccount[];
    onMoneyChange: (value: string) => void;
    onPropertyToggle: (position: number, checked: boolean) => void;
  }) => (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {player.wallet.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">
              {isCurrentPlayer ? "You" : `${player.wallet.slice(0, 8)}...`}
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {formatSolAmount(player.cashBalance)} SOL
            </div>
          </div>
          {isCurrentPlayer && (
            <Badge className="ml-auto text-xs">You</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Simple tab navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "money"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("money")}
          >
            Money
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "properties"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </button>
        </div>
        
        {activeTab === "money" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">SOL Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.000"
                  value={offer.money === "0" ? "" : offer.money}
                  onChange={(e) => onMoneyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  step="0.001"
                  max={formatSolAmount(player.cashBalance)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  SOL
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Available: {formatSolAmount(player.cashBalance)} SOL
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "properties" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Select Properties to Trade</label>
              <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                {playerProperties.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No properties owned
                  </div>
                ) : (
                  playerProperties.map((property) => (
                    <div key={property.position} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`property-${property.position}-${isCurrentPlayer ? 'current' : 'target'}`}
                        checked={offer.properties.includes(property.position)}
                        onChange={(e) =>
                          onPropertyToggle(property.position, e.target.checked)
                        }
                        className="rounded border-border"
                      />
                      <label
                        htmlFor={`property-${property.position}-${isCurrentPlayer ? 'current' : 'target'}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span>Position {property.position}</span>
                          <Badge className="text-xs">
                            {getColorGroupName(property.colorGroup)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Price: ${property.price}
                          {property.houses > 0 && ` • ${property.houses} houses`}
                          {property.hasHotel && " • Hotel"}
                          {property.isMortgaged && " • Mortgaged"}
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Configure what each player will trade. At least one player must offer something.
      </div>
      
      {/* Trade offers */}
      <div className="flex gap-4">
        <PlayerOfferCard
          player={currentPlayer}
          isCurrentPlayer={true}
          offer={initiatorOffer}
          playerProperties={currentPlayerProperties}
          onMoneyChange={(value) => handleMoneyChange(value, "initiator")}
          onPropertyToggle={(position, checked) => 
            handlePropertyToggle(position, checked, "initiator")
          }
        />
        
        <div className="flex items-center justify-center px-4">
          <div className="text-2xl">⇄</div>
        </div>
        
        <PlayerOfferCard
          player={selectedPlayer}
          isCurrentPlayer={false}
          offer={targetOffer}
          playerProperties={selectedPlayerProperties}
          onMoneyChange={(value) => handleMoneyChange(value, "target")}
          onPropertyToggle={(position, checked) => 
            handlePropertyToggle(position, checked, "target")
          }
        />
      </div>

      {/* Trade summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-sm mb-2">You will give:</div>
              <div className="space-y-1">
                {initiatorOffer.money !== "0" && (
                  <div className="text-sm">💰 {initiatorOffer.money} SOL</div>
                )}
                {initiatorOffer.properties.map(position => {
                  const property = properties.find(p => p.position === position);
                  return property ? (
                    <div key={position} className="text-sm">
                      🏠 Position {position} ({getColorGroupName(property.colorGroup)})
                    </div>
                  ) : null;
                })}
                {initiatorOffer.money === "0" && initiatorOffer.properties.length === 0 && (
                  <div className="text-sm text-muted-foreground">Nothing</div>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-sm mb-2">You will receive:</div>
              <div className="space-y-1">
                {targetOffer.money !== "0" && (
                  <div className="text-sm">💰 {targetOffer.money} SOL</div>
                )}
                {targetOffer.properties.map(position => {
                  const property = properties.find(p => p.position === position);
                  return property ? (
                    <div key={position} className="text-sm">
                      🏠 Position {position} ({getColorGroupName(property.colorGroup)})
                    </div>
                  ) : null;
                })}
                {targetOffer.money === "0" && targetOffer.properties.length === 0 && (
                  <div className="text-sm text-muted-foreground">Nothing</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action button */}
      <div className="flex justify-end">
        <Button
          onClick={onCreateTrade}
          disabled={!canCreateTrade}
          className="min-w-[120px]"
        >
          Create Trade
        </Button>
      </div>
    </div>
  );
}