import React from "react";

const MulticolorSelector = ({
  config,
  text,
  background,
  accent,
  header_text,
  header_background,
  header_accent,
}) => {
  if (config === "advanced") {
    return (
      <div className="h-[3.25rem] border-gray-300 border border-solid mt-2 w-full rounded-2xl flex box-border overflow-hidden">
        <div
          className="flex-1 rounded-l-2xl flex flex-col items-center justify-center"
          style={{ backgroundColor: background }}
        >
          <p 
            className="font-black text-2xl m-0 leading-none"
            style={{ color: text }}
          >
            T
          </p>
          <div 
            className="w-6 h-[4px]"
            style={{ backgroundColor: accent }}
          ></div>
        </div>
        <div
          className="flex-1 rounded-r-2xl flex flex-col items-center justify-center"
          style={{ backgroundColor: header_background }}
        >
          <p 
            className="font-black text-2xl m-0 leading-none"
            style={{ color: header_text }}
          >
            T
          </p>
          <div 
            className="w-6 h-[4px]"
            style={{ backgroundColor: header_accent }}
          ></div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-[3.25rem] border-gray-300 border border-solid mt-2 w-full rounded-2xl flex box-border overflow-hidden">
      <div
        className="flex-1 rounded-l-2xl flex flex-col items-center justify-center"
        style={{ backgroundColor: background }}
      >
        <p 
          className="font-black text-2xl m-0 leading-none"
          style={{ color: text }}
        >
          T
        </p>
        <div 
          className="w-6 h-[4px]"
          style={{ backgroundColor: accent }}
        ></div>
      </div>
      <div
        className="flex-1 rounded-r-2xl flex flex-col items-center justify-center"
        style={{ backgroundColor: accent }}
      ></div>
    </div>
  );
};

export default MulticolorSelector;
