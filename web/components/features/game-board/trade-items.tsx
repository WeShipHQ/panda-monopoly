"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftRight, Plus, Eye } from "lucide-react";
import { formatAddress, generatePlayerIcon } from "@/lib/utils";

// Mock trade data - replace with actual data from your game context
const mockTrades = [
  {
    id: "1",
    fromPlayer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    toPlayer: "9yQNf4xQx1KjFz8CjxqVjg2HwFpwH6wGvEcx85i9FpEr",
    status: "pending", // pending, accepted, rejected, completed
    items: {
      properties: ["BONK Avenue", "WIF Lane"],
      cash: 500,
    },
    counterOffer: null,
  },
  {
    id: "2",
    fromPlayer: "5aAiVXKdTAp67g9QeHXUHjuRhbvCqtMXGGiGYA5C2TVG",
    toPlayer: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    status: "active",
    items: {
      properties: ["JUP Street"],
      cash: 200,
    },
    counterOffer: {
      properties: ["RAY Boulevard"],
      cash: 100,
    },
  },
];

export function TradeItems() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Trades</h2>
        <Button size="sm" className="h-8 px-3">
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      <div className="space-y-3">
        {mockTrades.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 text-sm">No active trades</p>
            </CardContent>
          </Card>
        ) : (
          mockTrades.map((trade) => {
            const fromPlayerInfo = generatePlayerIcon(trade.fromPlayer);
            const toPlayerInfo = generatePlayerIcon(trade.toPlayer);

            return (
              <Card key={trade.id} className="relative">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={fromPlayerInfo.avatar} />
                        <AvatarFallback
                          style={{ backgroundColor: fromPlayerInfo.color }}
                          className="text-white text-xs"
                        >
                          {formatAddress(trade.fromPlayer).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={toPlayerInfo.avatar} />
                        <AvatarFallback
                          style={{ backgroundColor: toPlayerInfo.color }}
                          className="text-white text-xs"
                        >
                          {formatAddress(trade.toPlayer).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Badge
                      // @ts-expect-error
                      variant={
                        trade.status === "pending" ? "secondary" : "default"
                      }
                      className="text-xs"
                    >
                      {trade.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {formatAddress(trade.fromPlayer)}
                      </span>
                      {/* @ts-expect-error */}
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
