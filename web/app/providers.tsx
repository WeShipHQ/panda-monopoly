"use client";
import { GameProvider } from "@/components/game-provider";
import {
  createSolanaDevnet,
  createSolanaLocalnet,
  createSolanaTestnet,
  createStorageCluster,
  createWalletUiConfig,
  WalletUi,
} from "@wallet-ui/react";
import React from "react";

export const storageCluster = createStorageCluster();
export const walletUiConfig = createWalletUiConfig({
  clusters: [
    createSolanaDevnet(),
    createSolanaLocalnet(),
    createSolanaTestnet(),
  ],
  clusterStorage: storageCluster,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletUi config={walletUiConfig}>
      <GameProvider>{children}</GameProvider>
    </WalletUi>
  );
}
