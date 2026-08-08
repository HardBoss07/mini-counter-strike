import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  /**
   * When true, renders as a fixed top-center overlay (used by LoadoutBuilder).
   * When false, renders as an inline banner (used by BattleView header).
   * Defaults to false.
   */
  fixed?: boolean;
}

/**
 * Error notification atom.
 * Handles both fixed-position overlay and inline banner variants.
 */
const ErrorToast: React.FC<ErrorToastProps> = ({ message, fixed = false }) => {
  if (fixed) {
    return (
      <div className="fixed left-1/2 top-8 z-50 flex -translate-x-1/2 items-center gap-3 rounded bg-red-600 px-6 py-3 text-white shadow-2xl">
        <ShieldAlert size={20} />
        <span className="text-sm font-bold uppercase">{message}</span>
      </div>
    );
  }

  return (
    <div className="bg-red-600 p-2 text-center text-xs font-bold uppercase tracking-wider text-white">
      {message}
    </div>
  );
};

export default ErrorToast;
