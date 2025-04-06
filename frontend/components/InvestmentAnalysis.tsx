import React from 'react';

type InvestmentAnalysisProps = {
  investmentScore: number; // 0-100 score
  roi: number | null; // ROI percentage
  strengths: string[]; // Key strengths
  weaknesses: string[]; // Key weaknesses
  price: string;
  address: string;
};

export default function InvestmentAnalysis({
  investmentScore,
  roi,
  strengths,
  weaknesses,
  price,
  address,
}: InvestmentAnalysisProps) {
  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Investment Analysis</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Investment Score:</strong> {investmentScore}/100
        </li>
        <li>
          <strong>ROI:</strong> {roi !== null ? `${roi}%` : 'Not available'}
        </li>
        <li>
          <strong>Price:</strong> {price}
        </li>
        <li>
          <strong>Address:</strong> {address}
        </li>
        <li>
          <strong>Strengths:</strong>
          <ul className="list-disc pl-5 space-y-1">
            {strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))
            ) : (
              <li>Not available</li>
            )}
          </ul>
        </li>
        <li>
          <strong>Weaknesses:</strong>
          <ul className="list-disc pl-5 space-y-1">
            {weaknesses.length > 0 ? (
              weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))
            ) : (
              <li>Not available</li>
            )}
          </ul>
        </li>
      </ul>
    </div>
  );
}
