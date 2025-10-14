"use client";

import { PlayerList } from "./player-list";
import { RoomUrlShare } from "./room-url-share";

export function LeftPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <RoomUrlShare />
      <PlayerList />
    </div>
  );
}
