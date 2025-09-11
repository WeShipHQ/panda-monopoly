import React from "react";

export const GoCorner = () => {
  return (
    <div className="col-start-11 row-start-11 row-end-12 bg-[#fafaf8] text-center relative">
      <div className="corner-space transform rotate-[315deg]">
        <div className="px-4 text-xs">Collect $200.00 salary as you pass</div>
        <div className="icon-large text-[#f50c2b] font-bold">go</div>
      </div>
      <div className="icon-medium text-[#f50c2b] absolute bottom-0 left-1">
        <i className="fa fa-long-arrow-left"></i>
      </div>
    </div>
  );
};

export const JailCorner = () => {
  return (
    <div className="col-start-1 row-start-11 row-end-12 bg-[#fafaf8] grid grid-cols-10 grid-rows-10 justify-center items-center">
      <div className="col-start-4 col-end-11 row-start-1 row-end-8 bg-[#fa811d] border-b-2 border-l-2 border-black">
        <div className="corner-space transform rotate-45">
          <div className="text-sm">In</div>
          <div className="relative flex justify-around items-center w-[60%] h-[60%] bg-[#fafaf8] border-2 border-black">
            <div className="h-full w-[2px] bg-black"></div>
            <div className="h-full w-[2px] bg-black"></div>
            <div className="h-full w-[2px] bg-black"></div>
            <i className="fa fa-frown-o icon-medium absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></i>
          </div>
          <div className="text-sm">Jail</div>
        </div>
      </div>
      <div className="col-start-3 row-start-4 transform rotate-90 text-xs">
        Just
      </div>
      <div className="col-start-6 row-start-8 text-xs">Visiting</div>
    </div>
  );
};

export const FreeParkingCorner = () => {
  return (
    <div className="col-start-1 row-start-1 row-end-2 bg-[#fafaf8] text-center">
      <div className="corner-space transform rotate-[135deg]">
        <div className="text-base">Free</div>
        <div className="icon-large text-[#f50c2b] py-1">
          <i className="fa fa-car"></i>
        </div>
        <div className="text-base">Parking</div>
      </div>
    </div>
  );
};

export const GoToJailCorner = () => {
  return (
    <div className="col-start-11 row-start-1 row-end-1 bg-[#fafaf8] text-center">
      <div className="corner-space transform rotate-[225deg]">
        <div className="text-base">Go To</div>
        <div className="icon-large text-[#640303] py-1">
          <i className="fa fa-gavel"></i>
        </div>
        <div className="text-base">Jail</div>
      </div>
    </div>
  );
};
