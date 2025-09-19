"use client";
import dynamic from "next/dynamic";

export const AccountDropdown = dynamic(
  () => import("@wallet-ui/react").then((m) => m.WalletUiDropdown),
  { ssr: false }
);

export const ClusterDropdown = dynamic(
  () => import("@wallet-ui/react").then((m) => m.WalletUiClusterDropdown),
  {
    ssr: false,
  }
);
