import React from "react";
import { ShieldAlert } from "lucide-react";

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
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-3 z-50">
        <ShieldAlert size={20} />
        <span className="font-bold text-sm uppercase">{message}</span>
      </div>
    );
  }

  return (
    <div className="bg-red-600 text-white text-center font-bold uppercase tracking-wider p-2 text-xs">
      {message}
    </div>
  );
};

export default ErrorToast;
