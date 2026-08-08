import React from 'react';
import { LogIn, UserPlus, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuthForm } from '../hooks/useAuthForm';

interface AuthViewProps {
  mode: 'login' | 'register';
  onSwitchMode: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, onSwitchMode }) => {
  const { username, setUsername, password, setPassword, loading, error, handleSubmit } =
    useAuthForm(mode);

  const INPUT_CLASS =
    'bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-tactical-accent outline-none transition-colors';

  return (
    <div className="flex min-h-screen items-center justify-center bg-tactical-dark p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-tactical-gray p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-tactical-accent/10 text-tactical-accent">
            {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Mini<span className="text-tactical-accent">-CS</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {mode === 'login' ? 'Mission Authorization' : 'New Recruit Enrollment'}
          </p>
        </div>

        {error && (
          <div className="animate-shake mb-6 flex items-center gap-3 rounded-lg border border-red-600/20 bg-red-600/10 p-4 text-red-500">
            <ShieldAlert size={20} />
            <span className="text-xs font-bold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="ml-1 text-[10px] font-black uppercase text-gray-500">Username</label>
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
            <label className="ml-1 text-[10px] font-black uppercase text-gray-500">Password</label>
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
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-tactical-accent py-4 font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(125,1,227,0.1)] transition-all hover:bg-tactical-accent/80 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : mode === 'login' ? (
              'Authenticate'
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
          <button
            onClick={onSwitchMode}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-white"
          >
            {mode === 'login' ? "Don't have an account? Register" : 'Already registered? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
