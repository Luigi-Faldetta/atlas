'use client';

import Image from 'next/image';

interface PropertyImageProps {
  id: string;
  name: string;
  height?: number;
  className?: string;
  forceLetterBackground?: boolean;
}

// Mock image URLs for properties
const propertyImages = {
  'prop-001': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-002': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-003': 'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-004': 'https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-005': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
};

// Helper to get background pattern/color based on prototype style
const getBackgroundStyle = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colors = [
    'bg-green-200', 'bg-blue-200', 'bg-purple-200', 
    'bg-yellow-200', 'bg-pink-200', 'bg-indigo-200', 'bg-teal-200', 'bg-orange-200'
  ];
   // Example patterns - more could be added
  const patterns = [
    // Dots
    'bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.08)_1px,_transparent_1px)] bg-[size:20px_20px]',
    // Crosses
    'bg-[linear-gradient(45deg,_rgba(0,0,0,0.06)_25%,_transparent_25%),_linear-gradient(-45deg,_rgba(0,0,0,0.06)_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_rgba(0,0,0,0.06)_75%),_linear-gradient(-45deg,_transparent_75%,_rgba(0,0,0,0.06)_75%)] bg-[size:30px_30px]',
    // Lines
    'bg-[repeating-linear-gradient(45deg,_transparent,_transparent_8px,_rgba(0,0,0,0.04)_8px,_rgba(0,0,0,0.04)_16px)]',
    // Grid
    'bg-[linear-gradient(to_right,_rgba(0,0,0,0.03)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(0,0,0,0.03)_1px,_transparent_1px)] bg-[size:15px_15px]'
  ];

  const color = colors[Math.abs(hash) % colors.length];
  // Use different parts of hash for pattern to increase variation
  const patternIndex = Math.abs(hash >> 4) % patterns.length;
  const pattern = patterns[patternIndex];
  
  return `${color} ${pattern}`;
};

export default function PropertyImage({ 
  id, 
  name, 
  height = 200, 
  className = '', 
  forceLetterBackground = false // Default to false
}: PropertyImageProps) {
  const imageUrl = !forceLetterBackground ? propertyImages[id] : undefined;

  if (imageUrl) {
    return (
      <div 
        className={`relative overflow-hidden ${className}`} 
        style={{ height: `${height}px` }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
    );
  }

  // Fallback to letter background
  const letter = name.charAt(0).toUpperCase();
  const backgroundStyle = getBackgroundStyle(id);

  return (
    <div 
      className={`flex items-center justify-center ${backgroundStyle} ${className}`}
      style={{ height: `${height}px` }}
    >
      <span className="text-6xl md:text-7xl font-bold text-white text-opacity-60 dark:text-opacity-70 select-none">
        {letter}
      </span>
    </div>
  );
} 