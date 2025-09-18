"use client";

import { useState } from "react";
import MonopolyBoard from "@/components/monopoly-board";
import { RightPanel } from "@/components/right-panel";
import { LeftSidebar } from "@/components/left-sidebar";
import { useGameManager } from "@/hooks";

export default function Home() {
  const [boardRotation, setBoardRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'players' | 'settings'>('players');

  // Move game state management to parent component
  const gameManager = useGameManager();

  const rotateBoardClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const rotateBoardCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        <LeftSidebar gameManager={gameManager} />
        <MonopolyBoard
          boardRotation={boardRotation}
          onRotateClockwise={rotateBoardClockwise}
          onRotateCounterClockwise={rotateBoardCounterClockwise}
          gameManager={gameManager}
        />
        <RightPanel
          boardRotation={boardRotation}
          onRotateClockwise={rotateBoardClockwise}
          onRotateCounterClockwise={rotateBoardCounterClockwise}
          gameManager={gameManager}
        />
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden flex flex-col h-screen w-screen overflow-hidden">
        {/* Board Section - Takes most of screen */}
        <div className="flex-1 relative overflow-hidden">
          <MonopolyBoard
            boardRotation={boardRotation}
            onRotateClockwise={rotateBoardClockwise}
            onRotateCounterClockwise={rotateBoardCounterClockwise}
            gameManager={gameManager}
          />
        </div>

        {/* Bottom Panel - Taller on tablets, shorter on mobile */}
        <div className="h-1/3 md:h-2/5 max-h-80 md:max-h-96 min-h-60 flex flex-col bg-gray-900">
          {/* Tab Navigation - Hidden on small mobile, visible on tablet */}
          <div className="hidden sm:flex border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('players')}
              className={`flex-1 py-4 px-4 min-h-[48px] font-semibold transition-colors ${
                activeTab === 'players'
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Players
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-4 min-h-[48px] font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Share Game
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {/* Mobile Referral Section - Always visible on small screens */}
            <div className="sm:hidden p-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">Share Game:</div>
                  <input
                    type="text"
                    value="https://pandamonopoly.io/room/mzuv3"
                    readOnly
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 font-mono truncate"
                  />
                </div>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText("https://pandamonopoly.io/room/mzuv3");
                    } catch (err) {
                      console.error('Failed to copy: ', err);
                    }
                  }}
                  className="flex-shrink-0 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium min-h-[32px]"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="h-full overflow-hidden">
              {/* Players Tab - Always visible on mobile, switchable on tablet+ */}
              <div className={`h-full ${activeTab === 'players' ? 'block' : 'hidden sm:block'}`}>
                <div className="h-full p-2 sm:p-4 overflow-y-auto">
                  <RightPanel
                    boardRotation={boardRotation}
                    onRotateClockwise={rotateBoardClockwise}
                    onRotateCounterClockwise={rotateBoardCounterClockwise}
                    gameManager={gameManager}
                  />
                </div>
              </div>

              {/* Share Game Tab - Only visible on tablet+ when active */}
              <div className={`h-full hidden sm:block ${activeTab === 'settings' ? '' : 'sm:hidden'}`}>
                <div className="p-4 overflow-y-auto h-full">
                  <LeftSidebar gameManager={gameManager} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
