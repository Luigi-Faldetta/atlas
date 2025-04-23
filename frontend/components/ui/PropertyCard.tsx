'use client';

import React from 'react';
import { Property } from '@/data/mock/properties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

// Helper to get score badge color
const getScoreColor = (score: number): string => {
  if (score >= 9.0) return 'bg-green-500';
  if (score >= 8.0) return 'bg-blue-500';
  if (score >= 7.0) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Helper to get tag styles (simple version for now)
const getTagStyle = (tag: string): string => {
  if (tag.toLowerCase().includes('high yield')) return 'bg-yellow-100 text-yellow-800';
  if (tag.toLowerCase().includes('stable growth')) return 'bg-blue-100 text-blue-800';
  if (tag.toLowerCase().includes('eco friendly')) return 'bg-green-100 text-green-800';
  if (tag.toLowerCase().includes('prime location')) return 'bg-purple-100 text-purple-800';
  if (tag.startsWith('+')) return 'bg-gray-200 text-gray-700';
  return 'bg-gray-100 text-gray-800';
};

// Helper to get background pattern/color (simple example)
const getBackgroundStyle = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colors = [
    'bg-green-100', 'bg-blue-100', 'bg-purple-100', 
    'bg-yellow-100', 'bg-pink-100', 'bg-indigo-100'
  ];
  const patterns = [
    'bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.05)_0%,_rgba(255,255,255,0)_60%)]', // Subtle dot
    'bg-[linear-gradient(45deg,_rgba(0,0,0,0.03)_25%,_transparent_25%,_transparent_75%,_rgba(0,0,0,0.03)_75%,_rgba(0,0,0,0.03))],linear-gradient(-45deg,_rgba(0,0,0,0.03)_25%,_transparent_25%,_transparent_75%,_rgba(0,0,0,0.03)_75%,_rgba(0,0,0,0.03))]',
    'bg-[repeating-linear-gradient(45deg,_rgba(0,0,0,0.02),_rgba(0,0,0,0.02)_10px,_transparent_10px,_transparent_20px)]',
  ];

  const color = colors[Math.abs(hash) % colors.length];
  const pattern = patterns[Math.abs(hash >> 8) % patterns.length]; // Use different part of hash for pattern
  return `${color} ${pattern} bg-[length:40px_40px]`;
};

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col" 
      onClick={onClick}
    >
      {/* Image/Letter Area */}
      <div className={`relative h-40 ${getBackgroundStyle(property.id)} flex items-center justify-center`}>
        <span className="text-6xl font-bold text-white opacity-80">
          {property.name.charAt(0).toUpperCase()}
        </span>
        {/* Star Icon */}
        <div className="absolute top-2 left-2 bg-white/70 dark:bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        {/* Score Badge */}
        <Badge 
          className={`absolute top-2 right-2 ${getScoreColor(property.aiScore)} text-white text-sm font-semibold px-2.5 py-1`}
        >
          {property.aiScore.toFixed(1)}
        </Badge>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {property.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className={`text-xs px-2 py-0.5 ${getTagStyle(tag)}`}>
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title & Location */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-0.5">{property.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">{property.location}</p>

        {/* Price & Metrics */}
        <div className="mb-3">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formatPrice(property.price)}</p>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Yield: <span className="font-medium text-green-600 dark:text-green-400">{property.yield.toFixed(1)}%</span></span>
            <span>Appreciation: <span className="font-medium text-blue-600 dark:text-blue-400">{property.appreciation.toFixed(1)}%</span></span>
          </div>
        </div>

        {/* Button - Pushes to bottom */}
        <div className="mt-auto">
          <Button variant="primary" className="w-full">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
} 