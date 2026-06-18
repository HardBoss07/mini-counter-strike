import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthView from './views/AuthView';
import LoadoutBuilderView from './views/LoadoutBuilderView';
import { LogOut, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return (
      <AuthView 
        mode={authMode} 
        onSwitchMode={() => setAuthMode(prev => prev === 'login' ? 'register' : 'login')} 
      />
    );
  }

  return (
    <div className="relative">
      <nav className="fixed top-8 right-8 z-50 flex items-center gap-4 bg-tactical-gray/80 backdrop-blur-md p-2 pl-6 rounded-full border border-white/5 shadow-2xl">
        <div className="flex items-center gap-2">
          <User size={16} className="text-tactical-accent" />
          <span className="text-xs font-black uppercase tracking-widest text-white">
            {user?.username || 'OPERATOR'}
          </span>
        </div>
        <button 
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-lg"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </nav>
      <LoadoutBuilderView />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
