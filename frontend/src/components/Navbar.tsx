import React from "react";
import CreateMarketButton from "./CreateMarketButton.tsx";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">Betting Platform</h1>
      <div className="ml-auto">
        <CreateMarketButton
          onClick={() => console.log("Navigating to Create Market Page")}
        />
      </div>
    </nav>
  );
};

export default Navbar;
