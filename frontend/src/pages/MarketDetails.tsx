import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    try {
    } catch (error) {}
  }, []);

  // return()
};

export default MarketDetails;
