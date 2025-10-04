"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftRight, Plus, Eye, Trash2 } from "lucide-react";
import { formatAddress, generatePlayerIcon } from "@/lib/utils";
import { useGameContext } from "@/components/providers/game-provider";
import { TradeDialog } from "@/components/trade-dialog";
import { TradeDetailsDialog } from "@/components/trade-details-dialog";
import { TradeStatus } from "@/lib/sdk/generated";
import type { TradeData } from "@/types/schema";

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

const getTradeStatusVariant = (status: TradeStatus): "default" | "neutral" => {
  switch (status) {
    case 0: return "neutral"; // Pending
    case 1: return "default"; // Accepted
    default: return "neutral";
  }
};

export function TradeItems() {
  const { 
    activeTrades, 
    isTradeDialogOpen, 
    setIsTradeDialogOpen,
    currentPlayerState,
    cancelTrade
  } = useGameContext();

  const [selectedTrade, setSelectedTrade] = useState<TradeData | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleCreateTrade = () => {
    setIsTradeDialogOpen(true);
  };

  const handleViewTrade = (trade: TradeData) => {
    setSelectedTrade(trade);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteTrade = async (trade: TradeData, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening details dialog
    
    if (!currentPlayerState) return;
    
    // Only allow canceling if current player is the initiator and trade is pending
    if (trade.initiator === currentPlayerState.wallet && trade.status === 0) {
      try {
        await cancelTrade(trade.id);
      } catch (error) {
        console.error("Error cancelling trade:", error);
      }
    }
  };

  const canDeleteTrade = (trade: TradeData): boolean => {
    return currentPlayerState?.wallet === trade.initiator && trade.status === 0;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-[#FFD93D] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-black text-black">Trades</h2>
          <Button 
            size="sm" 
            className="h-9 px-4 rounded-none bg-[#4ECDC4] hover:bg-[#3BB3AA] border-2 border-black text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            onClick={handleCreateTrade}
            disabled={!currentPlayerState}
          >
            <Plus className="w-4 h-4 mr-1 font-bold" />
            Create
          </Button>
        </div>

        <div className="space-y-3">
          {activeTrades.length === 0 ? (
            <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardContent className="p-4 text-center">
                <p className="text-black font-bold text-sm">No active trades</p>
              </CardContent>
            </Card>
          ) : (
            activeTrades.map((trade) => {
              const fromPlayerInfo = generatePlayerIcon(trade.initiator);
              const toPlayerInfo = generatePlayerIcon(trade.target);

              return (
                <Card 
                  key={trade.id} 
                  className="relative cursor-pointer border-2 border-black rounded-none bg-[#FFF5E6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  onClick={() => handleViewTrade(trade)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Avatar className="w-5 h-5 border border-black rounded-none">
                          <AvatarImage src={fromPlayerInfo.avatar} />
                          <AvatarFallback
                            style={{ backgroundColor: fromPlayerInfo.color }}
                            className="text-white text-xs font-bold rounded-none"
                          >
                            {formatAddress(trade.initiator).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <ArrowLeftRight className="w-3 h-3 text-black font-bold" />
                        <Avatar className="w-5 h-5 border border-black rounded-none">
                          <AvatarImage src={toPlayerInfo.avatar} />
                          <AvatarFallback
                            style={{ backgroundColor: toPlayerInfo.color }}
                            className="text-white text-xs font-bold rounded-none"
                          >
                            {formatAddress(trade.target).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className="text-[10px] font-bold bg-[#FFD93D] text-black border border-black rounded-none px-1.5 py-0.5"
                        >
                          {getTradeStatusText(trade.status)}
                        </Badge>
                        
                        {/* Action buttons */}
                        <div className="flex gap-1">
                          <Button 
                            variant="neutral" 
                            className="h-6 px-1.5 text-xs rounded-none bg-[#88AAEE] hover:bg-[#6688CC] border border-black text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTrade(trade);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          
                          {canDeleteTrade(trade) && (
                            <Button 
                              variant="neutral" 
                              className="h-6 px-1.5 text-xs rounded-none bg-[#FF6B6B] hover:bg-[#FF5252] border border-black text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                              onClick={(e) => handleDeleteTrade(trade, e)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-black space-y-0.5">
                      {/* Trade summary */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Offers:</span>
                          {trade.initiatorOffer.money !== "0" && (
                            <span>💰 ${trade.initiatorOffer.money}</span>
                          )}
                          {trade.initiatorOffer.properties.length > 0 && (
                            <span>🏠 {trade.initiatorOffer.properties.length}</span>
                          )}
                          {trade.initiatorOffer.money === "0" && trade.initiatorOffer.properties.length === 0 && (
                            <span className="text-muted-foreground">Nothing</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Wants:</span>
                          {trade.targetOffer.money !== "0" && (
                            <span>💰 ${trade.targetOffer.money}</span>
                          )}
                          {trade.targetOffer.properties.length > 0 && (
                            <span>🏠 {trade.targetOffer.properties.length}</span>
                          )}
                          {trade.targetOffer.money === "0" && trade.targetOffer.properties.length === 0 && (
                            <span className="text-muted-foreground">Nothing</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <TradeDialog 
        isOpen={isTradeDialogOpen} 
        onClose={() => setIsTradeDialogOpen(false)} 
      />
      
      <TradeDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        trade={selectedTrade}
      />
    </>
  );
}
