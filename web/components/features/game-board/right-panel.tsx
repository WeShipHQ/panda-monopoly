"use client";

import { TradeItems } from "./trade-items";

export function RightPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <TradeItems />
    </div>
  );
}
