"use client";

import { PlayerList } from "./player-list";
import { OwnedProperties } from "./owned-properties";
import { BonusItems } from "./bonus-items";

export function LeftPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <PlayerList />
      <OwnedProperties />
      <BonusItems />
    </div>
  );
}
