import React from "react";
import {
  PropertySpace,
  ChanceSpace,
  CommunityChestSpace,
} from "@/components/board-spaces";
import { monopolyData, PropertyData } from "@/data/monopoly-data";

const renderSpace = (space: PropertyData, index: number) => {
  const key = `${space.name}-${index}`;

  if (space.type === "property") {
    return (
      <PropertySpace
        key={key}
        name={space.name}
        price={space.price}
        colorClass={space.colorClass}
        rotate={space.rotate}
        longName={space.longName}
        threeLines={space.threeLines}
      />
    );
  } else if (space.type === "chance") {
    return (
      <ChanceSpace key={key} rotate={space.rotate} blueIcon={space.blueIcon} />
    );
  } else if (space.type === "community-chest") {
    return <CommunityChestSpace key={key} rotate={space.rotate} />;
  }

  return null;
};

const MonopolyBoard = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen monopoly-board overflow-hidden">
      <div className="relative aspect-square h-full max-h-screen w-auto bg-black border-2 border-black">
        <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 gap-[0.2%] p-[0.2%]">
          {/* Center */}
          <div className="col-start-2 col-end-7 row-start-2 row-end-7 bg-[#fafaf8] grid grid-cols-3 grid-rows-3 justify-items-center items-center">
            <h1 className="col-start-1 col-end-4 row-start-2 center-title">
              MONOPOLY
            </h1>
          </div>

          {/* Corner Spaces */}
          <div className="col-start-7 row-start-7 bg-[#fafaf8] text-center">
            <div className="corner-space transform">
              <div className="px-2 text-sx">
                Collect $200.00 salary as you pass
              </div>
              <div className="icon-large text-[#f50c2b] font-bold">GO</div>
            </div>
          </div>

          <div className="col-start-1 row-start-7 bg-[#fafaf8] text-center">
            <div className="corner-space">
              <div className="text-lg font-bold">JAIL</div>
            </div>
          </div>

          <div className="col-start-1 row-start-1 bg-[#fafaf8] text-center">
            <div className="corner-space">
              <div className="text-base font-semibold">Free Parking</div>
            </div>
          </div>

          <div className="col-start-7 row-start-1 bg-[#fafaf8] text-center">
            <div className="corner-space">
              <div className="text-base font-semibold">Go To Jail</div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="col-start-2 col-end-7 row-start-7 grid grid-cols-5 grid-rows-1 gap-[0.2%]">
            {monopolyData.bottomRow.map((space, index) =>
              renderSpace(space, index)
            )}
          </div>

          {/* Left Row */}
          <div className="col-start-1 row-start-2 row-end-7 grid grid-cols-1 grid-rows-5 gap-[0.2%]">
            {monopolyData.leftRow.map((space, index) =>
              renderSpace(space, index)
            )}
          </div>

          {/* Top Row */}
          <div className="col-start-2 col-end-7 row-start-1 grid grid-cols-5 grid-rows-1 gap-[0.2%]">
            {monopolyData.topRow.map((space, index) =>
              renderSpace(space, index)
            )}
          </div>

          {/* Right Row */}
          <div className="col-start-7 row-start-2 row-end-7 grid grid-cols-1 grid-rows-5 gap-[0.2%]">
            {monopolyData.rightRow.map((space, index) =>
              renderSpace(space, index)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonopolyBoard;
