import { GameProvider } from "@/components/providers/game-provider";
import { RpcProvider } from "@/components/providers/rpc-provider";
import { PrivyWalletProvider } from "./privy-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RpcProvider>
      <PrivyWalletProvider>
        <GameProvider>{children}</GameProvider>
      </PrivyWalletProvider>
    </RpcProvider>
  );
}
