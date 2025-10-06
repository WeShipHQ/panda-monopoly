// Trade configuration step component  
"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useGameContext } from "@/components/providers/game-provider";
import { boardData, colorMap } from "@/configs/board-data";
import type { PlayerAccount, TradeOffer, PropertyAccount } from "@/types/schema";
import { playSound, SOUND_CONFIG } from "@/lib/soundUtil";

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

// Formatting money values as currency
const formatCurrency = (amount: string | number): string => {
  return `$${amount}`;
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

// Neobrutalism scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border: 2px solid #000;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #000;
    border-radius: 0;
    border: 2px solid #000;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #333;
  }
`;

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
  
  // Get properties owned by each player
  const currentPlayerProperties = properties.filter(
    prop => prop.owner === currentPlayer.wallet
  );
  
  const selectedPlayerProperties = properties.filter(
    prop => prop.owner === selectedPlayer.wallet
  );

  // Memoize the money change handler to prevent re-rendering during dragging
  const handleMoneyChange = useCallback((
    value: number[],
    type: "initiator" | "target"
  ) => {
    // Round to integer since we're dealing with dollars
    // Make sure we have at least one value in the array and it's a valid number
    const sliderValue = value && value.length > 0 ? value[0] : 0;
    const numValue = Math.max(0, Math.round(sliderValue)).toString();
    
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
  }, [initiatorOffer, targetOffer, onInitiatorOfferChange, onTargetOfferChange]);

  // Memoize property toggle handler for better performance
  const handlePropertyToggle = useCallback((
    propertyPosition: number,
    checked: boolean,
    type: "initiator" | "target"
  ) => {
    if (type === "initiator") {
      const newProperties = checked
        ? [...initiatorOffer.properties, propertyPosition]
        : initiatorOffer.properties.filter((p: number) => p !== propertyPosition);
      
      onInitiatorOfferChange({
        ...initiatorOffer,
        properties: newProperties,
      });
    } else {
      const newProperties = checked
        ? [...targetOffer.properties, propertyPosition]
        : targetOffer.properties.filter((p: number) => p !== propertyPosition);
      
      onTargetOfferChange({
        ...targetOffer,
        properties: newProperties,
      });
    }
  }, [initiatorOffer, targetOffer, onInitiatorOfferChange, onTargetOfferChange]);

  const PlayerOfferCard = React.memo(({
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
    onMoneyChange: (value: number[]) => void;
    onPropertyToggle: (position: number, checked: boolean) => void;
  }) => {
    // Use raw dollar amount (not lamports/SOL) for slider
    const maxDollars = parseInt(player.cashBalance) || 0;
    // Convert offer money to number for slider and ensure it's a valid number
    const currentValue = Math.min(parseInt(offer.money) || 0, maxDollars);
    
    // Local state for real-time slider updates without re-rendering parent
    const [tempValue, setTempValue] = useState(currentValue);
    
    // Đồng bộ giá trị từ props khi offer thay đổi từ bên ngoài
    React.useEffect(() => {
      setTempValue(currentValue);
    }, [currentValue]);
    
    return (
      <div className="flex-1 flex flex-col">
        {/* Player Info */}
        <div className="flex items-center gap-2 mb-4 p-2 rounded-none bg-[#FFD93D] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Avatar className="h-8 w-8 border-2 border-black rounded-none">
            <AvatarImage walletAddress={player.wallet} />
            <AvatarFallback 
              walletAddress={player.wallet}
              className="bg-black text-white text-xs font-black rounded-none"
            />
          </Avatar>
          <div>
            <div className="text-sm font-black text-black">
              {isCurrentPlayer ? "You" : `${player.wallet.slice(0, 6)}...`}
            </div>
            <div className="text-xs font-bold text-black">
              Balance: <span className="font-black">${player.cashBalance}</span>
            </div>
          </div>
        </div>
        
        {/* Money slider with value bubble */}
        <div className="mb-6 relative py-4">
          <div className="flex justify-between text-xs font-bold text-black mb-2">
            <span>$0</span>
            <span>${maxDollars}</span>
          </div>
          <div className="relative">
            <Slider 
              defaultValue={[0]} 
              min={0}
              max={maxDollars} 
              step={1}
              value={[tempValue]}
              onValueChange={(val) => setTempValue(val[0])}  // chỉ update local state
              onValueCommit={(val) => onMoneyChange(val)}    // chỉ gửi khi thả slider
              aria-label="Money amount"
              className="cursor-pointer"
            />
            {/* Current value bubble - use fixed positioning for smoother dragging */}
            <div 
              className="absolute top-[-26px] bg-[#4ECDC4] text-black text-xs px-3 py-1.5 rounded-none font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 border-2 border-black"
              style={{ 
                left: `${maxDollars > 0 ? Math.min(100, (tempValue / maxDollars) * 100) : 0}%`,
                transform: "translateX(-50%)",
                willChange: "left" // Hint to browser to optimize this property
              }}
            >
              <span className="flex items-center gap-1">
                <span className="text-black">$</span>
                <span className="text-black font-black">{tempValue}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Properties list - simplified */}
        <div>
          {playerProperties.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar" 
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#000 transparent'
                 }}>
              {playerProperties.map((property) => {
                // Get full property name from board data
                const propertyData = boardData.find(b => b.position === property.position);
                const propertyName = propertyData?.name || `Property ${property.position}`;
                
                // Handle color group for all property types
                let colorHex = null;
                let propertyType = "";
                
                if (propertyData && 'type' in propertyData) {
                  propertyType = propertyData.type;
                  
                  if (propertyData.type === 'property') {
                    // Property with color group
                    const propertySpace = propertyData as any;
                    if (propertySpace.colorGroup) {
                      // Fix: properly handle camelCase colorGroup keys
                      const colorGroupKey = propertySpace.colorGroup as keyof typeof colorMap;
                      colorHex = colorMap[colorGroupKey] || null;
                    }
                  } else if (propertyData.type === 'railroad') {
                    // Railroad - use black color
                    colorHex = '#000000';
                  } else if (propertyData.type === 'utility') {
                    // Utility - use a light yellow color
                    colorHex = '#E8C547';
                  }
                }
                
                const isSelected = offer.properties.includes(property.position);
                
                return (
                  <div 
                    key={property.position} 
                    onClick={() => {
                      playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
                      onPropertyToggle(
                        property.position, 
                        !offer.properties.includes(property.position)
                      );
                    }}
                    className={`flex items-center justify-between p-2 rounded-none cursor-pointer text-xs transition-all ${
                      isSelected 
                        ? 'bg-[#A98CFF] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold' 
                        : 'bg-white border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Color indicator with improved visibility */}
                      <div 
                        className="w-4 h-4 rounded-none flex-shrink-0 border-2 border-black" 
                        style={{ 
                          backgroundColor: colorHex || 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {propertyType === 'railroad' && (
                          <span className="text-white text-[8px] font-bold">RR</span>
                        )}
                        {propertyType === 'utility' && (
                          <span className="text-[8px] font-bold">⚡</span>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-none flex items-center justify-center border-2 border-black transition-colors ${isSelected ? 'bg-black text-white' : 'bg-white'}`}>
                        {isSelected && <span className="text-[10px] font-black">✓</span>}
                      </div>
                      <span className={`${isSelected ? 'font-black text-black' : 'font-bold text-black'} truncate max-w-[120px]`}>{propertyName}</span>
                    </div>
                    <span className={`font-black text-black`}>${property.price}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="bg-[#FFF5E6] py-2 flex flex-col">
      <style>{scrollbarStyles}</style>
      {/* Title with simplified UI */}
      <div className="flex justify-between items-center mb-5 pb-2 border-b-4 border-black">
        <div className="font-black text-lg text-black">Trade Offer</div>
      </div>
      
      {/* Trade offers in simplified layout */}
      <div className="grid grid-cols-2 gap-6">
        <PlayerOfferCard
          player={currentPlayer}
          isCurrentPlayer={true}
          offer={initiatorOffer}
          playerProperties={currentPlayerProperties}
          onMoneyChange={useCallback((value) => handleMoneyChange(value, "initiator"), [handleMoneyChange])}
          onPropertyToggle={useCallback((position, checked) => 
            handlePropertyToggle(position, checked, "initiator"), [handlePropertyToggle])}
        />
        
        <PlayerOfferCard
          player={selectedPlayer}
          isCurrentPlayer={false}
          offer={targetOffer}
          playerProperties={selectedPlayerProperties}
          onMoneyChange={useCallback((value) => handleMoneyChange(value, "target"), [handleMoneyChange])}
          onPropertyToggle={useCallback((position, checked) => 
            handlePropertyToggle(position, checked, "target"), [handlePropertyToggle])}
        />
      </div>

      {/* Action button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={onCreateTrade}
          disabled={!canCreateTrade}
          variant="default"
          className={`px-8 py-3 text-sm font-black rounded-none transition-all ${canCreateTrade ? 'bg-[#4ECDC4] hover:bg-[#3BB3AA] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'opacity-50 bg-gray-300 border-2 border-black'}`}
        >
          Send Trade
        </Button>
      </div>
    </div>
  );
}