import React from "react";
import CreateMarketButton from "./CreateMarketButton.tsx";
import { useNavigate, Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateMarketClick = () => {
    navigate("/createMarket");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      <Link to="/">
        <h1 className="text-xl font-bold">Betting Platform</h1>
      </Link>

      <div className="ml-auto">
        <CreateMarketButton onClick={handleCreateMarketClick} />
      </div>
    </nav>
  );
};

export default Navbar;
