'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyRecommendation } from '@/data/mock/ai-features';
import { Property, properties } from '@/data/mock/properties';

// Category color mapping
const getCategoryColor = (category: PropertyRecommendation['category']) => {
  const colors = {
    'high-yield': 'bg-green-500',
    'stable-growth': 'bg-blue-500',
    'undervalued': 'bg-purple-500',
    'custom': 'bg-indigo-500',
  };
  
  return colors[category];
};

// Category background color mapping for cards
const getCategoryBgColor = (category: PropertyRecommendation['category']) => {
  const colors = {
    'high-yield': 'bg-yellow-300 bg-opacity-40',
    'stable-growth': 'bg-blue-300 bg-opacity-40',
    'undervalued': 'bg-purple-300 bg-opacity-40',
    'custom': 'bg-indigo-300 bg-opacity-40',
  };
  
  return colors[category];
};

// Category label mapping
const getCategoryLabel = (category: PropertyRecommendation['category']) => {
  const labels = {
    'high-yield': 'High Yield',
    'stable-growth': 'Stable Growth',
    'undervalued': 'Undervalued',
    'custom': 'Personalized',
  };
  
  return labels[category];
};

// Category icon mapping
const getCategoryIcon = (category: PropertyRecommendation['category']) => {
  const icons = {
    'high-yield': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
    'stable-growth': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ),
    'undervalued': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
      </svg>
    ),
    'custom': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  return icons[category];
};

// Format price to currency format
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
};

interface PropertyRecommendationsProps {
  recommendations: PropertyRecommendation[];
  properties?: Property[];
  className?: string;
}

export default function PropertyRecommendations({ 
  recommendations, 
  className = '' 
}: PropertyRecommendationsProps) {
  const router = useRouter();
  
  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce<Record<string, PropertyRecommendation[]>>((groups, rec) => {
    if (!groups[rec.category]) {
      groups[rec.category] = [];
    }
    groups[rec.category].push(rec);
    return groups;
  }, {});
  
  // Get the property data for a recommendation
  const getPropertyData = (recommendation: PropertyRecommendation): Property | undefined => {
    return properties.find(prop => prop.id === recommendation.propertyId);
  };
  
  // Handle property card click
  const handlePropertyClick = (propertyId: string) => {
    router.push(`/explore?property=${propertyId}`);
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Atlas Recommends
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          Powered by AI
        </div>
      </div>
      
      {/* Recommendations by category */}
      {Object.entries(groupedRecommendations).map(([category, recs]) => (
        <div key={category} className="space-y-3">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category as any)}`}></span>
            {getCategoryLabel(category as any)} Recommendations
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recs.map((recommendation) => {
              const property = getPropertyData(recommendation);
              if (!property) return null;
              
              const matchScore = recommendation.score.toFixed(1);
              
              return (
                <div 
                  key={recommendation.propertyId}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => handlePropertyClick(recommendation.propertyId)}
                >
                  {/* Property image with overlay */}
                  <div className="relative h-32">
                    <div 
                      className={`absolute inset-0 flex items-center justify-center ${getCategoryBgColor(recommendation.category)}`}
                    >
                      <span className="text-6xl font-bold text-white">
                        {property.name.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute top-0 left-0 m-2">
                      <div className="bg-blue-500 flex items-center px-2 py-1 rounded-full text-white text-xs font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                        </svg>
                        Match: {matchScore}
                      </div>
                    </div>
                  </div>
                  
                  {/* Property info */}
                  <div className="p-3">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {property.name}
                    </h5>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 truncate">
                      {property.location}
                    </p>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {formatPrice(property.price)}
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {property.yield}% yield
                      </span>
                    </div>
                    
                    {/* Reason */}
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                      <p className="line-clamp-2">
                        <span className="font-medium">Why:</span> {recommendation.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 