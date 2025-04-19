'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  DollarSign,
  Percent,
  Clock,
  Home,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  BarChart3,
} from 'lucide-react';

interface ROIData {
  annualRentalIncome: number;
  annualExpenses: number;
  netOperatingIncome: number;
  cashOnCashReturn: number;
  capRate: number;
  totalReturn5Year: number;
  totalReturn10Year: number;
  irr5Year: number;
  irr10Year: number;
}

export default function ROICalculator() {
  console.log('ROICalculator component rendering...');
  // Property investment inputs
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [annualAppreciation, setAnnualAppreciation] = useState(3);
  const [vacancyRate, setVacancyRate] = useState(5);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [insuranceRate, setInsuranceRate] = useState(0.5);
  const [maintenanceRate, setMaintenanceRate] = useState(1);
  const [managementFeeRate, setManagementFeeRate] = useState(8);

  // Calculated results
  const [results, setResults] = useState<ROIData | null>(null);

  useEffect(() => {
    console.log('ROICalculator useEffect running...');
    calculateROI();
  }, [
    purchasePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    loanTerm,
    monthlyRent,
    annualAppreciation,
    vacancyRate,
    propertyTaxRate,
    insuranceRate,
    maintenanceRate,
    managementFeeRate,
  ]);

  // Handle down payment changes
  const handleDownPaymentChange = (value: number) => {
    setDownPayment(value);
    setDownPaymentPercent(Math.round((value / purchasePrice) * 100));
  };

  const handleDownPaymentPercentChange = (value: number) => {
    setDownPaymentPercent(value);
    setDownPayment(Math.round((purchasePrice * value) / 100));
  };

  // Handle purchase price changes
  const handlePurchasePriceChange = (value: number) => {
    setPurchasePrice(value);
    setDownPayment(Math.round((value * downPaymentPercent) / 100));
  };

  const calculateROI = () => {
    // Calculate loan amount
    const loanAmount = purchasePrice - downPayment;

    // Calculate monthly mortgage payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyMortgagePayment =
      (loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // Calculate annual rental income (accounting for vacancy)
    const effectiveVacancyRate = vacancyRate / 100;
    const annualRentalIncome = monthlyRent * 12 * (1 - effectiveVacancyRate);

    // Calculate annual expenses
    const propertyTax = purchasePrice * (propertyTaxRate / 100);
    const insurance = purchasePrice * (insuranceRate / 100);
    const maintenance = purchasePrice * (maintenanceRate / 100);
    const managementFee = annualRentalIncome * (managementFeeRate / 100);
    const annualMortgagePayment = monthlyMortgagePayment * 12;

    const operatingExpenses =
      propertyTax + insurance + maintenance + managementFee;
    const totalAnnualExpenses = operatingExpenses + annualMortgagePayment;

    // Calculate net operating income (NOI)
    const netOperatingIncome = annualRentalIncome - operatingExpenses;

    // Calculate cash-on-cash return
    const cashFlow = annualRentalIncome - totalAnnualExpenses;
    const cashOnCashReturn = (cashFlow / downPayment) * 100;

    // Calculate cap rate
    const capRate = (netOperatingIncome / purchasePrice) * 100;

    // Calculate 5-year and 10-year returns including appreciation
    const appreciationRate = annualAppreciation / 100;
    let propertyValue5Year = purchasePrice;
    let propertyValue10Year = purchasePrice;
    let totalCashFlow5Year = 0;
    let totalCashFlow10Year = 0;
    let remainingLoanBalance5Year = loanAmount;
    let remainingLoanBalance10Year = loanAmount;

    for (let year = 1; year <= 10; year++) {
      // Calculate appreciation
      propertyValue5Year =
        year <= 5
          ? propertyValue5Year * (1 + appreciationRate)
          : propertyValue5Year;
      propertyValue10Year = propertyValue10Year * (1 + appreciationRate);

      // Calculate loan balance reduction (simplified)
      const interestPaid5Year =
        year <= 5 ? remainingLoanBalance5Year * (interestRate / 100) : 0;
      const principalPaid5Year =
        year <= 5 ? annualMortgagePayment - interestPaid5Year : 0;
      remainingLoanBalance5Year =
        year <= 5
          ? remainingLoanBalance5Year - principalPaid5Year
          : remainingLoanBalance5Year;

      const interestPaid10Year =
        remainingLoanBalance10Year * (interestRate / 100);
      const principalPaid10Year = annualMortgagePayment - interestPaid10Year;
      remainingLoanBalance10Year =
        remainingLoanBalance10Year - principalPaid10Year;

      // Add cash flow for each year
      totalCashFlow5Year += year <= 5 ? cashFlow : 0;
      totalCashFlow10Year += cashFlow;
    }

    // Calculate equity after 5 and 10 years
    const equity5Year = propertyValue5Year - remainingLoanBalance5Year;
    const equity10Year = propertyValue10Year - remainingLoanBalance10Year;

    // Calculate total return
    const totalReturn5Year =
      ((equity5Year - downPayment + totalCashFlow5Year) / downPayment) * 100;
    const totalReturn10Year =
      ((equity10Year - downPayment + totalCashFlow10Year) / downPayment) * 100;

    // Calculate IRR (simplified approximation)
    const irr5Year = (totalReturn5Year / 100 / 5) * 100;
    const irr10Year = (totalReturn10Year / 100 / 10) * 100;

    setResults({
      annualRentalIncome,
      annualExpenses: totalAnnualExpenses,
      netOperatingIncome,
      cashOnCashReturn,
      capRate,
      totalReturn5Year,
      totalReturn10Year,
      irr5Year,
      irr10Year,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 mr-2 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Investment ROI Calculator
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Property Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) =>
                      handlePurchasePriceChange(Number(e.target.value))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Down Payment: ${downPayment.toLocaleString()} (
                  {downPaymentPercent}%)
                </label>
                <Slider
                  defaultValue={[downPaymentPercent]}
                  max={100}
                  step={1}
                  value={[downPaymentPercent]}
                  onValueChange={(value) =>
                    handleDownPaymentPercentChange(value[0])
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="pl-10"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Loan Term (years)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Rental Income
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Additional Factors
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Appreciation Rate: {annualAppreciation}%
                </label>
                <Slider
                  defaultValue={[annualAppreciation]}
                  max={10}
                  step={0.1}
                  value={[annualAppreciation]}
                  onValueChange={(value) => setAnnualAppreciation(value[0])}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vacancy Rate: {vacancyRate}%
                </label>
                <Slider
                  defaultValue={[vacancyRate]}
                  max={20}
                  step={0.5}
                  value={[vacancyRate]}
                  onValueChange={(value) => setVacancyRate(value[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Property Tax: {propertyTaxRate}%
                  </label>
                  <Slider
                    defaultValue={[propertyTaxRate]}
                    max={5}
                    step={0.1}
                    value={[propertyTaxRate]}
                    onValueChange={(value) => setPropertyTaxRate(value[0])}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Insurance: {insuranceRate}%
                  </label>
                  <Slider
                    defaultValue={[insuranceRate]}
                    max={3}
                    step={0.1}
                    value={[insuranceRate]}
                    onValueChange={(value) => setInsuranceRate(value[0])}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Maintenance: {maintenanceRate}%
                  </label>
                  <Slider
                    defaultValue={[maintenanceRate]}
                    max={5}
                    step={0.1}
                    value={[maintenanceRate]}
                    onValueChange={(value) => setMaintenanceRate(value[0])}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Management Fee: {managementFeeRate}%
                  </label>
                  <Slider
                    defaultValue={[managementFeeRate]}
                    max={15}
                    step={0.5}
                    value={[managementFeeRate]}
                    onValueChange={(value) => setManagementFeeRate(value[0])}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-6 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Investment Analysis
            </h3>

            {results && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Annual Rental Income
                    </p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${results.annualRentalIncome.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Annual Expenses
                    </p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      ${results.annualExpenses.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Net Operating Income
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${Math.round(results.netOperatingIncome).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Cap Rate
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {results.capRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Cash-on-Cash Return
                    </p>
                    <div className="flex items-center">
                      <p
                        className={`text-xl font-bold ${
                          results.cashOnCashReturn >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {results.cashOnCashReturn.toFixed(2)}%
                      </p>
                      {results.cashOnCashReturn >= 0 ? (
                        <ArrowUp className="w-4 h-4 ml-1 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-2 text-slate-900 dark:text-white">
                    Long-Term Returns
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          5-Year Return
                        </p>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                        {results.totalReturn5Year.toFixed(2)}%
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        IRR: {results.irr5Year.toFixed(2)}%
                      </p>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          10-Year Return
                        </p>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                        {results.totalReturn10Year.toFixed(2)}%
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        IRR: {results.irr10Year.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />
                  Find Properties with This ROI
                </Button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">
              Atlas ROI Score
            </h4>
            <div className="flex items-center">
              <div className="flex-grow h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                {results && (
                  <div
                    className={`h-full rounded-full ${
                      results.cashOnCashReturn < 0
                        ? 'bg-red-500'
                        : results.cashOnCashReturn < 5
                          ? 'bg-amber-500'
                          : results.cashOnCashReturn < 10
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${(Math.min(Math.max(results?.cashOnCashReturn || 0, 0), 15) / 15) * 100}%`,
                    }}
                  ></div>
                )}
              </div>
              {results && (
                <span className="ml-4 font-bold text-lg text-slate-900 dark:text-white">
                  {results.cashOnCashReturn < 0
                    ? 'Poor'
                    : results.cashOnCashReturn < 5
                      ? 'Fair'
                      : results.cashOnCashReturn < 10
                        ? 'Good'
                        : 'Excellent'}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Based on cash-on-cash return, cap rate, and projected long-term
              performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
