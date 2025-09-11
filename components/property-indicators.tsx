"use client";

import React from "react";

interface PropertyIndicatorProps {
    position: number;
    ownerId?: number;
    ownerColor?: string;
    houses: number;
    hasHotel: boolean;
    isMortgaged: boolean;
}

export const PropertyIndicator: React.FC<PropertyIndicatorProps> = ({
    position,
    ownerId,
    ownerColor,
    houses,
    hasHotel,
    isMortgaged
}) => {
    if (!ownerId) return null;

    // Position indicators based on board position
    const getIndicatorPosition = (pos: number) => {
        // Same positioning logic as tokens but offset for property indicators
        if (pos === 0) {
            return { left: '92.85%', top: '88%' }; // GO
        } else if (pos === 1) {
            return { left: '78.55%', top: '88%' }; // Baltic Ave
        } else if (pos === 2) {
            return { left: '64.25%', top: '88%' }; // Oriental Ave
        } else if (pos === 3) {
            return { left: '49.95%', top: '88%' }; // Chance
        } else if (pos === 4) {
            return { left: '35.65%', top: '88%' }; // Vermont Ave
        } else if (pos === 5) {
            return { left: '21.35%', top: '88%' }; // Connecticut Ave
        } else if (pos === 6) {
            return { left: '7.15%', top: '88%' }; // JAIL
        } else if (pos === 7) {
            return { left: '11.5%', top: '78.55%' }; // States Ave
        } else if (pos === 8) {
            return { left: '11.5%', top: '64.25%' }; // Virginia Ave
        } else if (pos === 9) {
            return { left: '11.5%', top: '49.95%' }; // Community Chest
        } else if (pos === 10) {
            return { left: '11.5%', top: '35.65%' }; // Tennessee Ave
        } else if (pos === 11) {
            return { left: '11.5%', top: '21.35%' }; // New York Ave
        } else if (pos === 12) {
            return { left: '7.15%', top: '11.5%' }; // Free Parking
        } else if (pos === 13) {
            return { left: '21.35%', top: '11.5%' }; // Kentucky Ave
        } else if (pos === 14) {
            return { left: '35.65%', top: '11.5%' }; // Indiana Ave
        } else if (pos === 15) {
            return { left: '49.95%', top: '11.5%' }; // Chance
        } else if (pos === 16) {
            return { left: '64.25%', top: '11.5%' }; // Atlantic Ave
        } else if (pos === 17) {
            return { left: '78.55%', top: '11.5%' }; // Marvin Gardens
        } else if (pos === 18) {
            return { left: '92.85%', top: '11.5%' }; // Go To Jail
        } else if (pos === 19) {
            return { left: '88.5%', top: '21.35%' }; // Pacific Ave
        } else if (pos === 20) {
            return { left: '88.5%', top: '35.65%' }; // N. Carolina Ave
        } else if (pos === 21) {
            return { left: '88.5%', top: '49.95%' }; // Community Chest
        } else if (pos === 22) {
            return { left: '88.5%', top: '64.25%' }; // Park Place
        } else if (pos === 23) {
            return { left: '88.5%', top: '78.55%' }; // Boardwalk
        } else {
            return { left: '50%', top: '50%' };
        }
    };

    const indicatorPos = getIndicatorPosition(position);

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: indicatorPos.left,
                top: indicatorPos.top,
                transform: 'translate(-50%, -50%)',
                zIndex: 900
            }}
        >
            {/* Owner indicator */}
            <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: ownerColor }}
            />

            {/* Mortgage indicator */}
            {isMortgaged && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}

            {/* Houses */}
            {houses > 0 && !hasHotel && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {Array.from({ length: houses }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 border border-white"
                            style={{
                                backgroundColor: ownerColor,
                                fontSize: '6px'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Hotel */}
            {hasHotel && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div
                        className="w-2 h-2 border border-white text-white text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: ownerColor }}
                    >
                        H
                    </div>
                </div>
            )}
        </div>
    );
};

interface PropertyIndicatorsContainerProps {
    propertyOwnership: { [position: number]: number };
    players: Array<{ id: number; color: string }>;
    propertyBuildings: { [position: number]: { houses: number; hasHotel: boolean } };
    mortgagedProperties: number[];
}

export const PropertyIndicatorsContainer: React.FC<PropertyIndicatorsContainerProps> = ({
    propertyOwnership,
    players,
    propertyBuildings,
    mortgagedProperties
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 900 }}>
            {Object.entries(propertyOwnership).map(([positionStr, ownerId]) => {
                const position = parseInt(positionStr);
                const owner = players.find(p => p.id === ownerId);
                const buildings = propertyBuildings[position] || { houses: 0, hasHotel: false };
                const isMortgaged = mortgagedProperties.includes(position);

                if (!owner) return null;

                return (
                    <PropertyIndicator
                        key={position}
                        position={position}
                        ownerId={ownerId}
                        ownerColor={owner.color}
                        houses={buildings.houses}
                        hasHotel={buildings.hasHotel}
                        isMortgaged={isMortgaged}
                    />
                );
            })}
        </div>
    );
};
