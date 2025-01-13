import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { getBetsByMarket } from "../utils/utils.ts";
interface Bet {
  bettor: string;
  amount: string;
  outcome: string;
}

interface Market {
  description: string;
  resolutionTimestamp: number;
  marketID: number;
  bets: Bet[];
}

const MarketDetails: React.FC = () => {
  const [market, setMarket] = useState<Market | null>(null);
  const marketId = 1;
  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        const response: AxiosResponse = await axios.get(getBetsByMarket, {
          params: { marketId: marketId },
        });
      } catch (error) {
        console.error("Error fetching market:", error);
      }
    };
    fetchMarketDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {market ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{market.description}</h1>
          {/* Display other market details */}
        </>
      ) : (
        <p>Loading market details...</p>
      )}
    </div>
  );
};

export default MarketDetails;
