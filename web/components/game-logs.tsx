"use client";

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import {
  generateLogMessage,
  LOG_TYPE_ICONS,
  getRelativeTime,
} from "@/lib/log-utils";
import { cn } from "@/lib/utils";
import { GameLogEntry } from "@/types/space-types";
import { useGameLogs } from "@/hooks/useGameLogs";
import { useGameContext } from "./game-provider";

interface GameLogsProps {
  maxHeight?: string;
  showTimestamps?: boolean;
  showIcons?: boolean;
  autoScroll?: boolean;
}

export const GameLogs: React.FC<GameLogsProps> = ({
  maxHeight = "h-40",
  showTimestamps = false,
  showIcons = true,
  autoScroll = true,
}) => {
  const { gameLogs } = useGameLogs();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [gameLogs, autoScroll]);

  if (gameLogs.length === 0) {
    return (
      <ScrollArea className={cn(maxHeight, "w-full rounded-md border")}>
        <div className="p-4 text-center text-muted-foreground text-sm">
          No game events yet...
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={cn(maxHeight, "w-full max-w-xs")}
    >
      <div className="p-3 space-y-1">
        {gameLogs.map((log, index) => (
          <GameLogItem
            key={log.id || index}
            log={log}
            showTimestamp={showTimestamps}
            showIcon={showIcons}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

interface GameLogItemProps {
  log: GameLogEntry;
  showTimestamp?: boolean;
  showIcon?: boolean;
}

function GameLogItem({
  log,
  showTimestamp = false,
  showIcon = true,
}: GameLogItemProps) {
  const message = generateLogMessage(log);
  const icon = showIcon ? LOG_TYPE_ICONS[log.type] || "📝" : null;
  const timestamp = showTimestamp ? getRelativeTime(log.timestamp) : null;

  const getLogTypeColor = (type: GameLogEntry["type"]): string => {
    switch (type) {
      case "join":
        return "text-green-600";
      case "purchase":
        return "text-blue-600";
      case "rent":
        return "text-orange-600";
      case "card":
        return "text-purple-600";
      case "jail":
        return "text-red-600";
      case "building":
        return "text-emerald-600";
      case "trade":
        return "text-indigo-600";
      case "bankruptcy":
        return "text-red-700";
      case "game":
        return "text-yellow-600";
      case "dice":
        return "text-gray-600";
      case "move":
        return "text-gray-700";
      case "turn":
        return "text-gray-500";
      case "skip":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex items-start gap-2 text-xs leading-relaxed">
      {icon && (
        <span
          className="text-sm flex-shrink-0 mt-0.5"
          role="img"
          aria-label={log.type}
        >
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {/* <span className={cn("font-medium", getLogTypeColor(log.type))}> */}
        <span className={cn("font-medium")}>{message}</span>
        {timestamp && (
          <span className="text-muted-foreground ml-2 text-xs">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

interface EnhancedGameLogsProps extends GameLogsProps {
  filterTypes?: GameLogEntry["type"][];
  title?: string;
}

export const EnhancedGameLogs: React.FC<EnhancedGameLogsProps> = ({
  filterTypes,
  title = "Game Events",
  ...props
}) => {
  const { gameLogs } = useGameContext();

  const filteredLogs = filterTypes
    ? gameLogs.filter((log) => filterTypes.includes(log.type))
    : gameLogs;

  return <GameLogsWithFilteredData logs={filteredLogs} {...props} />;
};

interface GameLogsWithFilteredDataProps extends GameLogsProps {
  logs: GameLogEntry[];
}

const GameLogsWithFilteredData: React.FC<GameLogsWithFilteredDataProps> = ({
  logs,
  maxHeight = "h-40",
  showTimestamps = false,
  showIcons = true,
  autoScroll = true,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  if (logs.length === 0) {
    return (
      <ScrollArea className={cn(maxHeight, "w-full rounded-md border")}>
        <div className="p-4 text-center text-muted-foreground text-sm">
          No events to display...
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={cn(maxHeight, "w-full max-w-xs")}
    >
      <div className="p-3 space-y-1">
        {logs.map((log, index) => (
          <GameLogItem
            key={log.id || index}
            log={log}
            showTimestamp={showTimestamps}
            showIcon={showIcons}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
