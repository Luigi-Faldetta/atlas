'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  DollarSign,
  Euro,
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
  Landmark, // Keep or remove Landmark icon? Removing financing section, so maybe remove.
  Receipt,
  PiggyBank,
  Wallet,
  LineChart,
  Building,
} from 'lucide-react';
import InfoModal from './InfoModal';

// --- Updated Interface for Investment Metrics (No Financing) ---
interface InvestmentMetrics {
  // Initial Investment
  initialCashInvested: number; // Now equals Purchase Price + Closing Costs + Repairs

  // Annual Operations (Year 1)
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number; // NOI is now the same as Cash Flow before tax
  annualCashFlow: number; // Same as NOI in this scenario

  // Key Ratios (Year 1)
  capRate: number;
  cashOnCashReturn: number; // Return based on total cash invested

  // Projections over Holding Period
  projectedSalePrice: number;
  totalCashFlow: number; // Sum of annual NOI over the period
  equityGain: number; // Appreciation only
  totalProfit: number;
  totalROI: number; // Total Return on Investment over the holding period
  averageAnnualROI: number; // Simple average annual return
}

export default function ROICalculator() {
  console.log('ROICalculator component rendering (Cash Purchase)...');

  // --- Input State Variables ---
  // Acquisition
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [closingCostsPercent, setClosingCostsPercent] = useState(3); // % of Purchase Price
  const [initialRepairs, setInitialRepairs] = useState(10000); // Fixed Amount

  // Financing - REMOVED
  // const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  // const [interestRate, setInterestRate] = useState(5.5);
  // const [loanTerm, setLoanTerm] = useState(30);

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
  // const [downPayment, setDownPayment] = useState(
  //   (purchasePrice * downPaymentPercent) / 100
  // ); // REMOVED
  const [closingCosts, setClosingCosts] = useState(
    (purchasePrice * closingCostsPercent) / 100
  );

  // --- Results State ---
  const [results, setResults] = useState<InvestmentMetrics | null>(null);

  // --- Recalculate Derived State on Input Change ---
  useEffect(() => {
    // setDownPayment(Math.round((purchasePrice * downPaymentPercent) / 100)); // REMOVED
    setClosingCosts(Math.round((purchasePrice * closingCostsPercent) / 100));
  }, [purchasePrice, closingCostsPercent]); // Removed downPaymentPercent

  // --- Recalculate ROI on Any Input Change ---
  useEffect(() => {
    console.log('ROICalculator useEffect running (Cash Purchase)...');
    calculateInvestmentMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    purchasePrice,
    closingCostsPercent,
    initialRepairs,
    // downPaymentPercent, // REMOVED
    // interestRate, // REMOVED
    // loanTerm, // REMOVED
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
    // Derived state
    closingCosts, // Removed downPayment
  ]);

  // --- Calculation Logic (Cash Purchase) ---
  const calculateInvestmentMetrics = () => {
    // --- Initial Investment ---
    // const loanAmount = purchasePrice - downPayment; // REMOVED
    const initialCashInvested = purchasePrice + closingCosts + initialRepairs; // Updated calculation

    if (initialCashInvested <= 0 || purchasePrice <= 0) {
      setResults(null);
      return;
    }

    // --- Mortgage Calculation - REMOVED ---
    // const monthlyInterestRate = interestRate / 100 / 12;
    // const numberOfPayments = loanTerm * 12;
    // const monthlyMortgagePayment = ... ; // REMOVED
    const annualDebtService = 0; // No debt service for cash purchase

    // --- Year 1 Operations ---
    const grossScheduledIncome = monthlyRent * 12;
    const vacancyLoss = grossScheduledIncome * (vacancyRate / 100);
    const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

    const propertyTax = purchasePrice * (propertyTaxRate / 100);
    const insurance = purchasePrice * (insuranceRate / 100);
    const maintenance = purchasePrice * (maintenanceRate / 100);
    const managementFee = effectiveGrossIncome * (managementFeeRate / 100);
    const operatingExpenses =
      propertyTax + insurance + maintenance + managementFee;

    const netOperatingIncome = effectiveGrossIncome - operatingExpenses;
    const annualCashFlow = netOperatingIncome - annualDebtService; // Will be same as NOI

    // --- Year 1 Ratios ---
    const capRate =
      purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    // Cash-on-Cash is now NOI / Total Investment
    const cashOnCashReturn =
      initialCashInvested > 0
        ? (annualCashFlow / initialCashInvested) * 100
        : 0;

    // --- Projections over Holding Period ---
    let currentPropertyValue = purchasePrice;
    let currentMonthlyRent = monthlyRent;
    // let remainingLoanBalance = loanAmount; // REMOVED
    let totalCashFlow = 0;
    // let totalPrincipalPaid = 0; // REMOVED

    for (let year = 1; year <= holdingPeriod; year++) {
      // Calculate income and expenses for the current year
      const yearlyGrossScheduledIncome = currentMonthlyRent * 12;
      const yearlyVacancyLoss =
        yearlyGrossScheduledIncome * (vacancyRate / 100);
      const yearlyEffectiveGrossIncome =
        yearlyGrossScheduledIncome - yearlyVacancyLoss;

      const yearlyManagementFee =
        yearlyEffectiveGrossIncome * (managementFeeRate / 100);
      const baseOpExYear1 = propertyTax + insurance + maintenance;
      const inflatedBaseOpEx =
        baseOpExYear1 * Math.pow(1 + annualExpenseInflation / 100, year - 1);
      const yearlyOperatingExpenses = inflatedBaseOpEx + yearlyManagementFee;

      const yearlyNOI = yearlyEffectiveGrossIncome - yearlyOperatingExpenses;

      // Calculate Debt Service for the year - REMOVED
      // let yearlyInterestPaid = 0;
      // let yearlyPrincipalPaid = 0;
      // ... (loan balance calculations removed) ...
      const yearlyDebtService = 0; // No debt
      const yearlyCashFlow = yearlyNOI - yearlyDebtService; // yearlyCashFlow = yearlyNOI

      totalCashFlow += yearlyCashFlow;
      // totalPrincipalPaid += yearlyPrincipalPaid; // REMOVED

      // Update values for next year
      currentPropertyValue *= 1 + annualAppreciation / 100;
      currentMonthlyRent *= 1 + annualRentIncrease / 100;
    }

    // --- Sale Calculation ---
    const projectedSalePrice = currentPropertyValue;
    const sellingCosts = projectedSalePrice * (sellingCostsPercent / 100);
    const saleProceedsBeforeLoan = projectedSalePrice - sellingCosts;
    // Equity Gain = Appreciation only
    const equityGain = projectedSalePrice - purchasePrice; // Updated calculation
    // const saleProceedsAfterLoan = saleProceedsBeforeLoan - remainingLoanBalance; // REMOVED
    const saleProceedsAfterCosts = saleProceedsBeforeLoan; // No loan to pay off

    // --- Total Return Calculation ---
    // Total Profit = (Sale Proceeds After Costs - Initial Cash Invested) + Total Cash Flow
    const totalProfit =
      saleProceedsAfterCosts - initialCashInvested + totalCashFlow; // Updated calculation
    const totalROI =
      initialCashInvested > 0 ? (totalProfit / initialCashInvested) * 100 : 0;
    const averageAnnualROI = holdingPeriod > 0 ? totalROI / holdingPeriod : 0;

    setResults({
      initialCashInvested,
      // loanAmount, // REMOVED
      effectiveGrossIncome,
      operatingExpenses,
      netOperatingIncome,
      // annualDebtService, // REMOVED (or keep as 0 if needed elsewhere, but removed from interface)
      annualCashFlow,
      capRate,
      cashOnCashReturn,
      projectedSalePrice,
      totalCashFlow,
      equityGain, // Now only appreciation
      totalProfit,
      totalROI,
      averageAnnualROI,
      // simplifiedIRR, // REMOVED (was based on avg ROI)
    });
  };

  // --- Helper Functions ---
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-- €';
    return value.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-- %';
    return value.toLocaleString('nl-NL', {
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
          Real Estate Investment Calculator (Cash Purchase)
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
                  {formatPercent(closingCostsPercent / 100)})
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

          {/* Financing - REMOVED */}
          {/* <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700"> ... </div> */}

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
                  Rent)
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
                  Purchase Price)
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
                  Purchase Price)
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
                  Purchase Price)
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
                  Effective Income)
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
                  {formatPercent(annualAppreciation / 100)}
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
                  {formatPercent(annualRentIncrease / 100)}
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
                  {formatPercent(annualExpenseInflation / 100)}
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
                  Sale Price)
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
                Investment Analysis Results (Cash Purchase)
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
                      Total Cash Invested
                      <span className="ml-1.5">
                        <InfoModal
                          title="Total Cash Invested"
                          content="The total amount of cash required to purchase the property, including the purchase price, closing costs, and initial repairs/renovations."
                        />
                      </span>
                    </h4>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(results.initialCashInvested)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      (Purchase Price + Closing Costs + Repairs)
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
                              content="The property's annual income after deducting operating expenses (like taxes, insurance, maintenance, management fees). For a cash purchase, this is also the annual cash flow before taxes."
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(results.netOperatingIncome)}
                        </p>
                      </div>
                      <div>
                        {/* Can optionally rename "Annual Cash Flow" to "NOI" here too if desired */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Annual Cash Flow (NOI)
                          <span className="ml-1">
                            <InfoModal
                              title="Annual Cash Flow (NOI)"
                              content="The amount of cash generated by the property annually after paying all operating expenses. For a cash purchase, this equals the Net Operating Income (NOI)."
                            />
                          </span>
                        </p>
                        <p
                          className={`text-md font-semibold ${
                            results.annualCashFlow >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400' // Should always be >= 0 if NOI is
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
                              content="A measure of the property's unleveraged rate of return. Calculated as Net Operating Income (NOI) divided by the Purchase Price."
                            />
                          </span>
                        </p>
                        <p className="text-md font-semibold text-slate-900 dark:text-white">
                          {formatPercent(results.capRate / 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          Cash-on-Cash Return
                          <span className="ml-1">
                            <InfoModal
                              title="Cash-on-Cash Return (CoC)"
                              content="Measures the annual return on the actual cash invested. Calculated as Annual Cash Flow (NOI) divided by the Total Cash Invested (Purchase Price + Closing Costs + Repairs)."
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
                          {formatPercent(results.cashOnCashReturn / 100)}
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
                          Total Cash Flow (NOI)
                          <span className="ml-1">
                            <InfoModal
                              title="Total Cash Flow (NOI)"
                              content={`The sum of all annual Net Operating Income generated over the ${holdingPeriod}-year holding period.`}
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
                          Equity Gain (Appreciation)
                          <span className="ml-1">
                            <InfoModal
                              title="Equity Gain (Appreciation)"
                              content={`The increase in equity over the holding period resulting only from property appreciation (Projected Sale Price - Purchase Price).`}
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
                              content={`The overall profit from the investment after selling the property. Calculated as (Sale Proceeds After Costs - Total Cash Invested) + Total Cash Flow (NOI) over the holding period.`}
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
                              content="The total profit generated over the holding period expressed as a percentage of the total cash invested. Calculated as (Total Profit / Total Cash Invested)."
                            />
                          </span>
                        </p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {formatPercent(results.totalROI / 100)}
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
                          {formatPercent(results.averageAnnualROI / 100)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      (Total ROI = Total Profit / Total Cash Invested)
                    </p>
                  </div>

                  {/* Placeholder for Action Button */}
                  {/* <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4"> ... </Button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
