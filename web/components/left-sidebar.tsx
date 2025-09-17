"use client";

import React, { useState } from "react";

interface LeftSidebarProps {
  gameManager: ReturnType<typeof import("@/hooks").useGameManager>;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ gameManager }) => {
  const [referralLink] = useState("https://pandamonopoly.io/room/mzuv3");
  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div
      className="w-[34rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
      style={{ height: "100vh" }}
    >
      {/* Game Logo */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PANDA</h1>
        <h2 className="text-2xl font-bold text-green-600 mb-4">MONOPOLY</h2>
        <div className="text-4xl mb-2">🐼</div>
        <p className="text-sm text-gray-700 font-semibold">
          Play Monopoly with your friends online!
        </p>
      </div>

      {/* Referral Link Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-center">Share this game</h3>
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-medium"
            />
            <button
              onClick={copyReferralLink}
              className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-700 text-center font-medium">
          Send this link to your friends to invite them to play
        </p>
      </div>

      {/* Game Instructions */}
      <div className="p-4 bg-white rounded-lg shadow flex-1">
        <h3 className="text-lg font-bold mb-4">How to Play</h3>
        <div className="space-y-2 text-sm text-gray-800 font-medium">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Roll dice to move around the board</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Buy properties when you land on them</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Right-click properties to see details</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Collect $200 when you pass GO</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Build houses and hotels to earn more rent</span>
          </div>
        </div>
      </div>
    </div>
  );
};
