import React from 'react'; // Import React

// Define the props interface to match what's passed from page.tsx
type InvestmentAnalysisProps = {
  investmentScore: number;
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null; // Added
  expectedMonthlyIncome: number | null; // Already present
  yearlyAppreciationPercentage: number | null; // Added
  yearlyAppreciationValue: number | null; // Added
  strengths: string[];
  weaknesses: string[];
  price: string;
  address: string;
  pricePerSqm: number | null; // Added
  characteristics?: string[]; // Added (optional)
  riskScore?: number; // Added (optional)
  yieldScore?: number; // Added (optional)
  growthScore?: number; // Added (optional)
  locationScore?: number; // Added (optional)
  conditionScore?: number; // Added (optional)
};

const InvestmentAnalysis = ({
  investmentScore,
  roi5Years,
  roi10Years,
  yearlyYield,
  monthlyRentalIncome, // Destructure added prop
  expectedMonthlyIncome, // Destructure existing prop
  yearlyAppreciationPercentage, // Destructure added prop
  yearlyAppreciationValue, // Destructure added prop
  strengths,
  weaknesses,
  price,
  address,
  pricePerSqm, // Destructure added prop
  characteristics, // Destructure added prop
  riskScore, // Destructure added prop
  yieldScore, // Destructure added prop
  growthScore, // Destructure added prop
  locationScore, // Destructure added prop
  conditionScore, // Destructure added prop
}: InvestmentAnalysisProps) => (
  // Basic structure - you'll likely want to display the new props here
  <div>
    <h2>Investment Analysis</h2>
    <p>
      <strong>Address:</strong> {address}
    </p>
    <p>
      <strong>Price:</strong> {price}
    </p>
    {pricePerSqm !== null && (
      <p>
        <strong>Price per m²:</strong> €{pricePerSqm.toFixed(2)}
      </p>
    )}
    <p>
      <strong>Investment Score:</strong> {investmentScore}/100
    </p>
    {/* Displaying some of the new props - add more as needed */}
    <p>
      <strong>Monthly Rental Income:</strong>{' '}
      {monthlyRentalIncome !== null ? `€${monthlyRentalIncome}` : 'N/A'}
    </p>
    <p>
      <strong>Expected Monthly Income:</strong>{' '}
      {expectedMonthlyIncome !== null ? `€${expectedMonthlyIncome}` : 'N/A'}
    </p>
    <p>
      <strong>ROI (5 years):</strong>{' '}
      {roi5Years !== null ? `${roi5Years}%` : 'N/A'}
    </p>
    <p>
      <strong>ROI (10 years):</strong>{' '}
      {roi10Years !== null ? `${roi10Years}%` : 'N/A'}
    </p>
    <p>
      <strong>Yearly Yield:</strong>{' '}
      {yearlyYield !== null ? `${yearlyYield}%` : 'N/A'}
    </p>
    <p>
      <strong>Yearly Appreciation:</strong>{' '}
      {yearlyAppreciationPercentage !== null
        ? `${yearlyAppreciationPercentage}%`
        : 'N/A'}{' '}
      (€
      {yearlyAppreciationValue !== null
        ? yearlyAppreciationValue.toFixed(0)
        : 'N/A'}
      )
    </p>

    {characteristics && characteristics.length > 0 && (
      <div>
        <h3>Characteristics</h3>
        <ul>
          {characteristics.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    )}

    <h3>Strengths</h3>
    <ul>
      {strengths.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
    <h3>Weaknesses</h3>
    <ul>
      {weaknesses.map((w, i) => (
        <li key={i}>{w}</li>
      ))}
    </ul>

    {/* Display Scores if available */}
    {(riskScore ||
      yieldScore ||
      growthScore ||
      locationScore ||
      conditionScore) && (
      <div>
        <h3>Score Breakdown (out of 10)</h3>
        <ul>
          {riskScore && <li>Risk: {riskScore.toFixed(1)}</li>}
          {yieldScore && <li>Yield: {yieldScore.toFixed(1)}</li>}
          {growthScore && <li>Growth: {growthScore.toFixed(1)}</li>}
          {locationScore && <li>Location: {locationScore.toFixed(1)}</li>}
          {conditionScore && <li>Condition: {conditionScore.toFixed(1)}</li>}
        </ul>
      </div>
    )}
  </div>
);

export default InvestmentAnalysis;
