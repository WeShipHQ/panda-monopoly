"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useGameContext } from "@/components/providers/game-provider";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/utils";
import { getTypedSpaceData } from "@/lib/board-utils";
import { colorMap, ColorGroup } from "@/configs/board-data";
import { PropertyAccount, TradeOffer } from "@/types/schema";

type TradeType =
  | "money-money"
  | "money-property"
  | "property-money"
  | "property-property";

interface CreateTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MoneySelectionProps {
  label: string;
  value: number;
  maxValue: number;
  onChange: (value: number) => void;
  id: string;
  disabled?: boolean;
}

function MoneySelection({
  label,
  value,
  maxValue,
  onChange,
  id,
  disabled = false,
}: MoneySelectionProps) {
  if (maxValue <= 0) {
    return (
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="text-sm text-muted-foreground">
          No money available (${maxValue})
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <span className="text-lg font-semibold text-primary">${value}</span>
      </div>
      <div className="px-2">
        <Slider
          id={id}
          min={0}
          max={maxValue}
          step={10}
          value={[value]}
          onValueChange={(val) => onChange(val[0])}
          disabled={disabled}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>$0</span>
        <span>${maxValue}</span>
      </div>
    </div>
  );
}

interface PropertySelectionProps {
  label: string;
  value: string;
  properties: PropertyAccount[];
  onChange: (value: string) => void;
  id: string;
  placeholder?: string;
  disabled?: boolean;
}

function PropertySelection({
  label,
  value,
  properties,
  onChange,
  id,
  placeholder = "Select property",
  disabled = false,
}: PropertySelectionProps) {
  if (properties.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="text-sm text-muted-foreground">No properties available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm mb-2">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => {
            const space = getTypedSpaceData(property.position, "property");
            const color = colorMap[space?.colorGroup as ColorGroup] || "";
            return (
              <SelectItem
                key={property.address}
                value={property.position.toString()}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className="w-3 h-3 rounded shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate inline-block">{space?.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CreateTradeDialog({
  open,
  onOpenChange,
}: CreateTradeDialogProps) {
  const { players, properties, createTrade } = useGameContext();
  const { wallet } = useWallet();

  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedPlayerAddress, setSelectedPlayerAddress] =
    useState<string>("");
  const [tradeType, setTradeType] = useState<TradeType>("money-money");
  const [offerMoney, setOfferMoney] = useState(0);
  const [offerProperty, setOfferProperty] = useState("");
  const [requestMoney, setRequestMoney] = useState(0);
  const [requestProperty, setRequestProperty] = useState("");

  // Filter out current player from available players
  const currentPlayerState = players.find(
    (player) => player.wallet === wallet?.address
  );

  const availablePlayers = players.filter(
    (player) => player.wallet !== wallet?.address
  );

  const currentPlayerProperties = properties.filter(
    (property) => property.owner === wallet?.address
  );

  const selectedPlayer = availablePlayers.find(
    (player) => player.wallet === selectedPlayerAddress
  );

  const selectedPlayerProperties = properties.filter(
    (property) => property.owner === selectedPlayerAddress
  );

  const currentPlayerMoney = Number(currentPlayerState?.cashBalance || 0);
  const selectedPlayerMoney = Number(selectedPlayer?.cashBalance || 0);

  const availableTradeTypes = useMemo(() => {
    const types = [];

    // Money for Money - both players need money
    if (currentPlayerMoney > 0 && selectedPlayerMoney > 0) {
      types.push("money-money");
    }

    // Money for Property - current player needs money, selected player needs properties
    if (currentPlayerMoney > 0 && selectedPlayerProperties.length > 0) {
      types.push("money-property");
    }

    // Property for Money - current player needs properties, selected player needs money
    if (currentPlayerProperties.length > 0 && selectedPlayerMoney > 0) {
      types.push("property-money");
    }

    // Property for Property - both players need properties
    if (
      currentPlayerProperties.length > 0 &&
      selectedPlayerProperties.length > 0
    ) {
      types.push("property-property");
    }

    return types;
  }, [
    currentPlayerMoney,
    selectedPlayerMoney,
    currentPlayerProperties.length,
    selectedPlayerProperties.length,
  ]);

  // Auto-select first available trade type when player is selected
  const handlePlayerSelection = (playerAddress: string) => {
    setSelectedPlayerAddress(playerAddress);
    setOfferMoney(0);
    setOfferProperty("");
    setRequestMoney(0);
    setRequestProperty("");

    // Auto-select first available trade type
    if (availableTradeTypes.length > 0) {
      setTradeType(availableTradeTypes[0] as TradeType);
    }
  };

  const handleCreateTrade = async () => {
    if (!selectedPlayerAddress || !currentPlayerState) return;

    // Create trade offers based on trade type
    const initiatorOffer: TradeOffer = {
      money: "0",
      property: null,
    };

    const targetOffer: TradeOffer = {
      money: "0",
      property: null,
    };

    if (tradeType === "money-money" || tradeType === "money-property") {
      initiatorOffer.money = offerMoney.toString();
    }
    if (tradeType === "property-money" || tradeType === "property-property") {
      initiatorOffer.property = offerProperty ? parseInt(offerProperty) : null;
    }

    if (tradeType === "money-money" || tradeType === "property-money") {
      targetOffer.money = requestMoney.toString();
    }
    if (tradeType === "money-property" || tradeType === "property-property") {
      targetOffer.property = requestProperty ? parseInt(requestProperty) : null;
    }

    try {
      setIsRequesting(true);
      await createTrade(selectedPlayerAddress, initiatorOffer, targetOffer);
      onOpenChange(false);
      // Reset form
      setSelectedPlayerAddress("");
      setTradeType("money-money");
      setOfferMoney(0);
      setOfferProperty("");
      setRequestMoney(0);
      setRequestProperty("");
    } catch (error) {
      console.error("Failed to create trade:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const isFormValid = () => {
    if (!selectedPlayerAddress || availableTradeTypes.length === 0)
      return false;

    switch (tradeType) {
      case "money-money":
        return offerMoney > 0 && requestMoney > 0;
      case "money-property":
        return offerMoney > 0 && requestProperty;
      case "property-money":
        return offerProperty && requestMoney > 0;
      case "property-property":
        return offerProperty && requestProperty;
      default:
        return false;
    }
  };

  const getTradeTypeDisabledReason = (type: TradeType): string | null => {
    switch (type) {
      case "money-money":
        if (currentPlayerMoney <= 0) return "You have no money to offer";
        if (selectedPlayerMoney <= 0) return "Selected player has no money";
        return null;
      case "money-property":
        if (currentPlayerMoney <= 0) return "You have no money to offer";
        if (selectedPlayerProperties.length === 0)
          return "Selected player has no properties";
        return null;
      case "property-money":
        if (currentPlayerProperties.length === 0)
          return "You have no properties to offer";
        if (selectedPlayerMoney <= 0) return "Selected player has no money";
        return null;
      case "property-property":
        if (currentPlayerProperties.length === 0)
          return "You have no properties to offer";
        if (selectedPlayerProperties.length === 0)
          return "Selected player has no properties";
        return null;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Trade Offer</DialogTitle>
          <DialogDescription>
            Select a player and choose what you want to trade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label htmlFor="player">Trade With</Label>
            <Select
              value={selectedPlayerAddress}
              onValueChange={handlePlayerSelection}
            >
              <SelectTrigger id="player">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((player) => (
                  <SelectItem key={player.address} value={player.wallet}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 rounded-full overflow-hidden">
                        <AvatarImage
                          walletAddress={player.wallet}
                          alt={`Player ${player.address}`}
                        />
                        <AvatarFallback
                          walletAddress={player.wallet}
                          className="text-white font-semibold"
                        >
                          {wallet?.address === player.wallet
                            ? "You"
                            : formatAddress(player.address)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{formatAddress(player.address)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trade Type Selection */}
          {/* {selectedPlayerAddress && availableTradeTypes.length > 0 && ( */}
          <div className="space-y-3">
            <Label>Trade Type</Label>
            <RadioGroup
              value={tradeType}
              onValueChange={(value) => setTradeType(value as TradeType)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    value: "money-money",
                    title: "Money for Money",
                    desc: "Exchange cash amounts",
                  },
                  {
                    value: "money-property",
                    title: "Money for Property",
                    desc: "Offer cash for a property",
                  },
                  {
                    value: "property-money",
                    title: "Property for Money",
                    desc: "Offer property for cash",
                  },
                  {
                    value: "property-property",
                    title: "Property for Property",
                    desc: "Exchange properties",
                  },
                ].map((option) => {
                  const isDisabled = !availableTradeTypes.includes(
                    option.value
                  );
                  const disabledReason = getTradeTypeDisabledReason(
                    option.value as TradeType
                  );

                  return (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer transition-colors ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed bg-muted"
                          : "hover:border-primary"
                      }`}
                    >
                      <label
                        className={`flex items-center gap-3 ${
                          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          disabled={isDisabled}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {option.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isDisabled ? disabledReason : option.desc}
                          </div>
                        </div>
                      </label>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
          {/* )} */}

          {/* Trade Details */}
          {selectedPlayerAddress && availableTradeTypes.includes(tradeType) && (
            <Card>
              <CardContent className="flex gap-4">
                {/* Your Offer */}
                <div className="flex-1 space-y-3">
                  <Label className="text-base font-semibold">You Offer</Label>
                  {(tradeType === "money-money" ||
                    tradeType === "money-property") && (
                    <MoneySelection
                      label="Amount"
                      value={offerMoney}
                      maxValue={currentPlayerMoney}
                      onChange={setOfferMoney}
                      id="offer-money"
                    />
                  )}
                  {(tradeType === "property-money" ||
                    tradeType === "property-property") && (
                    <PropertySelection
                      label="Property"
                      value={offerProperty}
                      properties={currentPlayerProperties}
                      onChange={setOfferProperty}
                      id="offer-property"
                    />
                  )}
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center pt-6">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* You Request */}
                <div className="flex-1 space-y-3">
                  <Label className="text-base font-semibold">You Request</Label>
                  {(tradeType === "money-money" ||
                    tradeType === "property-money") && (
                    <MoneySelection
                      label="Amount"
                      value={requestMoney}
                      maxValue={selectedPlayerMoney}
                      onChange={setRequestMoney}
                      id="request-money"
                    />
                  )}
                  {(tradeType === "money-property" ||
                    tradeType === "property-property") && (
                    <PropertySelection
                      label="Property"
                      value={requestProperty}
                      properties={selectedPlayerProperties}
                      onChange={setRequestProperty}
                      id="request-property"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTrade}
              loading={isRequesting}
              disabled={!isFormValid()}
            >
              Send Trade Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
