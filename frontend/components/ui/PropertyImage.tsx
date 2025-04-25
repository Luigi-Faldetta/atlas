'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PropertyImageProps {
  id: string;
  name: string;
  className?: string;
  height?: number;
  animateHover?: boolean;
  forceLetterBackground?: boolean;
}

export default function PropertyImage({ 
  id, 
  name, 
  className = '', 
  height = 160,
  animateHover = true,
  forceLetterBackground = false
}: PropertyImageProps) {
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // For our MVP, we'll use a placeholder gradient that's unique to each property
  // In a real application, we would use actual property images
  const getBackgroundColor = () => {
    // Generate a consistent color based on property ID
    const numId = parseInt(id.replace(/[^0-9]/g, '')) || 1;
    const hue = (numId * 137) % 360; // Golden ratio * 360
    
    // Use default saturation/lightness
    const saturation = '70%';
    const lightness = '80%'; 
    
    return `hsl(${hue}, ${saturation}, ${lightness})`;
  };

  // Create a unique pattern based on property ID
  const getPatternIndex = () => {
    const numId = parseInt(id.replace(/[^0-9]/g, '')) || 1;
    return (numId % 5) + 1; // 1-5 pattern variations
  };

  // Render fallback placeholder with property initial
  const renderPlaceholder = () => {
    const initial = name.charAt(0).toUpperCase();
    const bgColor = getBackgroundColor();
    const pattern = getPatternIndex();
    
    return (
      <div 
        className={`relative overflow-hidden group ${className} ${animateHover ? 'cursor-pointer' : ''}`} 
        style={{ 
          height, 
          backgroundColor: bgColor,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pattern overlay */}
        <div 
          className={`absolute inset-0 opacity-20 transition-transform duration-1000 ease-in-out ${isHovered && animateHover ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}`}
          style={{
            backgroundImage: `url(/images/pattern${pattern}.svg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient overlay */}
        <div 
          className={`absolute inset-0 opacity-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ease-in-out ${isHovered && animateHover ? 'opacity-80' : ''}`}
        />
        
        {/* Property initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold text-white text-opacity-80 drop-shadow-lg transition-transform duration-300 ${isHovered && animateHover ? 'scale-110' : 'scale-100'}`}>
            {initial}
          </span>
        </div>
        
        {/* View details text on hover */}
        {animateHover && (
          <div className={`absolute bottom-0 left-0 right-0 p-2 text-white font-medium text-center transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            View Details
          </div>
        )}
      </div>
    );
  };

  // If we have actual images in the future, this would handle them
  if (error || forceLetterBackground) {
    return renderPlaceholder();
  }

  // For MVP, just use the placeholder for all properties
  return renderPlaceholder();
  
  /* Real implementation would be like this in the future:
  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={`/images/properties/${id}.jpg`}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: "cover" }}
        onError={() => setError(true)}
        className={`transition-transform duration-700 ${isHovered && animateHover ? 'scale-110' : 'scale-100'}`}
      />
      
      <div 
        className={`absolute inset-0 opacity-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ease-in-out ${isHovered && animateHover ? 'opacity-80' : ''}`}
      />
      
      {animateHover && (
        <div className={`absolute bottom-0 left-0 right-0 p-2 text-white font-medium text-center transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          View Details
        </div>
      )}
    </div>
  );
  */
}
