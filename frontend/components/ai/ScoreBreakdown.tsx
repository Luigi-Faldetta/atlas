'use client';

import { ScoreBreakdownItem } from '@/data/mock/ai-features';

interface ScoreBreakdownProps {
  scoreData: ScoreBreakdownItem;
}

export default function ScoreBreakdown({ scoreData }: ScoreBreakdownProps) {
  // Calculate the contribution of each factor to the overall score
  const calculateContribution = (factorScore: number, weight: number) => {
    return factorScore * weight;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Atlas AI Score Breakdown</h4>
        <div className="flex items-center">
          <div className="bg-blue-500 text-white font-semibold text-lg rounded-full w-12 h-12 flex items-center justify-center">
            {scoreData.overallScore.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {scoreData.factors.map((factor, index) => {
          const contribution = calculateContribution(factor.score, factor.weight);
          const percentage = (contribution / scoreData.overallScore) * 100;
          
          // Generate color based on score
          const getScoreColor = (score: number) => {
            if (score >= 8.5) return 'text-green-500 dark:text-green-400';
            if (score >= 7) return 'text-blue-500 dark:text-blue-400';
            if (score >= 5) return 'text-yellow-500 dark:text-yellow-400';
            return 'text-red-500 dark:text-red-400';
          };
          
          return (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 dark:text-white mr-2">
                    {factor.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (Weight: {(factor.weight * 100).toFixed(0)}%)
                  </span>
                </div>
                <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                  {factor.score.toFixed(1)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-1">
                <div 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${factor.score * 10}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {factor.description}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score Interpretation</h5>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="text-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
            <span>0-5: High Risk</span>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <span>5-7: Moderate</span>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
            <span>7-8.5: Good</span>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
            <span>8.5-10: Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
} 