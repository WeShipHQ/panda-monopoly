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
      <div className="col-start-4 col-end-11 row-start-1 row-end-8 bg-[#fa811d] border-b-2 border-l-2 border-black flex items-center justify-center">
        <div className="corner-space transform rotate-45 flex flex-col items-center justify-center">
          <img
            src="/images/JAIL.png"
            alt="Jail"
            className="w-16 h-16 object-contain"
          />
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
    <div className="col-start-1 row-start-1 row-end-2 bg-[#fafaf8] text-center flex items-center justify-center">
      <div className="corner-space transform rotate-[135deg] flex flex-col items-center justify-center">
        <img
          src="/images/FREEPARKING.png"
          alt="Free Parking"
          className="w-20 h-20 object-contain"
        />
      </div>
    </div>
  );
};

export const GoToJailCorner = () => {
  return (
    <div className="col-start-11 row-start-1 row-end-1 bg-[#fafaf8] text-center flex items-center justify-center">
      <div className="corner-space transform rotate-[225deg] flex flex-col items-center justify-center">
        <img
          src="/images/GOTOJAIL.png"
          alt="Go To Jail"
          className="w-20 h-20 object-contain"
        />
      </div>
    </div>
  );
};
