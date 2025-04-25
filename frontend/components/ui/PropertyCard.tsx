// filepath: /home/luigif/Documents/Atlas/atlas/frontend/components/ui/PropertyCard.tsx
import React from 'react';
import Image from 'next/image'; // Import Next.js Image component
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

// Define the shape of the property data expected by the card
interface PropertyCardData {
  id: string;
  name: string;
  location: string;
  price: number;
  score: number;
  yield: number;
  appreciation: number;
  imagePath?: string; // Use the updated field name
  sqMeters?: number;
  yearBuilt?: number;
  Bedrooms?: number;
  // Add any other fields you need from the main Property type
  URL: string;
  Address: string;
  Price: string;
  LivingArea: string;
}

interface PropertyCardProps {
  property: PropertyCardData;
  onClick: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'bg-green-500 hover:bg-green-600';
  if (score >= 6) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-500 hover:bg-red-600';
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
      onClick={onClick}
    >
      <CardHeader className="p-0 relative">
        {/* Use Next.js Image component */}
        <div className="aspect-video relative w-full">
          <Image
            src={property?.imagePath || 'undefined'} // Use property image or fallback
            alt={`Image of ${property.name}`}
            layout="fill" // Fill the container
            objectFit="cover" // Cover the area, cropping if needed
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
            // Add error handling if needed
          />
        </div>
        <Badge
          className={`absolute top-2 right-2 text-white ${getScoreColor(
            property.score
          )}`}
        >
          Score: {property.score.toFixed(1)}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle
          className="text-lg font-semibold mb-1 truncate"
          title={property.name}
        >
          {property.name}
        </CardTitle>
        <p
          className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate"
          title={property.location}
        >
          {property.location}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {formatPrice(property.price)}
        </p>
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
          <span>Yield: {property.yield.toFixed(1)}%</span>
          <span>Appreciation: {property.appreciation.toFixed(1)}%</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>{property.sqMeters ? `${property.sqMeters} m²` : ''}</span>
        <span>{property.Bedrooms ? `${property.Bedrooms} Bed(s)` : ''}</span>
        <span>{property.yearBuilt ? `Built: ${property.yearBuilt}` : ''}</span>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
