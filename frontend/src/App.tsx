import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.tsx";
import Dashboard from "./pages/Dashboard.tsx";

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />}></Route>
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;
