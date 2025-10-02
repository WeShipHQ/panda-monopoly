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
    case 0: return "bg-yellow-100 text-yellow-800"; // Pending
    case 1: return "bg-green-100 text-green-800"; // Accepted
    case 2: return "bg-red-100 text-red-800"; // Rejected
    case 3: return "bg-gray-100 text-gray-800"; // Cancelled
    case 4: return "bg-orange-100 text-orange-800"; // Expired
    default: return "bg-gray-100 text-gray-800";
  }
};

// Simple format function for SOL amounts
const formatSolAmount = (amount: string): string => {
  const numAmount = parseFloat(amount) / 1000000000; // Convert lamports to SOL
  return numAmount.toFixed(3);
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback 
                  style={{ backgroundColor: initiatorInfo.color }}
                  className="text-white text-sm"
                >
                  {formatAddress(trade.initiator).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <ArrowLeftRight className="w-4 h-4 text-gray-400" />
              <Avatar className="h-8 w-8">
                <AvatarFallback 
                  style={{ backgroundColor: targetInfo.color }}
                  className="text-white text-sm"
                >
                  {formatAddress(trade.target).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Badge className={`text-xs px-2 py-1 ${getTradeStatusColor(trade.status)}`}>
              {getTradeStatusText(trade.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback 
                      style={{ backgroundColor: initiatorInfo.color }}
                      className="text-white text-xs"
                    >
                      {formatAddress(trade.initiator).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  Initiator {isCurrentPlayerInitiator && "(You)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">{formatAddress(trade.initiator)}</div>
                  {initiatorPlayer && (
                    <div className="text-xs text-muted-foreground">
                      Balance: {formatSolAmount(initiatorPlayer.cashBalance)} SOL
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback 
                      style={{ backgroundColor: targetInfo.color }}
                      className="text-white text-xs"
                    >
                      {formatAddress(trade.target).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  Target {isCurrentPlayerTarget && "(You)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">{formatAddress(trade.target)}</div>
                  {targetPlayer && (
                    <div className="text-xs text-muted-foreground">
                      Balance: {formatSolAmount(targetPlayer.cashBalance)} SOL
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trade details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Initiator Offers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trade.initiatorOffer.money !== "0" ? (
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>{trade.initiatorOffer.money} SOL</span>
                  </div>
                ) : null}
                
                {trade.initiatorOffer.properties.length > 0 ? (
                  <div className="space-y-1">
                    <div className="font-medium text-sm">Properties:</div>
                    {trade.initiatorOffer.properties.map(position => {
                      const property = properties.find(p => p.position === position);
                      return property ? (
                        <div key={position} className="flex items-center gap-2 text-sm">
                          <span>🏠</span>
                          <span>Position {position}</span>
                          <span className="text-muted-foreground">(${property.price})</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : null}
                
                {trade.initiatorOffer.money === "0" && trade.initiatorOffer.properties.length === 0 && (
                  <div className="text-muted-foreground text-sm">Nothing offered</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Target Offers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trade.targetOffer.money !== "0" ? (
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>{trade.targetOffer.money} SOL</span>
                  </div>
                ) : null}
                
                {trade.targetOffer.properties.length > 0 ? (
                  <div className="space-y-1">
                    <div className="font-medium text-sm">Properties:</div>
                    {trade.targetOffer.properties.map(position => {
                      const property = properties.find(p => p.position === position);
                      return property ? (
                        <div key={position} className="flex items-center gap-2 text-sm">
                          <span>🏠</span>
                          <span>Position {position}</span>
                          <span className="text-muted-foreground">(${property.price})</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : null}
                
                {trade.targetOffer.money === "0" && trade.targetOffer.properties.length === 0 && (
                  <div className="text-muted-foreground text-sm">Nothing offered</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trade metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trade Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Created:</span> {new Date(trade.createdAt).toLocaleString()}
              </div>
              {trade.expiresAt && (
                <div>
                  <span className="font-medium">Expires:</span> {new Date(trade.expiresAt).toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span> {getTradeStatusText(trade.status)}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          {canInteract && trade.status === 0 && (
            <div className="flex gap-3 justify-end">
              {canAccept && (
                <Button 
                  onClick={handleAccept} 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 border-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Trade
                </Button>
              )}
              
              {canReject && (
                <Button 
                  onClick={handleReject} 
                  variant="default" 
                  className="bg-red-600 hover:bg-red-700 border-red-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Trade
                </Button>
              )}
              
              {canCancel && (
                <Button 
                  onClick={handleCancel} 
                  variant="neutral"
                  className="bg-gray-600 hover:bg-gray-700 border-gray-700 text-white"
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