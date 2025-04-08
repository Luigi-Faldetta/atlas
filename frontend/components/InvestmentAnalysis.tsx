type InvestmentAnalysisProps = {
  investmentScore: number;
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null;
  yearlyAppreciationPercentage: number | null;
  yearlyAppreciationValue: number | null;
  strengths: string[];
  weaknesses: string[];
  price: string;
  address: string;
};

const InvestmentAnalysis = ({
  investmentScore,
  roi5Years,
  roi10Years,
  yearlyYield,
  monthlyRentalIncome,
  yearlyAppreciationPercentage,
  yearlyAppreciationValue,
  strengths,
  weaknesses,
  price,
  address,
}: InvestmentAnalysisProps) => (
  <div>
    <h2>Investment Analysis</h2>
    <p>
      <strong>Address:</strong> {address}
    </p>
    <p>
      <strong>Price:</strong> {price}
    </p>
    <p>
      <strong>Investment Score:</strong> {investmentScore}/100
    </p>
    <p>
      <strong>ROI (5 years):</strong> {roi5Years ? `${roi5Years}%` : 'N/A'}
    </p>
    <p>
      <strong>ROI (10 years):</strong> {roi10Years ? `${roi10Years}%` : 'N/A'}
    </p>
    <p>
      <strong>Yearly Yield:</strong> {yearlyYield ? `${yearlyYield}%` : 'N/A'}
    </p>
    <p>
      <strong>Monthly Rental Income:</strong>{' '}
      {monthlyRentalIncome ? `€${monthlyRentalIncome}` : 'N/A'}
    </p>
    <p>
      <strong>Yearly Appreciation:</strong>{' '}
      {yearlyAppreciationPercentage
        ? `${yearlyAppreciationPercentage}%`
        : 'N/A'}{' '}
      ({yearlyAppreciationValue ? `€${yearlyAppreciationValue}` : 'N/A'})
    </p>
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
  </div>
);

export default InvestmentAnalysis;
