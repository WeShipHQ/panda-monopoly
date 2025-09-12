"use client";

import React from "react";

export interface Player {
    id: number;
    name: string;
    color: string;
    avatar: string; // Path to player avatar image
    position: number;
    money: number;
    properties: number[];
    inJail: boolean;
    jailTurns: number;
}

interface PlayerTokenProps {
    player: Player;
    position: number;
    boardRotation: number;
    playersOnSameSpace: Player[];
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
    player,
    position,
    boardRotation,
    playersOnSameSpace
}) => {
    // Position token based on board position (40 spaces total)
    const getTokenPosition = (pos: number) => {
        // 14x14 grid with 2x2 corner spaces and 2x2 side spaces
        // Each grid cell is approximately 7.14% wide (100% / 14)
        const cellSize = 7.14;
        const cornerCenter = 10.71; // Center of 2x2 corner (1.5 cells from edge)
        const sideSpaceCenter = 17.86; // Center position for 2x2 side spaces

        if (pos === 0) {
            // GO corner (bottom-right) - center of 2x2 corner
            return { left: `${100 - cornerCenter}%`, top: `${100 - cornerCenter}%` };
        } else if (pos >= 1 && pos <= 9) {
            // Bottom row (right to left from GO) - center of 2x2 side spaces
            const spaceIndex = pos - 1;
            const left = 100 - sideSpaceCenter - (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
            return { left: `${left}%`, top: `${100 - cornerCenter}%` };
        } else if (pos === 10) {
            // JAIL corner (bottom-left) - center of 2x2 corner
            return { left: `${cornerCenter}%`, top: `${100 - cornerCenter}%` };
        } else if (pos >= 11 && pos <= 19) {
            // Left column (bottom to top) - center of 2x2 side spaces
            const spaceIndex = pos - 11;
            const top = 100 - sideSpaceCenter - (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
            return { left: `${cornerCenter}%`, top: `${top}%` };
        } else if (pos === 20) {
            // Free Parking corner (top-left) - center of 2x2 corner
            return { left: `${cornerCenter}%`, top: `${cornerCenter}%` };
        } else if (pos >= 21 && pos <= 29) {
            // Top row (left to right) - center of 2x2 side spaces
            const spaceIndex = pos - 21;
            const left = sideSpaceCenter + (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
            return { left: `${left}%`, top: `${cornerCenter}%` };
        } else if (pos === 30) {
            // Go To Jail corner (top-right) - center of 2x2 corner
            return { left: `${100 - cornerCenter}%`, top: `${cornerCenter}%` };
        } else if (pos >= 31 && pos <= 39) {
            // Right column (top to bottom) - center of 2x2 side spaces
            const spaceIndex = pos - 31;
            const top = sideSpaceCenter + (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
            return { left: `${100 - cornerCenter}%`, top: `${top}%` };
        } else {
            // Default fallback
            return { left: '50%', top: '50%' };
        }
    };

    const baseTokenPos = getTokenPosition(position);

    // Handle multiple players on same space
    const getAdjustedPosition = () => {
        if (playersOnSameSpace.length <= 1) {
            return baseTokenPos;
        }

        const tokenIndex = playersOnSameSpace.findIndex(p => p.id === player.id);
        const offsetDistance = 1.5; // Distance between tokens in percentage

        let adjustedLeft = parseFloat(baseTokenPos.left);
        let adjustedTop = parseFloat(baseTokenPos.top);

        if (playersOnSameSpace.length === 2) {
            // Arrange horizontally
            const offset = tokenIndex === 0 ? -offsetDistance : offsetDistance;
            adjustedLeft += offset;
        } else if (playersOnSameSpace.length === 3) {
            // Arrange in triangle
            const offsets = [
                { x: -offsetDistance, y: -offsetDistance },
                { x: offsetDistance, y: -offsetDistance },
                { x: 0, y: offsetDistance }
            ];
            adjustedLeft += offsets[tokenIndex].x;
            adjustedTop += offsets[tokenIndex].y;
        } else if (playersOnSameSpace.length === 4) {
            // Arrange in 2x2 grid
            const offsets = [
                { x: -offsetDistance, y: -offsetDistance },
                { x: offsetDistance, y: -offsetDistance },
                { x: -offsetDistance, y: offsetDistance },
                { x: offsetDistance, y: offsetDistance }
            ];
            adjustedLeft += offsets[tokenIndex].x;
            adjustedTop += offsets[tokenIndex].y;
        }

        return { left: `${adjustedLeft}%`, top: `${adjustedTop}%` };
    };

    const tokenPos = getAdjustedPosition();

    return (
        <div
            className="absolute w-8 h-8 transition-all duration-300 ease-in-out flex items-center justify-center"
            style={{
                left: tokenPos.left,
                top: tokenPos.top,
                transform: `translate(-50%, -50%) rotate(${-boardRotation}deg)`,
                zIndex: 1000 + player.id, // High z-index to ensure visibility above board elements
            }}
        >
            <img
                src={player.avatar}
                alt={`${player.name} token`}
                className="w-full h-full object-contain drop-shadow-lg"
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
            />
        </div>
    );
};

interface PlayerTokensContainerProps {
    players: Player[];
    boardRotation: number;
}

export const PlayerTokensContainer: React.FC<PlayerTokensContainerProps> = ({
    players,
    boardRotation
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
            {players.map((player) => {
                // Find all players on the same space
                const playersOnSameSpace = players.filter(p => p.position === player.position);

                return (
                    <PlayerToken
                        key={player.id}
                        player={player}
                        position={player.position}
                        boardRotation={boardRotation}
                        playersOnSameSpace={playersOnSameSpace}
                    />
                );
            })}
        </div>
    );
};
