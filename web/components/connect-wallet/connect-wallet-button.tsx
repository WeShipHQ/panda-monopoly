"use client";

import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Copy, CopyCheck, Download, PlugZap, Unplug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn, formatAddress } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { useGameWallet } from "@/hooks/use-game-wallet";
import {
  useExportWallet,
} from "@privy-io/react-auth/solana";


export default function ConnectWalletBtn() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { exportWallet } = useExportWallet();
  const [copy, isCopied] = useCopyToClipboard();
  const { gameWalletAddress} = useGameWallet() || {};
 

  if (!ready) {
    return (
      <Button
        variant="ghost"
        className={cn("size-14 aspect-square p-2 md:p-3")}
        asChild
      >
        <Spinner size={12} variant="bars" />
      </Button>
    );
  }

  const handleCopy = async (address: string) => {
    const success = await copy(address);
    if (success) {
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <div className="">
      {!authenticated ? (
        <Button onClick={login} className="h-full">
          <div className="flex items-center gap-2 group/nav">
            <span>Connect Wallet</span>
            <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
              <PlugZap className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
              <PlugZap className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
            </div>
          </div>
        </Button>
      ) : gameWalletAddress ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-full" asChild>
            <Button
              variant="ghost"
              className={cn("size-14 aspect-square p-2 md:p-3")}
              asChild
            >
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${
                    gameWalletAddress || ""
                  }`}
                  alt={gameWalletAddress || "Wallet"}
                  className="rounded-full bg-accent select-none hover:animate-none hover:scale-105 hover:rotate-[10deg] transition-all duration-300"
                />
                <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                  {gameWalletAddress || "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" align="end">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="size-12 ring-2 ring-primary/10">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${
                    gameWalletAddress || ""
                  }`}
                  alt={gameWalletAddress || "Wallet"}
                  className="rounded-full bg-muted p-1 hover:scale-105 hover:rotate-[10deg] transition-all duration-300"
                />
                <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                  {gameWalletAddress?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {formatAddress(gameWalletAddress.toString())}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(gameWalletAddress.toString());
                    }}
                  >
                    {isCopied ? (
                      <CopyCheck size={16} className="text-primary" />
                    ) : (
                      <Copy size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                </div >
                <p className="text-sm text-muted-foreground">
                 Embedded wallet <Link href="https://docs.privy.io/wallets/overview" target="_blank" className="text-primary underline">learn more</Link>
                </p>
                </div>
              
            </div>
            <DropdownMenuItem
              onClick={() => exportWallet({ address: gameWalletAddress })}
              className="flex items-center justify-between "
            >
              <span>Export your embedded wallet</span>
              <Download size={14} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={logout}
              variant="destructive"
              className="flex items-center justify-between "
            >
              <span>Disconnect</span>
              <Unplug size={14} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          className={cn("size-14 aspect-square p-2 md:p-3")}
          asChild
        >
          <Spinner size={12} variant="bars" />
        </Button>
      )}
    </div>
  );
}