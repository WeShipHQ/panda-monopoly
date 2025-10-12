"use client";

import { TradeView } from "./trade-view";
import { BankruptcyButton } from "./bankruptcy-button";
import { ClaimRewardButton } from "./claim-reward-button";
import envConfig from "@/configs/env";
import { DebugUI } from "./debug-ui";

export function RightPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <TradeView />
      <BankruptcyButton />
      <ClaimRewardButton />

      {envConfig.IS_DEVELOPMENT && <DebugUI />}
    </div>
  );
}
