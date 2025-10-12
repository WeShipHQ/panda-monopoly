import React from "react";

interface CornerProps {
  boardRotation?: number;
}

export const GoCorner: React.FC<CornerProps> = ({ boardRotation = 0 }) => {
  return (
    <div className="col-start-13 col-end-15 row-start-13 row-end-15 text-center flex items-center justify-center border-t-2 border-l-2 border-black">
      <div 
        className="corner-space h-full flex flex-col justify-center items-center transition-transform duration-500 ease-in-out"
        style={{ transform: `rotate(${-45 - boardRotation}deg)` }}
      >
        <div className="px-1 text-[10px] font-bold">
          COLLECT <br />
          $200 SALARY
          <br /> AS YOU PASS
        </div>
        <div className="icon-large text-[#f50c2b] font-bold text-4xl">GO</div>
        <div className="absolute top-1 left-1 text-xs">→</div>
      </div>
    </div>
  );
};

export const JailCorner: React.FC<CornerProps> = ({ boardRotation = 0 }) => {
  return (
    <div className="col-start-1 col-end-3 row-start-13 row-end-15 text-center flex items-center justify-center border-t-2 border-r-2 border-black">
      <div 
        className="corner-space flex items-center justify-center h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `rotate(${-boardRotation}deg)` }}
      >
        <img
          src="/images/JAIL.png"
          alt="Jail"
          className="w-full h-full object-contain p-1"
        />
      </div>
    </div>
  );
};

export const FreeParkingCorner: React.FC<CornerProps> = ({ boardRotation = 0 }) => {
  return (
    <div className="col-start-1 col-end-3 row-start-1 row-end-3 text-center flex items-center justify-center border-b-2 border-r-2 border-black">
      <div 
        className="corner-space flex flex-col items-center justify-center h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `rotate(${-boardRotation}deg)` }}
      >
        <img
          src="/images/FREEPARKING.png"
          alt="Free Parking"
          className="w-12 h-12 object-contain"
        />
        <div className="text-xs font-bold mt-1">FREE PARKING</div>
      </div>
    </div>
  );
};

export const GoToJailCorner: React.FC<CornerProps> = ({ boardRotation = 0 }) => {
  return (
    <div className="col-start-13 col-end-15 row-start-1 row-end-3 text-center flex items-center justify-center border-b-2 border-l-2 border-black">
      <div 
        className="corner-space flex flex-col items-center justify-center h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `rotate(${-boardRotation}deg)` }}
      >
        <img
          src="/images/GOTOJAIL.png"
          alt="Go To Jail"
          className="w-12 h-12 object-contain"
        />
        <div className="text-xs font-bold mt-1">GO TO JAIL</div>
      </div>
    </div>
  );
};
