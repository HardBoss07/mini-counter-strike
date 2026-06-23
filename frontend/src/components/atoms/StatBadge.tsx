import React from "react";

interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  icon,
  color = "bg-tactical-gray",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-1 rounded ${color} border border-white/10 min-w-[50px]`}
    >
      <span className="text-[10px] uppercase text-gray-400 font-bold">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs font-mono text-tactical-accent">{value}</span>
      </div>
    </div>
  );
};

export default StatBadge;
