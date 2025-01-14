import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { getBetsByMarket } from "../utils/utils.ts";
interface Bet {
  bettor: string;
  amount: string;
  outcome: string;
}

interface Market {
  description: string;
  resolutionTimestamp: string;
  marketID: number;
  bets: Bet[];
}

const MarketDetails: React.FC = () => {
  const location = useLocation();
  const [market, setMarket] = useState<Market | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const marketId = queryParams.get("marketId");
  const name = queryParams.get("name");
  const resolutionTimestamp = queryParams.get("resolutionTimestamp");

  console.log(resolutionTimestamp);

  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        // const response: AxiosResponse = await axios.get(getBetsByMarket, {
        //   params: { marketId: marketId },
        // });

        const marketData: Market = {
          description: name || "Unknown Market",
          resolutionTimestamp: resolutionTimestamp || "Unknown Timestamp",
          marketID: parseInt(marketId || "0"),
          bets: [],
        };

        setMarket(marketData);
      } catch (error) {
        console.error("Error fetching market:", error);
      }
    };
    fetchMarketDetails();
  }, [marketId, name, resolutionTimestamp]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {market ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{market.description}</h1>
          <p>Resolution Timestamp: {market.resolutionTimestamp}</p>
          <h2 className="text-lg font-semibold mt-4">Bets:</h2>
          <ul>
            {market.bets.map((bet, index) => (
              <li key={index} className="mt-2">
                Bettor: {bet.bettor}, Amount: {bet.amount}, Outcome:{" "}
                {bet.outcome}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Market details not found.</p>
      )}
    </div>
  );
};

export default MarketDetails;
