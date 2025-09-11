"use client";

import React from "react";

export interface Player {
    id: number;
    name: string;
    color: string;
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
    // Position token based on board position (40 spaces)
    const getTokenPosition = (pos: number) => {
        // Precise positioning based on actual board measurements
        // Looking at the image, the board has:
        // - Corner spaces: approximately 14.3% each
        // - Regular spaces: approximately 14.3% width each
        // - Board starts at ~7.15% from edges

        if (pos === 0) {
            // GO corner (bottom-right) - center of the corner space
            return { left: '92.85%', top: '92.85%' };
        } else if (pos === 1) {
            // Baltic Ave - first space from GO
            return { left: '78.55%', top: '92.85%' };
        } else if (pos === 2) {
            // Oriental Ave
            return { left: '64.25%', top: '92.85%' };
        } else if (pos === 3) {
            // Chance
            return { left: '49.95%', top: '92.85%' };
        } else if (pos === 4) {
            // Vermont Ave
            return { left: '35.65%', top: '92.85%' };
        } else if (pos === 5) {
            // Connecticut Ave
            return { left: '21.35%', top: '92.85%' };
        } else if (pos === 6) {
            // JAIL corner (bottom-left)
            return { left: '7.15%', top: '92.85%' };
        } else if (pos === 7) {
            // States Ave (left column)
            return { left: '7.15%', top: '78.55%' };
        } else if (pos === 8) {
            // Virginia Ave
            return { left: '7.15%', top: '64.25%' };
        } else if (pos === 9) {
            // Community Chest
            return { left: '7.15%', top: '49.95%' };
        } else if (pos === 10) {
            // Tennessee Ave
            return { left: '7.15%', top: '35.65%' };
        } else if (pos === 11) {
            // New York Ave
            return { left: '7.15%', top: '21.35%' };
        } else if (pos === 12) {
            // Free Parking corner (top-left)
            return { left: '7.15%', top: '7.15%' };
        } else if (pos === 13) {
            // Kentucky Ave (top row)
            return { left: '21.35%', top: '7.15%' };
        } else if (pos === 14) {
            // Indiana Ave
            return { left: '35.65%', top: '7.15%' };
        } else if (pos === 15) {
            // Chance
            return { left: '49.95%', top: '7.15%' };
        } else if (pos === 16) {
            // Atlantic Ave
            return { left: '64.25%', top: '7.15%' };
        } else if (pos === 17) {
            // Marvin Gardens
            return { left: '78.55%', top: '7.15%' };
        } else if (pos === 18) {
            // Go To Jail corner (top-right)
            return { left: '92.85%', top: '7.15%' };
        } else if (pos === 19) {
            // Pacific Ave (right column)
            return { left: '92.85%', top: '21.35%' };
        } else if (pos === 20) {
            // N. Carolina Ave
            return { left: '92.85%', top: '35.65%' };
        } else if (pos === 21) {
            // Community Chest
            return { left: '92.85%', top: '49.95%' };
        } else if (pos === 22) {
            // Park Place
            return { left: '92.85%', top: '64.25%' };
        } else if (pos === 23) {
            // Boardwalk
            return { left: '92.85%', top: '78.55%' };
        } else {
            // Default fallback for any remaining positions
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
            className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center text-white text-xs font-bold"
            style={{
                backgroundColor: player.color,
                left: tokenPos.left,
                top: tokenPos.top,
                transform: `translate(-50%, -50%) rotate(${-boardRotation}deg)`,
                zIndex: 1000 + player.id, // High z-index to ensure visibility above board elements
            }}
        >
            {player.id}
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
