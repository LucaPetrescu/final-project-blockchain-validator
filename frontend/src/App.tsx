import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MarketDetails from "./pages/MarketDetails.tsx";
import CreateMarket from "./pages/CreateMarket.tsx";

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />}></Route>
              <Route path="/createMarket" element={<CreateMarket />}></Route>
              <Route path="/market" element={<MarketDetails />}></Route>
            </Routes>
          </Layout>
        </Router>
      </div>
    </div>
  );
};

export default App;
