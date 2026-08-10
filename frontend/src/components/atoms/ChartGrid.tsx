import React from 'react';
import { CartesianGrid } from 'recharts';

export const ChartGrid: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => (
  <CartesianGrid strokeDasharray="3 3" opacity={opacity} />
);
