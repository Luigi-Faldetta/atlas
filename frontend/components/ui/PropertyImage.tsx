'use client';

import Image from 'next/image';

interface PropertyImageProps {
  id: string;
  name: string;
  height?: number;
  className?: string;
}

// Mock image URLs for properties
const propertyImages = {
  'prop-001': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-002': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-003': 'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-004': 'https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-005': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
};

// Background colors for placeholder
const bgColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-teal-500',
];

export default function PropertyImage({ id, name, height = 200, className = '' }: PropertyImageProps) {
  // Get image URL or generate a placeholder
  const imageUrl = propertyImages[id];
  
  // Generate a consistent color based on property id
  const colorIndex = id.charCodeAt(id.length - 1) % bgColors.length;
  const bgColor = bgColors[colorIndex];
  
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
  
  // If no image is available, create a placeholder with the first letter
  return (
    <div 
      className={`flex items-center justify-center ${bgColor} text-white ${className}`}
      style={{ height: `${height}px` }}
    >
      <span className="text-5xl font-bold">
        {name.charAt(0)}
      </span>
    </div>
  );
} 