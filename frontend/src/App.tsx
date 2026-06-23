import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Layout from "./Layout";
import AuthView from "./views/AuthView";
import LoadoutBuilderView from "./views/LoadoutBuilderView";
import DashboardView from "./views/DashboardView";
import InventoryView from "./views/InventoryView";
import CasesView from "./views/CasesView";
import LeaderboardView from "./views/LeaderboardView";
import MatchmakingView from "./views/MatchmakingView";
import BattleView from "./views/BattleView";
import { AuthProvider } from "./contexts/AuthContext";

const AuthWrapper: React.FC<{ mode: "login" | "register" }> = ({ mode }) => {
  const navigate = useNavigate();
  return (
    <AuthView
      mode={mode}
      onSwitchMode={() => navigate(mode === "login" ? "/register" : "/login")}
    />
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthWrapper mode="login" />} />
      <Route path="/register" element={<AuthWrapper mode="register" />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardView />} />
        <Route path="loadout" element={<LoadoutBuilderView />} />
        <Route path="inventory" element={<InventoryView />} />
        <Route path="cases" element={<CasesView />} />
        <Route path="leaderboard" element={<LeaderboardView />} />
      </Route>

      <Route path="/matchmaking" element={<MatchmakingView />} />
      <Route path="/battle/:matchId" element={<BattleView />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
