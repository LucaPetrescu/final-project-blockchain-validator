import React from "react";
import { Link } from "react-router-dom";
interface CardProps {
  market: {
    marketId: number;
    name: string;
    resolutionTimestamp: string;
  };
}

const Card: React.FC<CardProps> = ({ market }) => {
  const convertedResolutionTimestamp = new Date(
    Number(market.resolutionTimestamp) * 1000
  );

  return (
    <div className="block bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg transition duration-200">
      <h2 className="text-lg font-bold text-white">{market.name}</h2>
      <div className="mt-4 text-gray-400 text-sm">
        <p>{convertedResolutionTimestamp.toString()}</p>
      </div>
      <Link
        to={`/market?marketId=${market.marketId}&name=${
          market.name
        }&=resolutionTimestamp=${convertedResolutionTimestamp.toString()}`}
        className="text-blue-500 hover:underline"
      >
        View Details{" "}
      </Link>
      <div className="flex justify-between items-center mt-4"></div>
    </div>
  );
};

export default Card;
