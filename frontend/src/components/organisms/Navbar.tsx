import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-tactical-dark border-b border-white/10 p-4 flex justify-between items-center text-white">
      <div className="flex gap-6 font-black uppercase tracking-widest text-sm">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-tactical-accent' : 'hover:text-gray-300'}>Command</NavLink>
        <NavLink to="/loadout" className={({ isActive }) => isActive ? 'text-tactical-accent' : 'hover:text-gray-300'}>Loadout</NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'text-tactical-accent' : 'hover:text-gray-300'}>Inventory</NavLink>
        <NavLink to="/cases" className={({ isActive }) => isActive ? 'text-tactical-accent' : 'hover:text-gray-300'}>Cases</NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'text-tactical-accent' : 'hover:text-gray-300'}>Ranking</NavLink>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-xs font-mono text-gray-400">ELO: 1000 | CR: 100</div>
        <button onClick={handleLogout} className="text-xs bg-red-900/50 hover:bg-red-800 px-3 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
