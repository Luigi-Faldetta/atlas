'use client';

import { PropertyTagsData } from '@/data/mock/ai-features';
import { useState } from 'react';

interface PropertyTagsProps {
  tags: PropertyTagsData;
}

export default function PropertyTags({ tags }: PropertyTagsProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Get tag background color based on category
  const getTagColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'opportunity':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'risk':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };
  
  // Get tag icon based on category
  const getTagIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        );
      case 'risk':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Handle tag click to show/hide explanation
  const handleTagClick = (tagText: string) => {
    if (activeTag === tagText) {
      setActiveTag(null);
    } else {
      setActiveTag(tagText);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.tags.map((tag, index) => (
          <button
            key={index}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getTagColor(tag.category)} transition-all duration-200 hover:shadow-sm ${activeTag === tag.text ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => handleTagClick(tag.text)}
          >
            <span className="mr-1">{getTagIcon(tag.category)}</span>
            {tag.text}
          </button>
        ))}
      </div>
      
      {/* Tag explanation panel */}
      {activeTag && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
          <h5 className="font-medium text-gray-900 dark:text-white mb-1">{activeTag}</h5>
          <p className="text-gray-700 dark:text-gray-300">
            {tags.tags.find(tag => tag.text === activeTag)?.explanation}
          </p>
        </div>
      )}
    </div>
  );
} 