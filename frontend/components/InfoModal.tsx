import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type InfoModalProps = {
  title: string;
  content: string | React.ReactNode;
};

const InfoModal: React.FC<InfoModalProps> = ({ title, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={`Information about ${title}`}
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
      </button>

      {isVisible && (
        <div className="absolute z-10 w-64 p-3 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 text-left transform -translate-x-1/2 left-1/2 mt-1">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            {title}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoModal;
