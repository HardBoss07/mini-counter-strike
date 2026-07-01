import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** When true, renders full-viewport centered layout. Defaults to false (inline). */
  fullScreen?: boolean;
  /** Message shown below the spinner. */
  label?: string;
  /** Tailwind size integer passed to Loader2. Defaults to 48. */
  size?: number;
}

/**
 * Reusable loading spinner atom.
 * Use fullScreen for page-level loading states and the default for inline use.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  label,
  size = 48,
}) => {
  const spinner = (
    <>
      <Loader2 size={size} className="animate-spin text-tactical-accent" />
      {label && (
        <span className="font-bold uppercase tracking-widest text-sm text-tactical-accent">
          {label}
        </span>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-tactical-dark">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
