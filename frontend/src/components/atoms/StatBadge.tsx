import React from "react";

interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  variant?: "default" | "energy";
}

const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  icon,
  color = "bg-tactical-gray",
  variant = "default",
}) => {
  const valueColor =
    variant === "energy" ? "text-yellow-400" : "text-tactical-accent";
  const backgroundOverride = variant === "energy" ? "bg-yellow-500/10" : color;

  return (
    <div
      className={`flex flex-col items-center justify-center p-1 rounded ${backgroundOverride} border border-white/10 min-w-[50px]`}
    >
      <span className="text-[10px] uppercase text-gray-400 font-bold">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {icon}
        <span className={`text-xs font-mono ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
};

export default StatBadge;
