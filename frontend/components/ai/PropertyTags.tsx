'use client';

import { PropertyTagsData, PropertyTag } from '@/data/mock/ai-features';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface PropertyTagsProps {
  tagsData: PropertyTagsData | null | undefined;
  interactive?: boolean; // Allow showing explanations on click?
  className?: string;
}

// Consolidated helper for tag styling based on prototype examples
const getTagStyle = (tag: PropertyTag): string => {
  // Style based on known labels first
  if (tag.label.toLowerCase().includes('high yield')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
  if (tag.label.toLowerCase().includes('stable growth')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
  if (tag.label.toLowerCase().includes('eco friendly')) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
  if (tag.label.toLowerCase().includes('prime location')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
  if (tag.label.startsWith('+')) return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-500';

  // Fallback to category if label isn't specific
  switch (tag.category) {
    case 'feature':
    case 'location':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    case 'yield':
    case 'growth':
       return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'other':
       return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-500';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
  }
};

// Icon mapping (optional, based on category or label)
const getTagIcon = (tag: PropertyTag) => {
   if (tag.label.toLowerCase().includes('prime location')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    );
  }
   if (tag.label.toLowerCase().includes('eco friendly')) {
     return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17.712 10.212a7.5 7.5 0 11-15.424 0 7.5 7.5 0 0115.424 0zM8.33 8.657a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4-4a.75.75 0 00-1.06-1.06L9 10.94l-1.72-1.72z" clipRule="evenodd" />
      </svg>
    );
   }
  // Add more icons based on category or label as needed
  return null;
};

export default function PropertyTags({ tagsData, interactive = false, className = '' }: PropertyTagsProps) {
  const [activeTagLabel, setActiveTagLabel] = useState<string | null>(null);

  if (!tagsData || !tagsData.tags || tagsData.tags.length === 0) {
    return null; // Don't render anything if no tags
  }

  const handleTagClick = (tag: PropertyTag) => {
    if (!interactive || !tag.explanation) return;
    
    if (activeTagLabel === tag.label) {
      setActiveTagLabel(null);
    } else {
      setActiveTagLabel(tag.label);
    }
  };

  const activeTagExplanation = activeTagLabel ? tagsData.tags.find(t => t.label === activeTagLabel)?.explanation : null;

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2">
        {tagsData.tags.map((tag, index) => {
          const icon = getTagIcon(tag);
          const style = getTagStyle(tag);
          const isClickable = interactive && !!tag.explanation;
          
          return (
            <Badge 
              key={index} 
              variant="outline" // Use outline variant for base styling
              className={`flex items-center text-xs px-2.5 py-1 rounded-full border-none ${style} ${isClickable ? 'cursor-pointer hover:opacity-90' : ''} ${activeTagLabel === tag.label ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
              {tag.label}
            </Badge>
          );
        })}
      </div>

      {/* Tag explanation panel - only shown if interactive */}
      {interactive && activeTagExplanation && (
        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 animate-fade-in">
           <h5 className="font-medium text-gray-900 dark:text-white mb-1">{activeTagLabel}</h5>
          {activeTagExplanation}
        </div>
      )}
    </div>
  );
} 