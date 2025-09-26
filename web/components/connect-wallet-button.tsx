"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutIcon, WalletIcon } from "@/components/ui/icons";
import { useState } from "react";

export function ConnectWalletButton() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <UserMenu onDisconnect={() => setIsConnected(false)} />
      ) : (
        <Button size="lg" onClick={() => setIsConnected(true)}>
          <WalletIcon />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

function UserMenu({ onDisconnect }: { onDisconnect: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Avatar className="rounded-lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom">
        <DropdownMenuItem onClick={onDisconnect}>
          <LogoutIcon />
          <DropdownMenuShortcut>Disconnect</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
