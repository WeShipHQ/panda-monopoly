import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PropertyAccount } from "@/types/schema";
import { address, Address } from "@solana/kit";
import { cn, formatAddress, formatPrice } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  HotelIcon,
  HouseIcon,
} from "lucide-react";
import {
  PropertySpace,
  RailroadSpace,
  UtilitySpace,
  TaxSpace,
  colorMap,
} from "@/configs/board-data";
import { getBoardSide, hasColorGroupMonopoly } from "@/lib/board-utils";
import { useWallet } from "@/hooks/use-wallet";
import { useGameContext } from "@/components/providers/game-provider";
import { Button } from "@/components/ui/button";
import { BuildingType } from "@/lib/sdk/generated";

interface BasePopoverProps {
  children: React.ReactNode;
  property?: PropertyAccount | null;
}

const getOwner = (property?: PropertyAccount | null): Address | null => {
  return !!property && property.owner ? address(property.owner) : null;
};

// Property popover props
interface PropertyPopoverProps extends BasePopoverProps {
  propertyData: PropertySpace;
}

export const PropertyPopover: React.FC<PropertyPopoverProps> = ({
  children,
  propertyData,
  property,
}) => {
  const { wallet } = useWallet();
  const {
    buildHouse,
    buildHotel,
    sellBuilding,
    properties,
    players,
    currentPlayerState,
  } = useGameContext();

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const owner = getOwner(property);
  const houses = property?.houses || 0;
  const hasHotel = property?.hasHotel || false;
  const isMortgaged = property?.isMortgaged || false;
  const color = colorMap[propertyData.colorGroup];
  const side = getBoardSide(propertyData.position);

  // Check if current player owns this property
  const isOwnedByCurrentPlayer = owner === wallet?.address;

  // Check if current player has monopoly
  const hasMonopoly =
    currentPlayerState && isOwnedByCurrentPlayer
      ? hasColorGroupMonopoly(
          currentPlayerState,
          propertyData.colorGroup,
          properties
        )
      : false;

  // Building management logic
  const canBuildHouse = hasMonopoly && !hasHotel && houses < 4 && !isMortgaged;
  const canBuildHotel =
    hasMonopoly && houses === 4 && !hasHotel && !isMortgaged;
  const canSellHouse = hasMonopoly && houses > 0 && !hasHotel && !isMortgaged;
  const canSellHotel = hasMonopoly && hasHotel && !isMortgaged;

  const handleBuildHouse = async () => {
    if (!canBuildHouse) return;

    setIsLoading("buildHouse");
    try {
      await buildHouse(propertyData.position);
    } catch (error) {
      console.error("Error building house:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleBuildHotel = async () => {
    if (!canBuildHotel) return;

    setIsLoading("buildHotel");
    try {
      await buildHotel(propertyData.position);
    } catch (error) {
      console.error("Error building hotel:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSellBuilding = async (buildingType: BuildingType) => {
    if (!hasMonopoly) return;

    setIsLoading(`sell${buildingType}`);
    try {
      console.log(
        `Selling ${buildingType} at position ${propertyData.position}`
      );
      await sellBuilding(propertyData.position, buildingType);
    } catch (error) {
      console.error(`Error selling ${buildingType}:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        className="p-0 border-0 bg-transparent shadow-lg w-auto"
      >
        <Card className="w-64 bg-white border-2 gap-0 border-black py-0 rounded-none overflow-hidden">
          <CardHeader
            className={cn("gap-0 border-b-2 border-black py-3")}
            style={{ backgroundColor: color }}
          >
            <CardTitle className="text-center text-white">
              {propertyData.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Rent</span>
                <span className="font-medium">
                  {formatPrice(propertyData.baseRent || 0)}
                </span>
              </div>

              {propertyData.rentWithColorGroup && (
                <div className="flex justify-between text-sm">
                  <span>Rent with colour set</span>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWithColorGroup || 0)}
                  </span>
                </div>
              )}

              {propertyData.rentWith1House && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <span>Rent with</span>
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <HouseIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWith1House || 0)}
                  </span>
                </div>
              )}

              {propertyData.rentWith2Houses && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <span>Rent with</span>
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <HouseIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWith2Houses || 0)}
                  </span>
                </div>
              )}

              {propertyData.rentWith3Houses && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <span>Rent with</span>
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <HouseIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWith3Houses || 0)}
                  </span>
                </div>
              )}

              {propertyData.rentWith4Houses && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <span>Rent with</span>
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <HouseIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWith4Houses || 0)}
                  </span>
                </div>
              )}

              {propertyData.rentWithHotel && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <span>Rent with</span>
                    <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H</span>
                    </div>
                    <HotelIcon className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-medium">
                    {formatPrice(propertyData.rentWithHotel || 0)}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Cost information */}
            {propertyData.houseCost && (
              <div className="flex justify-between text-sm">
                <span>House cost</span>
                <span className="font-medium">
                  {formatPrice(propertyData.houseCost || 0)}
                </span>
              </div>
            )}

            {propertyData.houseCost && (
              <div className="flex justify-between text-sm">
                <span>Hotel cost</span>
                <span className="font-medium">
                  {formatPrice(propertyData.houseCost || 0)}
                </span>
              </div>
            )}

            {propertyData.mortgageValue && (
              <div className="flex justify-between text-sm">
                <span>Mortgage value</span>
                <span className="font-medium">
                  {formatPrice(propertyData.mortgageValue || 0)}
                </span>
              </div>
            )}

            {owner && (
              <>
                <Separator className="my-3" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <Badge>
                    {!!owner ? formatAddress(owner) || "Unknown" : "Unowned"}
                  </Badge>
                </div>

                {!!owner && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Houses:</span>
                      <div className="flex items-center gap-2">
                        <p className="text-base">{houses}</p>
                        {isOwnedByCurrentPlayer && hasMonopoly && (
                          <>
                            {!hasHotel && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  disabled={
                                    !canSellHouse || isLoading === "sellhouse"
                                  }
                                  onClick={() =>
                                    handleSellBuilding(BuildingType.House)
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={
                                    !canBuildHouse || isLoading === "buildHouse"
                                  }
                                  onClick={handleBuildHouse}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hotel:</span>
                      <div className="flex items-center gap-2">
                        <p className="text-base">{hasHotel ? "Yes" : "No"}</p>

                        {isOwnedByCurrentPlayer && hasMonopoly && (
                          <div className="flex items-center gap-1">
                            {hasHotel ? (
                              <Button
                                size="sm"
                                disabled={
                                  !canSellHotel || isLoading === "sellhotel"
                                }
                                onClick={() =>
                                  handleSellBuilding(BuildingType.Hotel)
                                }
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={
                                  !canBuildHotel || isLoading === "buildHotel"
                                }
                                onClick={handleBuildHotel}
                                className="h-6 w-6 p-0"
                              >
                                <Building2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isMortgaged && (
                      <div className="text-center mt-2">
                        <Badge variant="neutral">MORTGAGED</Badge>
                      </div>
                    )}

                    {/* Monopoly Management Section */}
                    {isOwnedByCurrentPlayer && hasMonopoly && (
                      <>
                        <Separator className="my-3 hidden" />
                        <div className="space-y-2 hidden">
                          <div className="text-sm font-medium text-center">
                            <Badge variant="default" className="bg-green-600">
                              MONOPOLY
                            </Badge>
                          </div>

                          {/* Building Management */}
                          <div className="space-y-2">
                            {/* House Management */}
                            {!hasHotel && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <HouseIcon className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">
                                    Houses ({houses}/4)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    disabled={
                                      !canSellHouse || isLoading === "sellhouse"
                                    }
                                    onClick={() =>
                                      handleSellBuilding(BuildingType.House)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={
                                      !canBuildHouse ||
                                      isLoading === "buildHouse"
                                    }
                                    onClick={handleBuildHouse}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Hotel Management */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <HotelIcon className="w-4 h-4 text-red-600" />
                                <span className="text-sm">Hotel</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {hasHotel ? (
                                  <Button
                                    size="sm"
                                    // variant="outline"
                                    disabled={
                                      !canSellHotel || isLoading === "sellhotel"
                                    }
                                    onClick={() =>
                                      handleSellBuilding(BuildingType.Hotel)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    // variant="outline"
                                    disabled={
                                      !canBuildHotel ||
                                      isLoading === "buildHotel"
                                    }
                                    onClick={handleBuildHotel}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Building2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Property Actions */}
                          <div className="pt-2">
                            <Button
                              size="sm"
                              // variant="destructive"
                              className="w-full h-7 text-xs"
                              disabled={isMortgaged}
                              onClick={() => {
                                // TODO: Implement mortgage property functionality
                                console.log(
                                  "Mortgage property:",
                                  propertyData.position
                                );
                              }}
                            >
                              {isMortgaged ? "Mortgaged" : "Mortgage Property"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Railroad popover props
interface RailroadPopoverProps extends BasePopoverProps {
  propertyData: RailroadSpace;
}

export const RailroadPopover: React.FC<RailroadPopoverProps> = ({
  children,
  propertyData,
  property,
}) => {
  const owner = getOwner(property);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        className="p-0 border-0 bg-transparent shadow-lg w-auto"
      >
        <Card className="w-64 rounded-none py-0 bg-white border-2 border-black gap-0">
          <CardHeader className="gap-0 border-b-2 border-black py-3">
            <CardTitle className="text-center">{propertyData.name}</CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            {propertyData.railroadRent && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Rent (1 Railroad)</span>
                  <span className="font-medium">
                    {formatPrice(propertyData.railroadRent[0] || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rent (2 Railroads)</span>
                  <span className="font-medium">
                    {formatPrice(propertyData.railroadRent[1])}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rent (3 Railroads)</span>
                  <span className="font-medium">
                    {formatPrice(propertyData.railroadRent[2])}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rent (4 Railroads)</span>
                  <span className="font-medium">
                    {formatPrice(propertyData.railroadRent[3])}
                  </span>
                </div>
              </div>
            )}

            <Separator className="my-3" />

            {propertyData.price && (
              <div className="flex justify-between text-sm">
                <span>Price</span>
                <span className="font-medium">
                  {formatPrice(propertyData.price || 0)}
                </span>
              </div>
            )}

            {!!owner && (
              <>
                <Separator className="my-3" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <Badge variant={!!owner ? "default" : "neutral"}>
                    {!!owner ? formatAddress(owner) || "Unknown" : "Unowned"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Utility popover props
interface UtilityPopoverProps extends BasePopoverProps {
  propertyData: UtilitySpace;
}

export const UtilityPopover: React.FC<UtilityPopoverProps> = ({
  children,
  propertyData,
  property,
}) => {
  const owner = getOwner(property);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        className="p-0 border-0 bg-transparent shadow-lg w-auto"
      >
        <Card className="w-64 rounded-none py-0 bg-white border-2 border-black gap-0">
          <CardHeader className="gap-0 border-b-2 border-black py-3">
            <CardTitle className="text-center">
              {propertyData.name}
              {propertyData.name.includes("Electric") ? "💡" : "💧"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            {propertyData.utilityMultiplier && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Rent (1 Utility)</span>
                  <span className="font-medium">
                    {propertyData.utilityMultiplier[0]}x dice roll
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rent (2 Utilities)</span>
                  <span className="font-medium">
                    {propertyData.utilityMultiplier[1]}x dice roll
                  </span>
                </div>
              </div>
            )}

            {owner && (
              <>
                <Separator className="my-3" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <Badge variant={owner ? "default" : "neutral"}>
                    {owner ? formatAddress(owner) || "Unknown" : "Unowned"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Tax Popover Component
interface TaxPopoverProps {
  children: React.ReactNode;
  propertyData: TaxSpace;
}

export const TaxPopover: React.FC<TaxPopoverProps> = ({
  children,
  propertyData,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        className="p-0 border-0 bg-transparent shadow-lg w-auto"
      >
        <Card className="w-64 rounded-none bg-white border-2 border-black">
          <CardHeader className="pb-2 bg-white border-b-2 border-black">
            <div className="text-center">
              <div className="text-sm font-bold">{propertyData.name}</div>
              <div className="text-2xl mt-2">💎</div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tax Amount</span>
              <span className="font-medium">
                {formatPrice(propertyData.taxAmount)}
              </span>
            </div>

            {propertyData.instructions && (
              <div className="text-sm text-muted-foreground mt-3 p-2 bg-muted rounded-md">
                {propertyData.instructions}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Special Space Popover Component (GO, Jail, Free Parking, etc.)
interface SpecialPopoverProps extends BasePopoverProps {
  propertyData: any;
}

export const SpecialPopover: React.FC<SpecialPopoverProps> = ({
  children,
  propertyData,
}) => {
  const getSpecialIcon = (name: string) => {
    if (name === "GO") return "→";
    if (name === "JAIL") return "🔒";
    if (name === "Free Parking") return "🅿️";
    if (name === "Go To Jail") return "👮";
    if (name === "Chance") return "?";
    if (name === "Community Chest") return "📦";
    return "❓";
  };

  const getSpecialDescription = (name: string) => {
    if (name === "GO") return "Collect $200 when you pass or land here";
    if (name === "JAIL") return "Just visiting or serving time";
    if (name === "Free Parking") return "Free resting space";
    if (name === "Go To Jail") return "Go directly to jail";
    if (name === "Chance") return "Draw a Chance card";
    if (name === "Community Chest") return "Draw a Community Chest card";
    return "Special space";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        className="p-0 border-0 bg-transparent shadow-lg w-auto"
      >
        <Card className="w-64 bg-white border-2 border-black rounded-none">
          <CardHeader className="pb-2 bg-white border-b-2 border-black">
            <div className="text-center">
              <div className="text-sm font-bold">{propertyData.name}</div>
              <div className="text-2xl mt-2">
                {getSpecialIcon(propertyData.name)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
              {getSpecialDescription(propertyData.name)}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
