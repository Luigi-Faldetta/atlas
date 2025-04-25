'use client';

import { ScoreBreakdownItem } from '@/data/mock/ai-features';

interface ScoreBreakdownProps {
  scoreData: ScoreBreakdownItem | null | undefined;
}

// Update thresholds assuming factor.score is a percentage (0-100)
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function ScoreBreakdown({ scoreData }: ScoreBreakdownProps) {
  if (!scoreData) {
    return (
      <div className="text-center text-gray-500 py-4">
        AI Score data not available.
      </div>
    );
  }

  const { overallScore, scoreChange, factors, weightedAverage } = scoreData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Atlas AI Score Breakdown
        </h4>
        <div className="text-right">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {overallScore.toFixed(1)}
          </span>
          {scoreChange && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {scoreChange}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {factors.map((factor) => (
          <div key={factor.name}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                {factor.name}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {factor.score.toFixed(1)}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreColor(factor.score)}`}
                style={{ width: `${factor.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
        <span>Weighted Average: {weightedAverage.toFixed(1)}</span>
        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Atlas AI powered scoring
        </div>
      </div>
    </div>
  );
}
