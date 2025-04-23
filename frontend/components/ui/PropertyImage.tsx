'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils'; // Assuming you have this utility

// Mock image URLs for properties
const propertyImages = {
  'prop-001':
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-002':
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-003':
    'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-004':
    'https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'prop-005':
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  // Add keys for prop-006 to prop-010 if you want images for them
  'prop-006':
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Example image
  'prop-007':
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Example image
  'prop-008':
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Example image
  'prop-009':
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Example image
  'prop-010':
    'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Example image
};

// Define and EXPORT a type for the keys of propertyImages
export type PropertyImageKey = keyof typeof propertyImages;

interface PropertyImageProps {
  id: PropertyImageKey; // Use the specific key type here
  name: string;
  height?: number;
  className?: string;
  forceLetterBackground?: boolean;
}

// Helper function to generate a color based on a string (simple hash)
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const color = `hsl(${hash % 360}, 70%, 80%)`; // Use HSL for softer colors
  return color;
};

const PropertyImage: React.FC<PropertyImageProps> = ({
  id,
  name,
  height = 64, // Default height
  className,
  forceLetterBackground = false, // Default to false
}) => {
  // Now TypeScript knows 'id' is a valid key for propertyImages
  const imageUrl = !forceLetterBackground ? propertyImages[id] : undefined;

  if (imageUrl) {
    return (
      <div
        className={cn('relative overflow-hidden rounded-md', className)}
        style={{ height: `${height}px`, width: `${height}px` }} // Maintain aspect ratio
      >
        <Image
          src={imageUrl}
          alt={name}
          fill // Use fill to cover the container
          style={{ objectFit: 'cover' }} // Ensure image covers the area
          sizes={`${height}px`} // Provide sizes hint for optimization
        />
      </div>
    );
  } else {
    // Fallback to letter background
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    const bgColor = stringToColor(id); // Generate color based on ID

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md font-semibold text-slate-700',
          className
        )}
        style={{
          height: `${height}px`,
          width: `${height}px`,
          backgroundColor: bgColor,
          fontSize: `${height * 0.5}px`, // Adjust font size relative to height
        }}
        title={name} // Show full name on hover
      >
        {firstLetter}
      </div>
    );
  }
};

export default PropertyImage;
