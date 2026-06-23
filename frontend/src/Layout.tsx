import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/organisms/Navbar";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-tactical-dark text-white">
      <Navbar />
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
