import { Toaster } from "@/components/ui/sonner";
import WalletProvider from "./wallet-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-center" />
      {children}
    </>
  );
}
