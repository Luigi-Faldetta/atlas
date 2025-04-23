'use client';

import React from 'react';
import { ScoreBreakdownItem, PropertyTagsData } from '@/data/mock/ai-features';
import ScoreBreakdown from '@/components/ai/ScoreBreakdown';
import PropertyTags from '@/components/ai/PropertyTags';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card component
import LineChart from '@/components/charts/LineChart'; // Corrected chart import assuming it's a default export in /components/charts/

interface AITabProps {
  scoreData: ScoreBreakdownItem | null | undefined;
  tagsData: PropertyTagsData | null | undefined;
}

const AboutAIAnalysis = () => (
  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="font-medium mb-1">About Atlas AI Analysis</p>
        <p>The Atlas AI scoring system analyzes multiple factors to provide a comprehensive property assessment. Scores are calculated using a proprietary algorithm that evaluates risk, yield potential, growth forecasts, location quality, and property condition. This helps you make more informed investment decisions based on quantitative data points.</p>
      </div>
    </div>
);

const ScoreHistoryChart = ({ scoreData }: { scoreData: ScoreBreakdownItem | null | undefined }) => {
   // Ensure scoreData and historicalScores exist and are not empty
   const safeHistoricalScores = scoreData?.historicalScores && Array.isArray(scoreData.historicalScores) && scoreData.historicalScores.length > 0 
                                 ? scoreData.historicalScores 
                                 : [];
   
   // Prepare chart data only if safeHistoricalScores has items
   const chartData = safeHistoricalScores.length > 0 ? {
      labels: safeHistoricalScores.map(hs => hs.date), 
      datasets: [
        {
          label: 'Atlas AI Score',
          data: safeHistoricalScores.map(hs => hs.score),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#3b82f6',
          tension: 0.3,
          fill: true,
        }
      ]
    } : {
      labels: [], // Ensure valid structure
      datasets: []
    };

    const options = {
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { display: false },
          ticks: { stepSize: 2 }
        },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    };

    return chartData.datasets.length > 0 
        ? <LineChart data={chartData} options={options} height={200} />
        : <div className="h-[200px] flex items-center justify-center text-gray-500">Score history unavailable.</div>;
};

export default function AITab({ scoreData, tagsData }: AITabProps) {
  return (
    <div className="pt-4 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score breakdown Card */}
        <ScoreBreakdown scoreData={scoreData} />
        
        {/* Property Characteristics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Property Characteristics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* AI tags with explanations */}
             <PropertyTags tagsData={tagsData} interactive={true} />
              
             {/* Historical score chart */}
            <div>
               <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score History</h4>
               <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                 <ScoreHistoryChart scoreData={scoreData} />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* About Section */}
      <AboutAIAnalysis />
    </div>
  );
} 