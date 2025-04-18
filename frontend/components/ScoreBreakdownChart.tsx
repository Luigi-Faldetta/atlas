import React from 'react';

type ScoreBreakdownChartProps = {
  scores: {
    risk: number;
    yield: number;
    growth: number;
    location: number;
    condition: number;
  };
  weightedAverage: number;
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-blue-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-red-500';
};

const getScoreTextColor = (score: number) => {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-blue-600 dark:text-blue-400';
  if (score >= 4) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const ScoreBar: React.FC<{
  label: string;
  score: number;
  maxScore: number;
}> = ({ label, score, maxScore = 10 }) => {
  const percentage = (score / maxScore) * 100;
  const colorClass = getScoreColor(score);
  const textColorClass = getScoreTextColor(score);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className={`text-sm font-bold ${textColorClass}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ScoreBreakdownChart: React.FC<ScoreBreakdownChartProps> = ({
  scores,
  weightedAverage,
}) => {
  return (
    <div className="space-y-4">
      <ScoreBar label="Risk" score={scores.risk} maxScore={10} />
      <ScoreBar label="Yield" score={scores.yield} maxScore={10} />
      <ScoreBar label="Growth" score={scores.growth} maxScore={10} />
      <ScoreBar label="Location" score={scores.location} maxScore={10} />
      <ScoreBar label="Condition" score={scores.condition} maxScore={10} />

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Weighted Average:
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {weightedAverage.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center mt-2">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <svg
              className="w-4 h-4 mr-1 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              ></path>
            </svg>
            Atlas AI powered scoring
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdownChart;
