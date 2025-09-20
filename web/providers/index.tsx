import { Toaster } from "@/components/ui/sonner";
import WalletProvider from "./wallet-provider";
import { GameProvider } from "@/components/game-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GameProvider>
        <Toaster position="top-center" />
        {children}
      </GameProvider>
    </>
  );
}
