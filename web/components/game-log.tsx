"use client";

import React, { useEffect, useRef } from "react";
import { useGameContext } from "@/components/game-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface GameLogProps {
  className?: string;
  maxHeight?: string;
}

export const GameLog: React.FC<GameLogProps> = ({
  className = "",
  maxHeight = "400px",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { gameLogs, clearGameLogs, getPlayerName } = useGameContext();

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameLogs]);

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "move":
        return "bg-blue-100 text-blue-800";
      case "purchase":
        return "bg-green-100 text-green-800";
      case "rent":
        return "bg-orange-100 text-orange-800";
      case "card":
        return "bg-purple-100 text-purple-800";
      case "jail":
        return "bg-red-100 text-red-800";
      case "building":
        return "bg-yellow-100 text-yellow-800";
      case "turn":
        return "bg-gray-100 text-gray-800";
      case "dice":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Game Log</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{gameLogs.length} events</Badge>
            {gameLogs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearGameLogs}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-w-xs">
        <ScrollArea
          className="px-6 pb-6"
          style={{ height: maxHeight }}
          ref={scrollRef}
        >
          {gameLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-sm">No game events yet</div>
              <div className="text-xs mt-1">Game actions will appear here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {gameLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Badge
                    className={`text-xs ${getLogTypeColor(log.type)} shrink-0`}
                    variant="secondary"
                  >
                    {log.type.toUpperCase()}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 break-words">
                      {log.message}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{formatTime(log.timestamp)}</span>
                      {log.playerName && (
                        <>
                          <span>•</span>
                          <span>{log.playerName}</span>
                        </>
                      )}
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="flex gap-1">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GameLog;
