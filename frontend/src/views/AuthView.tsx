import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, UserPlus, ShieldAlert, Loader2 } from "lucide-react";

interface AuthViewProps {
  mode: "login" | "register";
  onSwitchMode: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, onSwitchMode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate("/");
    } catch (submissionError: unknown) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const INPUT_CLASS =
    "bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-tactical-accent outline-none transition-colors";

  return (
    <div className="min-h-screen bg-tactical-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-tactical-gray p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-16 h-16 bg-tactical-accent/10 rounded-full flex items-center justify-center text-tactical-accent mb-2">
            {mode === "login" ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Mini<span className="text-tactical-accent">-CS</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            {mode === "login"
              ? "Mission Authorization"
              : "New Recruit Enrollment"}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-600/10 border border-red-600/20 text-red-500 p-4 rounded-lg flex items-center gap-3 animate-shake">
            <ShieldAlert size={20} />
            <span className="text-xs font-bold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={INPUT_CLASS}
              placeholder="OPERATOR_NAME"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={INPUT_CLASS}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-tactical-accent hover:bg-tactical-accent/80 disabled:opacity-50 text-black font-black py-4 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(125,1,227,0.1)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : mode === "login" ? (
              "Authenticate"
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <button
            onClick={onSwitchMode}
            className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already registered? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
