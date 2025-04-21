'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  DollarSign, // Keep for potential future use, but we'll use € symbol directly
  Euro, // Import Euro icon if available and desired, otherwise use text symbol
  Percent,
  Clock,
  Home,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Wrench,
  Briefcase,
  CalendarDays,
  Landmark,
  Receipt,
  PiggyBank,
  Wallet,
  LineChart,
  Building,
} from 'lucide-react'; // Assuming Euro icon exists, if not, remove it
import InfoModal from './InfoModal'; // Import the InfoModal component

// --- Updated Interface for Investment Metrics ---
interface InvestmentMetrics {
  // Initial Investment
  initialCashInvested: number;
  loanAmount: number;

  // Annual Operations (Year 1)
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  annualDebtService: number;
  annualCashFlow: number;

  // Key Ratios (Year 1)
  capRate: number;
  cashOnCashReturn: number;

  // Projections over Holding Period
  projectedSalePrice: number;
  totalCashFlow: number;
  equityGain: number; // Appreciation + Loan Paydown
  totalProfit: number;
  totalROI: number; // Total Return on Investment over the holding period
  averageAnnualROI: number; // Simple average annual return
  // Note: A true IRR calculation is complex and often requires a library or iterative function.
  // This simplified version gives a basic idea but isn't a finance-standard IRR.
  simplifiedIRR: number;
}

export default function ROICalculator() {
  console.log('ROICalculator component rendering...');

  // --- Input State Variables ---
  // Acquisition
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [closingCostsPercent, setClosingCostsPercent] = useState(3); // % of Purchase Price
  const [initialRepairs, setInitialRepairs] = useState(10000); // Fixed Amount

  // Financing
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5); // Store as number (e.g., 5.5 for 5.5%)
  const [loanTerm, setLoanTerm] = useState(30);

  // Income
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(2); // %

  // Operating Expenses (% of Purchase Price or Rent)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // % of Purchase Price
  const [insuranceRate, setInsuranceRate] = useState(0.5); // % of Purchase Price
  const [maintenanceRate, setMaintenanceRate] = useState(1); // % of Purchase Price
  const [vacancyRate, setVacancyRate] = useState(5); // % of Gross Rent
  const [managementFeeRate, setManagementFeeRate] = useState(8); // % of Effective Gross Income
  const [annualExpenseInflation, setAnnualExpenseInflation] = useState(2); // %

  // Projections & Sale
  const [holdingPeriod, setHoldingPeriod] = useState(5); // Years
  const [annualAppreciation, setAnnualAppreciation] = useState(3); // %
  const [sellingCostsPercent, setSellingCostsPercent] = useState(6); // % of Sale Price

  // --- Calculated Derived State ---
  const [downPayment, setDownPayment] = useState(
    (purchasePrice * downPaymentPercent) / 100
  );
  const [closingCosts, setClosingCosts] = useState(
    (purchasePrice * closingCostsPercent) / 100
  );

  // --- Results State ---
  const [results, setResults] = useState<InvestmentMetrics | null>(null);

  // --- Recalculate Derived State on Input Change ---
  useEffect(() => {
    setDownPayment(Math.round((purchasePrice * downPaymentPercent) / 100));
    setClosingCosts(Math.round((purchasePrice * closingCostsPercent) / 100));
  }, [purchasePrice, downPaymentPercent, closingCostsPercent]);

  // --- Recalculate ROI on Any Input Change ---
  useEffect(() => {
    console.log('ROICalculator useEffect running...');
    calculateInvestmentMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    purchasePrice,
    closingCostsPercent,
    initialRepairs,
    downPaymentPercent,
    interestRate,
    loanTerm,
    monthlyRent,
    annualRentIncrease,
    propertyTaxRate,
    insuranceRate,
    maintenanceRate,
    vacancyRate,
    managementFeeRate,
    annualExpenseInflation,
    holdingPeriod,
    annualAppreciation,
    sellingCostsPercent,
    // Derived state included as they trigger recalculation indirectly via purchasePrice etc.
    downPayment,
    closingCosts,
  ]);

  // --- Calculation Logic ---
  const calculateInvestmentMetrics = () => {
    // --- Initial Investment ---
    const loanAmount = purchasePrice - downPayment;
    const initialCashInvested = downPayment + closingCosts + initialRepairs;

    if (initialCashInvested <= 0 || purchasePrice <= 0) {
      setResults(null); // Avoid division by zero or nonsensical results
      return;
    }

    // --- Mortgage Calculation ---
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyMortgagePayment =
      loanAmount <= 0 || monthlyInterestRate <= 0 // Handle 100% cash purchase or 0% interest
        ? 0
        : (loanAmount *
            (monthlyInterestRate *
              Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const annualDebtService = monthlyMortgagePayment * 12;

    // --- Year 1 Operations ---
    const grossScheduledIncome = monthlyRent * 12;
    const vacancyLoss = grossScheduledIncome * (vacancyRate / 100);
    const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

    const propertyTax = purchasePrice * (propertyTaxRate / 100);
    const insurance = purchasePrice * (insuranceRate / 100);
    const maintenance = purchasePrice * (maintenanceRate / 100);
    // Management fee based on EGI
    const managementFee = effectiveGrossIncome * (managementFeeRate / 100);
    const operatingExpenses =
      propertyTax + insurance + maintenance + managementFee;

    const netOperatingIncome = effectiveGrossIncome - operatingExpenses;
    const annualCashFlow = netOperatingIncome - annualDebtService;

    // --- Year 1 Ratios ---
    const capRate =
      purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const cashOnCashReturn =
      initialCashInvested > 0
        ? (annualCashFlow / initialCashInvested) * 100
        : 0;

    // --- Projections over Holding Period ---
    let currentPropertyValue = purchasePrice;
    let currentMonthlyRent = monthlyRent;
    // let currentOperatingExpenses = operatingExpenses; // Not needed like this
    let remainingLoanBalance = loanAmount;
    let totalCashFlow = 0;
    let totalPrincipalPaid = 0;

    for (let year = 1; year <= holdingPeriod; year++) {
      // Calculate income and expenses for the current year
      const yearlyGrossScheduledIncome = currentMonthlyRent * 12;
      const yearlyVacancyLoss =
        yearlyGrossScheduledIncome * (vacancyRate / 100);
      const yearlyEffectiveGrossIncome =
        yearlyGrossScheduledIncome - yearlyVacancyLoss;

      // Adjust management fee based on current EGI
      const yearlyManagementFee =
        yearlyEffectiveGrossIncome * (managementFeeRate / 100);
      // Calculate base expenses (Tax, Insurance, Maintenance) for the current year based on inflation
      const baseOpExYear1 = propertyTax + insurance + maintenance;
      const inflatedBaseOpEx =
        baseOpExYear1 * Math.pow(1 + annualExpenseInflation / 100, year - 1);
      const yearlyOperatingExpenses = inflatedBaseOpEx + yearlyManagementFee; // Add current year's management fee

      const yearlyNOI = yearlyEffectiveGrossIncome - yearlyOperatingExpenses;

      // Calculate Debt Service for the year
      let yearlyInterestPaid = 0;
      let yearlyPrincipalPaid = 0;
      if (loanAmount > 0 && remainingLoanBalance > 0) {
        // Check remaining balance
        for (let month = 1; month <= 12; month++) {
          const interestPayment = remainingLoanBalance * monthlyInterestRate;
          // Ensure principal payment doesn't exceed remaining balance or mortgage payment
          const principalPayment = Math.min(
            monthlyMortgagePayment - interestPayment,
            remainingLoanBalance
          );
          yearlyInterestPaid += interestPayment;
          yearlyPrincipalPaid += principalPayment;
          remainingLoanBalance -= principalPayment;
          // Ensure balance doesn't go below zero
          remainingLoanBalance = Math.max(0, remainingLoanBalance);
          if (remainingLoanBalance === 0) break; // Stop if loan paid off
        }
      }
      const yearlyDebtService = yearlyInterestPaid + yearlyPrincipalPaid;
      const yearlyCashFlow = yearlyNOI - yearlyDebtService;

      totalCashFlow += yearlyCashFlow;
      totalPrincipalPaid += yearlyPrincipalPaid;

      // Update values for next year
      currentPropertyValue *= 1 + annualAppreciation / 100;
      currentMonthlyRent *= 1 + annualRentIncrease / 100;
      // No need to update currentOperatingExpenses state here, it's recalculated fully each year
    }

    // --- Sale Calculation ---
    const projectedSalePrice = currentPropertyValue;
    const sellingCosts = projectedSalePrice * (sellingCostsPercent / 100);
    const saleProceedsBeforeLoan = projectedSalePrice - sellingCosts;
    // Equity Gain = Appreciation + Loan Paydown
    // Appreciation = projectedSalePrice - purchasePrice
    // Loan Paydown = totalPrincipalPaid
    const equityGain = projectedSalePrice - purchasePrice + totalPrincipalPaid;
    const saleProceedsAfterLoan = saleProceedsBeforeLoan - remainingLoanBalance;

    // --- Total Return Calculation ---
    // Total Profit = (Sale Proceeds After Loan - Initial Cash Invested) + Total Cash Flow
    // Sale Proceeds After Loan = projectedSalePrice - sellingCosts - remainingLoanBalance
    // Initial Cash Invested = downPayment + closingCosts + initialRepairs
    const totalProfit =
      saleProceedsAfterLoan - initialCashInvested + totalCashFlow;
    const totalROI =
      initialCashInvested > 0 ? (totalProfit / initialCashInvested) * 100 : 0;
    const averageAnnualROI = holdingPeriod > 0 ? totalROI / holdingPeriod : 0;

    // Simplified IRR approximation (Average Annual ROI) - A proper calculation is more complex
    const simplifiedIRR = averageAnnualROI;

    setResults({
      initialCashInvested,
      loanAmount,
      effectiveGrossIncome, // Year 1 EGI
      operatingExpenses, // Year 1 OpEx
      netOperatingIncome, // Year 1 NOI
      annualDebtService, // Year 1 Debt Service
      annualCashFlow, // Year 1 Cash Flow
      capRate, // Year 1 Cap Rate
      cashOnCashReturn, // Year 1 CoC Return
      projectedSalePrice,
      totalCashFlow, // Over holding period
      equityGain, // Over holding period
      totalProfit, // Over holding period
      totalROI, // Over holding period
      averageAnnualROI, // Over holding period
      simplifiedIRR, // Approximation
    });
  };

  // --- Helper Functions ---
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-- €';
    // Use 'nl-NL' locale for Euro symbol prefix, dot thousands separator, and comma decimal separator
    return value.toLocaleString('nl-NL', {
      // Changed locale to nl-NL
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0, // Display whole numbers for currency
      maximumFractionDigits: 0,
    });
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-- %';
    // Input value should be the decimal representation (e.g., 0.05 for 5%)
    // 'nl-NL' locale also uses comma decimal separator
    // 'style: 'percent'' automatically multiplies by 100 and adds '%'
    return value.toLocaleString('nl-NL', {
      // Changed locale to nl-NL
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- JSX Structure ---
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Building className="w-6 h-6 mr-2 text-blue-600" />
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Real Estate Investment Calculator
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Input Form Column */}
        <div className="space-y-6">
          {/* Acquisition Costs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center">
              <Home className="w-5 h-5 mr-2 text-slate-500" /> Acquisition
            </h3>
            <div className="space-y-4">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    €
                  </span>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) =>
                      setPurchasePrice(Math.max(0, Number(e.target.value)))
                    }
                    className="pl-8"
                    step="any"
                  />
                </div>
              </div>
              {/* Closing Costs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Closing Costs: {formatCurrency(closingCosts)} (
                  {formatPercent(closingCostsPercent / 100)}){' '}
                  {/* Pass decimal to formatPercent */}
                </label>
                <Slider
                  value={[closingCostsPercent]}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setClosingCostsPercent(value[0])}
                />
              </div>
              {/* Initial Repairs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Repairs/Renovations
                </label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={initialRepairs}
                    onChange={(e) =>
                      setInitialRepairs(Math.max(0, Number(e.target.value)))
                    }
                    className="pl-10 pr-8"
                    step="any"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center">
              <Landmark className="w-5 h-5 mr-2 text-slate-500" /> Financing
            </h3>
            <div className="space-y-4">
              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Down Payment: {formatCurrency(downPayment)} (
                  {formatPercent(downPaymentPercent / 100)}){' '}
                  {/* Pass decimal */}
                </label>
                <Slider
                  value={[downPaymentPercent]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setDownPaymentPercent(value[0])}
                />
              </div>
              {/* Interest Rate */}
              <div>
                {/* Label shows formatted rate */}
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Interest Rate ({formatPercent(interestRate / 100)}){' '}
                  {/* Pass decimal */}
                </label>
                <div className="relative">
                  {/* Input takes the raw number value. Browser controls display format (usually '.') */}
                  <Input
                    type="number"
                    value={interestRate} // Keep as number for input state
                    onChange={(e) => {
                      // Allow comma or period input, convert comma to period for Number()
                      const valueString = e.target.value.replace(',', '.');
                      setInterestRate(Math.max(0, Number(valueString)));
                    }}
                    className="pr-10" // Add padding for potential icon if needed later
                    step="0.01" // Allow fine steps
                    lang="de-DE" // Hint for browser localization, might affect input behavior
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
              </div>
              {/* Loan Term */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Loan Term (years)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e) =>
                      setLoanTerm(Math.max(1, Number(e.target.value)))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Income & Expenses */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-slate-500" /> Income &
              Expenses
            </h3>
            <div className="space-y-4">
              {/* Monthly Rent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Rental Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    €
                  </span>
                  <Input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) =>
                      setMonthlyRent(Math.max(0, Number(e.target.value)))
                    }
                    className="pl-8"
                    step="any"
                  />
                </div>
              </div>
              {/* Vacancy Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vacancy Rate: {formatPercent(vacancyRate / 100)} (of Gross
                  Rent) {/* Pass decimal */}
                </label>
                <Slider
                  value={[vacancyRate]}
                  max={50}
                  step={0.5}
                  onValueChange={(value) => setVacancyRate(value[0])}
                />
              </div>
              {/* Property Tax */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Property Tax Rate: {formatPercent(propertyTaxRate / 100)} (of
                  Purchase Price) {/* Pass decimal */}
                </label>
                <Slider
                  value={[propertyTaxRate]}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setPropertyTaxRate(value[0])}
                />
              </div>
              {/* Insurance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Insurance Rate: {formatPercent(insuranceRate / 100)} (of
                  Purchase Price) {/* Pass decimal */}
                </label>
                <Slider
                  value={[insuranceRate]}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setInsuranceRate(value[0])}
                />
              </div>
              {/* Maintenance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Maintenance Rate: {formatPercent(maintenanceRate / 100)} (of
                  Purchase Price) {/* Pass decimal */}
                </label>
                <Slider
                  value={[maintenanceRate]}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setMaintenanceRate(value[0])}
                />
              </div>
              {/* Management Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Management Fee: {formatPercent(managementFeeRate / 100)} (of
                  Effective Income) {/* Pass decimal */}
                </label>
                <Slider
                  value={[managementFeeRate]}
                  max={20}
                  step={0.5}
                  onValueChange={(value) => setManagementFeeRate(value[0])}
                />
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-slate-500" /> Projections
            </h3>
            <div className="space-y-4">
              {/* Holding Period */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Holding Period: {holdingPeriod} years
                </label>
                <Slider
                  value={[holdingPeriod]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={(value) => setHoldingPeriod(value[0])}
                />
              </div>
              {/* Annual Appreciation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Property Appreciation:{' '}
                  {formatPercent(annualAppreciation / 100)} {/* Pass decimal */}
                </label>
                <Slider
                  value={[annualAppreciation]}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setAnnualAppreciation(value[0])}
                />
              </div>
              {/* Annual Rent Increase */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Rent Increase:{' '}
                  {formatPercent(annualRentIncrease / 100)} {/* Pass decimal */}
                </label>
                <Slider
                  value={[annualRentIncrease]}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setAnnualRentIncrease(value[0])}
                />
              </div>
              {/* Annual Expense Inflation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Expense Inflation:{' '}
                  {formatPercent(annualExpenseInflation / 100)}{' '}
                  {/* Pass decimal */}
                </label>
                <Slider
                  value={[annualExpenseInflation]}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setAnnualExpenseInflation(value[0])}
                />
              </div>
              {/* Selling Costs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Selling Costs: {formatPercent(sellingCostsPercent / 100)} (of
                  Sale Price) {/* Pass decimal */}
                </label>
                <Slider
                  value={[sellingCostsPercent]}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setSellingCostsPercent(value[0])}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 border border-blue-100 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Investment Analysis Results
              </h3>

              {!results ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Enter investment details to see analysis.
                </p>
              ) : (
                <div className="space-y-5">
                  {/* Initial Investment */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                      <PiggyBank className="w-4 h-4 mr-1.5" />
                      Initial Cash Invested
                      <span className="ml-1.5">
                        <InfoModal
                          title="Initial Cash Invested"
                          content="The total amount of cash required to purchase the property, including the down payment, closing costs, and initial repairs/renovations."
                        />
                      </span>
                    </h4>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(results.initialCashInvested)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      (Down Payment + Closing Costs + Repairs)
                    </p>
                  </div>

                  {/* Year 1 Operations */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Year 1 Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Net Operating Income (NOI)
                          <span className="ml-1">
                            <InfoModal
                              title="Net Operating Income (NOI)"
                              content="The property's annual income after deducting operating expenses (like taxes, insurance, maintenance, management fees), but before deducting debt service (mortgage payments)."
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(results.netOperatingIncome)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Annual Cash Flow
                          <span className="ml-1">
                            <InfoModal
                              title="Annual Cash Flow"
                              content="The amount of cash generated by the property annually after paying all operating expenses and debt service (mortgage payments). Calculated as NOI minus Annual Debt Service."
                            />
                          </span>
                        </p>
                        <p
                          className={`text-md font-semibold ${
                            results.annualCashFlow >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(results.annualCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Cap Rate
                          <span className="ml-1">
                            <InfoModal
                              title="Capitalization Rate (Cap Rate)"
                              content="A measure of the property's unleveraged rate of return. Calculated as Net Operating Income (NOI) divided by the Purchase Price. It helps compare the profitability of different properties."
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-slate-900 dark:text-white">
                          {formatPercent(results.capRate / 100)}{' '}
                          {/* Pass decimal */}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Cash-on-Cash Return
                          <span className="ml-1">
                            <InfoModal
                              title="Cash-on-Cash Return (CoC)"
                              content="Measures the annual return on the actual cash invested. Calculated as Annual Cash Flow divided by the Initial Cash Invested. It shows the return on your out-of-pocket investment."
                            />
                          </span>
                        </p>
                        <p
                          className={`text-md font-semibold ${
                            results.cashOnCashReturn >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatPercent(results.cashOnCashReturn / 100)}{' '}
                          {/* Pass decimal */}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Projections */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      {holdingPeriod}-Year Projection
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Projected Sale Price
                          <span className="ml-1">
                            <InfoModal
                              title="Projected Sale Price"
                              content={`The estimated value of the property after the ${holdingPeriod}-year holding period, based on the initial purchase price and the assumed annual appreciation rate.`}
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(results.projectedSalePrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Total Cash Flow
                          <span className="ml-1">
                            <InfoModal
                              title="Total Cash Flow"
                              content={`The sum of all annual cash flows generated over the ${holdingPeriod}-year holding period.`}
                            />
                          </span>
                        </p>
                        <p
                          className={`text-md font-semibold ${
                            results.totalCashFlow >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(results.totalCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Equity Gain
                          <span className="ml-1">
                            <InfoModal
                              title="Equity Gain"
                              content={`The increase in equity over the holding period, resulting from property appreciation (Projected Sale Price - Purchase Price) and loan principal paydown.`}
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(results.equityGain)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Total Profit
                          <span className="ml-1">
                            <InfoModal
                              title="Total Profit"
                              content={`The overall profit from the investment after selling the property. Calculated as (Sale Proceeds After Costs & Loan Payoff - Initial Cash Invested) + Total Cash Flow over the holding period.`}
                            />
                          </span>
                        </p>
                        <p
                          className={`text-md font-semibold ${
                            results.totalProfit >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(results.totalProfit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Returns */}
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Overall Returns ({holdingPeriod} Years)
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                          Total ROI
                          <span className="ml-1">
                            <InfoModal
                              title="Total Return on Investment (ROI)"
                              content="The total profit generated over the holding period expressed as a percentage of the initial cash invested. Calculated as (Total Profit / Initial Cash Invested)."
                            />
                          </span>
                        </p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {formatPercent(results.totalROI / 100)}{' '}
                          {/* Pass decimal */}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                          Average Annual ROI
                          <span className="ml-1">
                            <InfoModal
                              title="Average Annual ROI"
                              content="The simple average annual return over the holding period. Calculated as Total ROI divided by the Holding Period (in years)."
                            />
                          </span>
                        </p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {formatPercent(results.averageAnnualROI / 100)}{' '}
                          {/* Pass decimal */}
                        </p>
                      </div>
                      {/* Simplified IRR display commented out */}
                      {/* <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Simplified IRR</p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{formatPercent(results.simplifiedIRR / 100)}</p>
                      </div> */}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      (Total ROI = Total Profit / Initial Cash Invested)
                    </p>
                  </div>

                  {/* Placeholder for Action Button */}
                  {/* <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                    <Home className="w-4 h-4 mr-2" />
                    Find Properties with Similar Returns
                  </Button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
