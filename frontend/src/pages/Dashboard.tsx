import { useEffect, useState } from "react";
import React from "react";
import Card from "../components/Card.tsx";
import { markets } from "../utils/mockdata.ts";
import axios, { AxiosResponse } from "axios";
import { getMarkets } from "../utils/utils.ts";
import { Link, useLocation } from "react-router-dom";

interface Market {
  marketId: string;
  description: string;
  deadline: string;
}

const Dashboard: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response: AxiosResponse = await axios.get(getMarkets);
        setMarkets(response.data);
      } catch (error) {}
    };
    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Markets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market, index) => (
            <Card
              market={{
                id: market.marketId,
                description: market.description,
                deadline: market.deadline,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
