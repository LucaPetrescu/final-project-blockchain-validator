import React from "react";
import Navbar from "./Navbar.tsx";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="min-h-screen bg-gray-900 text-white">{children}</main>
    </>
  );
};

export default Layout;
