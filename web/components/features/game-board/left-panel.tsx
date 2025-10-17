"use client";

import { PlayerList } from "./player-list";
import { RoomUrlShare } from "./room-url-share";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SoundControl } from "@/components/sound-control";
import { RotateCcw, RotateCw } from "lucide-react";

interface LeftPanelProps {
  onRotateCW: () => void;
  onRotateCCW: () => void;
  boardRotation: number;
}

export function LeftPanel({
  onRotateCW,
  onRotateCCW,
  boardRotation,
}: LeftPanelProps) {
  return (
    <div className="p-4 pr-2 lg:pr-4 space-y-4 md:space-y-6 h-full overflow-auto">
      <RoomUrlShare />
      <PlayerList />

      {/* Game Settings */}
      <Card className="bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-semibold tracking-wide">
            Game Settings
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sound</span>
            <SoundControl />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Board Rotation
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="neutral"
                size="icon"
                onClick={onRotateCCW}
                // className="bg-white/90 hover:bg-white shadow-sm"
                title="Rotate left"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="neutral"
                size="icon"
                onClick={onRotateCW}
                // className="bg-white/90 hover:bg-white shadow-sm"
                title="Rotate right"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
