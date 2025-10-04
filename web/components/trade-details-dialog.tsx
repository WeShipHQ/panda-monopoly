"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftRight, Trash2, Check, X } from "lucide-react";
import { formatAddress, generatePlayerIcon } from "@/lib/utils";
import { useGameContext } from "@/components/providers/game-provider";
import type { TradeData } from "@/types/schema";
import { TradeStatus } from "@/lib/sdk/generated";
import { boardData, colorMap } from "@/configs/board-data";

interface TradeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trade: TradeData | null;
}

const getTradeStatusText = (status: TradeStatus): string => {
  switch (status) {
    case 0: return "Pending";
    case 1: return "Accepted";
    case 2: return "Rejected";
    case 3: return "Cancelled";
    case 4: return "Expired";
    default: return "Unknown";
  }
};

const getTradeStatusColor = (status: TradeStatus): string => {
  switch (status) {
    case 0: return "bg-[#FFD93D] text-black border-2 border-black"; // Pending
    case 1: return "bg-[#4ECDC4] text-black border-2 border-black"; // Accepted
    case 2: return "bg-[#FF6B6B] text-white border-2 border-black"; // Rejected
    case 3: return "bg-[#888888] text-white border-2 border-black"; // Cancelled
    case 4: return "bg-[#FFA07A] text-black border-2 border-black"; // Expired
    default: return "bg-white text-black border-2 border-black";
  }
};

// Format currency as dollars
const formatCurrency = (amount: string): string => {
  return `$${amount}`;
};

export function TradeDetailsDialog({ isOpen, onClose, trade }: TradeDetailsDialogProps) {
  const { 
    currentPlayerState, 
    properties, 
    acceptTrade, 
    rejectTrade, 
    cancelTrade,
    players 
  } = useGameContext();

  if (!trade) return null;

  const initiatorInfo = generatePlayerIcon(trade.initiator);
  const targetInfo = generatePlayerIcon(trade.target);
  
  const initiatorPlayer = players.find(p => p.wallet === trade.initiator);
  const targetPlayer = players.find(p => p.wallet === trade.target);

  const isCurrentPlayerInitiator = currentPlayerState?.wallet === trade.initiator;
  const isCurrentPlayerTarget = currentPlayerState?.wallet === trade.target;
  const canInteract = isCurrentPlayerInitiator || isCurrentPlayerTarget;

  const canAccept = isCurrentPlayerTarget && trade.status === 0;
  const canReject = isCurrentPlayerTarget && trade.status === 0;
  const canCancel = isCurrentPlayerInitiator && trade.status === 0;

  const handleAccept = async () => {
    try {
      await acceptTrade(trade.id);
      onClose();
    } catch (error) {
      console.error("Error accepting trade:", error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectTrade(trade.id);
      onClose();
    } catch (error) {
      console.error("Error rejecting trade:", error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelTrade(trade.id);
      onClose();
    } catch (error) {
      console.error("Error cancelling trade:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-y-auto p-6 bg-[#FFF5E6] border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="pb-3 border-b-4 border-black">
          <div className="flex items-center gap-2 justify-between">
            <DialogTitle className="text-lg font-black flex-grow text-black">
              Trade Details
            </DialogTitle>
            <Button
              variant="default"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-none bg-[#FF6B6B] hover:bg-[#FF5252] border-2 border-black text-white font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <span className="text-base">×</span>
            </Button>
          </div>
        </DialogHeader>
              
        <div className="bg-[#FFF5E6] py-2 flex flex-col">
          {/* Status indicator */}
          <div className="flex justify-end mb-2">
            <Badge className={`text-xs px-3 py-1 ${getTradeStatusColor(trade.status)} rounded-none font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
              {getTradeStatusText(trade.status)}
            </Badge>
          </div>
          
          {/* Space between status and content */}
          <div className="mb-5"></div>
          
          {/* Trade offers in simplified layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Initiator Offers */}
            <div className="flex-1 flex flex-col">
              {/* Player Info */}
              <div className="flex items-center gap-2 mb-4 p-2 rounded-none bg-[#88AAEE] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Avatar className="h-8 w-8 border-2 border-black rounded-none">
                  <AvatarFallback 
                    style={{ backgroundColor: initiatorInfo.color }} 
                    className="text-white text-xs font-black rounded-none"
                  >
                    {trade.initiator.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-black text-black">
                    {isCurrentPlayerInitiator ? "You" : `${trade.initiator.slice(0, 6)}...`}
                    {isCurrentPlayerInitiator && <span className="ml-1 text-xs font-black">(Initiator)</span>}
                  </div>
                  <div className="text-xs font-bold text-black">
                    Balance: <span className="font-black">${initiatorPlayer?.cashBalance || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Money slider with value bubble - fixed display */}
              <div className="mb-6 relative py-4">
                <div className="flex justify-between text-xs font-bold text-black mb-2">
                  <span>$0</span>
                  <span>${initiatorPlayer?.cashBalance || 0}</span>
                </div>
                <div className="relative">
                  {/* Display fixed slider based on offered amount */}
                  <div className="h-3 rounded-none bg-white border-2 border-black relative">
                    {parseInt(trade.initiatorOffer.money) > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#4ECDC4] border-r-2 border-black rounded-none" 
                        style={{ 
                          width: `${Math.min(100, (parseInt(trade.initiatorOffer.money) / (parseInt(initiatorPlayer?.cashBalance || '0') || 1)) * 100)}%` 
                        }}
                      ></div>
                    )}
                  </div>
                  
                  {/* Current value bubble */}
                  {parseInt(trade.initiatorOffer.money) > 0 && (
                    <div 
                      className="absolute top-[-28px] bg-[#4ECDC4] border-2 border-black text-black text-xs px-3 py-1 rounded-none font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
                      style={{ 
                        left: `${Math.min(100, (parseInt(trade.initiatorOffer.money) / (parseInt(initiatorPlayer?.cashBalance || '0') || 1)) * 100)}%`,
                        transform: "translateX(-50%)"
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <span>$</span>
                        <span>{trade.initiatorOffer.money}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Properties list - Initiator */}
              <div id="initiator-properties">
                <div className="text-xs font-black text-black mb-2">Properties Offered</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {trade.initiatorOffer.properties.length > 0 ? (
                    trade.initiatorOffer.properties.map(position => {
                      const property = properties.find(p => p.position === position);
                      const propertyData = boardData.find(b => b.position === position);
                      const propertyName = propertyData?.name || `Property ${position}`;
                      
                      // Get color for the property if available
                      let colorHex = null;
                      if (propertyData && 'type' in propertyData && propertyData.type === 'property') {
                        const propertySpace = propertyData as any;
                        if (propertySpace.colorGroup) {
                          const colorGroupKey = propertySpace.colorGroup as keyof typeof colorMap;
                          colorHex = colorMap[colorGroupKey] || null;
                        }
                      }
                      
                      return property ? (
                        <div key={position} className="flex items-center justify-between p-2 text-xs bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-2">
                            {/* Color indicator */}
                            {colorHex && (
                              <div 
                                className="w-3 h-3 rounded-none border border-black flex-shrink-0" 
                                style={{ backgroundColor: colorHex }}
                              />
                            )}
                            <span className="font-bold truncate max-w-[120px]">{propertyName}</span>
                          </div>
                          <span className="font-black">${property.price}</span>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="text-center text-black font-bold text-sm p-3 bg-gray-100 border-2 border-black rounded-none">
                      No properties offered
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Target Offers */}
            <div className="flex-1 flex flex-col">
              {/* Player Info */}
              <div className="flex items-center gap-2 mb-4 p-2 rounded-none bg-[#A98CFF] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Avatar className="h-8 w-8 border-2 border-black rounded-none">
                  <AvatarFallback 
                    style={{ backgroundColor: targetInfo.color }} 
                    className="text-white text-xs font-black rounded-none"
                  >
                    {trade.target.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-black text-black">
                    {isCurrentPlayerTarget ? "You" : `${trade.target.slice(0, 6)}...`}
                    {isCurrentPlayerTarget && <span className="ml-1 text-xs font-black">(Target)</span>}
                  </div>
                  <div className="text-xs font-bold text-black">
                    Balance: <span className="font-black">${targetPlayer?.cashBalance || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Money slider with value bubble - fixed display */}
              <div className="mb-6 relative py-4">
                <div className="flex justify-between text-xs font-bold text-black mb-2">
                  <span>$0</span>
                  <span>${targetPlayer?.cashBalance || 0}</span>
                </div>
                <div className="relative">
                  {/* Display fixed slider based on offered amount */}
                  <div className="h-3 rounded-none bg-white border-2 border-black relative">
                    {parseInt(trade.targetOffer.money) > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#A98CFF] border-r-2 border-black rounded-none" 
                        style={{ 
                          width: `${Math.min(100, (parseInt(trade.targetOffer.money) / (parseInt(targetPlayer?.cashBalance || '0') || 1)) * 100)}%` 
                        }}
                      ></div>
                    )}
                  </div>
                  
                  {/* Current value bubble */}
                  {parseInt(trade.targetOffer.money) > 0 && (
                    <div 
                      className="absolute top-[-28px] bg-[#A98CFF] border-2 border-black text-black text-xs px-3 py-1 rounded-none font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
                      style={{ 
                        left: `${Math.min(100, (parseInt(trade.targetOffer.money) / (parseInt(targetPlayer?.cashBalance || '0') || 1)) * 100)}%`,
                        transform: "translateX(-50%)"
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <span>$</span>
                        <span>{trade.targetOffer.money}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Properties list - Target */}
              <div id="target-properties">
                <div className="text-xs font-black text-black mb-2">Properties Offered</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {trade.targetOffer.properties.length > 0 ? (
                    trade.targetOffer.properties.map(position => {
                      const property = properties.find(p => p.position === position);
                      const propertyData = boardData.find(b => b.position === position);
                      const propertyName = propertyData?.name || `Property ${position}`;
                      
                      // Get color for the property if available
                      let colorHex = null;
                      if (propertyData && 'type' in propertyData && propertyData.type === 'property') {
                        const propertySpace = propertyData as any;
                        if (propertySpace.colorGroup) {
                          const colorGroupKey = propertySpace.colorGroup as keyof typeof colorMap;
                          colorHex = colorMap[colorGroupKey] || null;
                        }
                      }
                      
                      return property ? (
                        <div key={position} className="flex items-center justify-between p-2 text-xs bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-2">
                            {/* Color indicator */}
                            {colorHex && (
                              <div 
                                className="w-3 h-3 rounded-none border border-black flex-shrink-0" 
                                style={{ backgroundColor: colorHex }}
                              />
                            )}
                            <span className="font-bold truncate max-w-[120px]">{propertyName}</span>
                          </div>
                          <span className="font-black">${property.price}</span>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="text-center text-black font-bold text-sm p-3 bg-gray-100 border-2 border-black rounded-none">
                      No properties offered
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
          
          {/* Trade metadata in small text */}
          <div className="grid grid-cols-3 gap-3 my-4 text-xs">
            <div className="bg-[#FFF5E6] border-2 border-black rounded-none p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-black font-bold mb-1">Created</div>
              <div className="font-black">{new Date(trade.createdAt).toLocaleString()}</div>
            </div>
            
            {trade.expiresAt && (
              <div className="bg-[#FFF5E6] border-2 border-black rounded-none p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-black font-bold mb-1">Expires</div>
                <div className="font-black">{new Date(trade.expiresAt).toLocaleString()}</div>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          {canInteract && trade.status === 0 && (
            <div className="flex justify-center mt-6 gap-3">
              {canAccept && (
                <Button 
                  onClick={handleAccept} 
                  variant="default"
                  className="px-8 py-3 text-sm font-black rounded-none transition-all bg-[#4ECDC4] hover:bg-[#3BB3AA] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Trade
                </Button>
              )}
              
              {canReject && (
                <Button 
                  onClick={handleReject} 
                  variant="default" 
                  className="px-8 py-3 text-sm font-black rounded-none transition-all bg-[#FF6B6B] hover:bg-[#FF5252] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Trade
                </Button>
              )}
              
              {canCancel && (
                <Button 
                  onClick={handleCancel} 
                  variant="default"
                  className="px-8 py-3 text-sm font-black rounded-none transition-all bg-[#FF6B6B] hover:bg-[#FF5252] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Trade
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}