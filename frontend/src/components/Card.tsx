import React from "react";
import { Link } from "react-router-dom";
interface CardProps {
  market: {
    id: number;
    description: string;
    deadline: string;
  };
}

const Card: React.FC<CardProps> = ({ market }) => {
  return (
    <div className="block bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg transition duration-200">
      <h2 className="text-lg font-bold text-white">{market.description}</h2>
      <div className="mt-4 text-gray-400 text-sm">
        <p>{market.deadline}</p>
      </div>
      <Link to={`/market`} className="text-blue-500 hover:underline">
        View Details{" "}
      </Link>
      <div className="flex justify-between items-center mt-4"></div>
    </div>
  );
};

export default Card;
