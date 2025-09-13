import { Toaster } from "@/components/ui/sonner";
import WalletProvider from "./wallet-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
        <Toaster position="top-center" />
        {children}
    </WalletProvider>
  );
}