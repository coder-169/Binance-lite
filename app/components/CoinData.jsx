import React from "react";

const CoinData = ({ amount, symbol, inOrder }) => {
  return (
    <div className="col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 rounded-2xl shadow-minee w-full p-4 my-4 border-b border-gray-300">
      <div className="flex w-full justify-between items-center">
        <div className="text-left">
          <h3 className="font-bold text-xl ">{symbol}</h3>
          <small>In Orders {inOrder}</small>
        </div>
        <h3 className="text-sm mt-2 font-medium ">{amount}</h3>
      </div>
    </div>
  );
};

export default CoinData;
