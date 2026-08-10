import React from 'react';
import type { ReactNode } from 'react';
import { ResponsiveContainer, type ResponsiveContainerProps } from 'recharts';

interface ChartContainerProps {
  width?: ResponsiveContainerProps['width'];
  height?: ResponsiveContainerProps['height'];
  className?: string;
  children: ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  width = '100%',
  height = 350,
  className = '',
  children,
}) => (
  <div className={`w-full ${className}`}>
    <ResponsiveContainer width={width} height={height}>
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);
