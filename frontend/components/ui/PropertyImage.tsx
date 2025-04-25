'use client';

import React from 'react';

interface PropertyImageProps {
  id: string;
  name: string;
  height?: number;
}

export default function PropertyImage({
  id,
  name,
  height = 100,
}: PropertyImageProps) {
  const getBackgroundColor = () => {
    // Ensure id is a defined string. Use a default value if missing.
    const safeId = id ? String(id) : '1';
    const numId = parseInt(safeId.replace(/[^0-9]/g, '')) || 1;
    const hue = (numId * 137) % 360; // Golden ratio multiplier
    return `hsl(${hue}, 50%, 75%)`;
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        height: height,
        width: height,
        backgroundColor: getBackgroundColor(),
        borderRadius: '0.5rem',
      }}
    >
      <span className="text-white font-bold">{name.charAt(0)}</span>
    </div>
  );
}
