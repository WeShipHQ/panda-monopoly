"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameContext } from "@/components/providers/game-provider";
import {
  boardData,
  colorMap,
  type BoardSpace,
  type PropertySpace,
  type RailroadSpace,
  type UtilitySpace,
} from "@/configs/board-data";

export function OwnedProperties() {
  const { gameState, currentPlayerState } = useGameContext();

  if (!currentPlayerState || !gameState) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My properties (0)</h2>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-500 text-sm">No properties owned</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ownedPropertyPositions = Array.from(
    currentPlayerState.propertiesOwned || new Set()
  );
  const ownedProperties = ownedPropertyPositions
    .map((position) => boardData.find((space) => space.position === position))
    .filter(
      (space): space is PropertySpace | RailroadSpace | UtilitySpace =>
        space !== undefined &&
        (space.type === "property" ||
          space.type === "railroad" ||
          space.type === "utility")
    );

  const getPropertyIcon = (
    property: PropertySpace | RailroadSpace | UtilitySpace
  ) => {
    if (property.type === "property") {
      return (
        <div
          className="w-4 h-4 rounded-sm border border-gray-300"
          style={{ backgroundColor: colorMap[property.colorGroup] }}
        />
      );
    } else if (property.type === "railroad") {
      return (
        <div className="w-4 h-4 rounded-sm bg-black flex items-center justify-center">
          <span className="text-white text-xs font-bold">🚂</span>
        </div>
      );
    } else {
      return (
        <div className="w-4 h-4 rounded-sm bg-gray-400 flex items-center justify-center">
          <span className="text-white text-xs font-bold">⚡</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        My properties ({ownedProperties.length})
      </h2>

      <div className="space-y-2">
        {ownedProperties.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 text-sm">No properties owned</p>
            </CardContent>
          </Card>
        ) : (
          ownedProperties.map((property) => (
            <Card
              key={property.position}
              className="hover:bg-gray-50 transition-colors py-3"
            >
              <CardContent className="px-3">
                <div className="flex items-center space-x-3">
                  {getPropertyIcon(property)}
                  <div className="flex-1 flex gap-3 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {property.name}
                    </p>
                    {property.type === "property" && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          //   variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: colorMap[property.colorGroup],
                            color: colorMap[property.colorGroup],
                          }}
                        >
                          {property.colorGroup}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
