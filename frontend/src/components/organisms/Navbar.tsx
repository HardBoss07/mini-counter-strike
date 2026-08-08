import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }): string =>
  isActive ? 'text-tactical-accent' : 'hover:text-gray-300';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile } = useUserProfile();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between border-b border-white/10 bg-tactical-dark p-4 text-white">
      <div className="flex gap-6 text-sm font-black uppercase tracking-widest">
        <NavLink to="/" end className={NAV_LINK_CLASS}>
          Command
        </NavLink>
        <NavLink to="/loadout" className={NAV_LINK_CLASS}>
          Loadout
        </NavLink>
        <NavLink to="/inventory" className={NAV_LINK_CLASS}>
          Inventory
        </NavLink>
        <NavLink to="/cases" className={NAV_LINK_CLASS}>
          Cases
        </NavLink>
        <NavLink to="/leaderboard" className={NAV_LINK_CLASS}>
          Ranking
        </NavLink>
      </div>

      <div className="flex items-center gap-6">
        <div className="font-mono text-xs text-gray-400">
          {profile ? (
            <>
              ELO: <span className="font-bold text-tactical-accent">{profile.elo}</span>
              {' | '}
              CR: <span className="font-bold text-tactical-accent">{profile.credits}</span>
            </>
          ) : (
            'Loading...'
          )}
        </div>
        <button
          onClick={handleLogout}
          className="rounded bg-red-900/50 px-3 py-1 text-xs transition-colors hover:bg-red-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
