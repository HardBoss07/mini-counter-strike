import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }): string =>
  isActive ? "text-tactical-accent" : "hover:text-gray-300";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile } = useUserProfile();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-tactical-dark border-b border-white/10 p-4 flex justify-between items-center text-white">
      <div className="flex gap-6 font-black uppercase tracking-widest text-sm">
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
        <div className="text-xs font-mono text-gray-400">
          {profile ? (
            <>
              ELO:{" "}
              <span className="text-tactical-accent font-bold">
                {profile.elo}
              </span>
              {" | "}
              CR:{" "}
              <span className="text-tactical-accent font-bold">
                {profile.credits}
              </span>
            </>
          ) : (
            "Loading..."
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-red-900/50 hover:bg-red-800 px-3 py-1 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
