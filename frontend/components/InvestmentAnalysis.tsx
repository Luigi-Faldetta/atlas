import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ScaleIcon,
  DocumentTextIcon,
  BookmarkIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  FlagIcon,
  PaperClipIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import InfoModal from './InfoModal';
import { useEffect, useState, useRef } from 'react'; // Added useRef

type InvestmentAnalysisProps = {
  investmentScore: number;
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null;
  expectedMonthlyIncome: number | null;
  yearlyAppreciationPercentage: number | null;
  yearlyAppreciationValue: number | null;
  strengths: string[];
  weaknesses: string[];
  price: string; // Raw price string from props (e.g., "1295000 €" or "€ 440.000 k.k.")
  address: string;
  pricePerSqm: number | null;
  // Score breakdown categories (optional, might come from AI or use defaults)
  riskScore?: number;
  yieldScore?: number;
  growthScore?: number;
  locationScore?: number;
  conditionScore?: number;
  // Property characteristics (optional)
  characteristics?: string[];
  
  // New props for redesign - optional with defaults in component
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  yearBuilt?: number;
  description?: string;
  features?: string[];
  
  // Nearby amenities data
  nearbyAmenities?: {
    schools: number;
    groceryStores: number;
    gyms: number;
    restaurants: number;
    hospitals: number;
    parks: number;
  };
  
  // Suitability scores
  suitabilityScores?: {
    families: number;
    couples: number;
    singles: number;
  };
  
  // Location assessment
  locationPros?: string[];
  locationCons?: string[];
  
  // Additional financial data
  annualRentalIncome?: number;
  annualExpenses?: number;
  netOperatingIncome?: number;
  breakEvenPoint?: number;
  fiveYearProjectedValue?: number;
};

const getScoreColor = (score: number) => {
  if (score >= 70) return '#10B981'; // green
  if (score >= 50) return '#F59E0B'; // yellow/amber
  return '#EF4444'; // red
};

// --- UPDATED formatCurrency ---
const formatCurrency = (
  value: number | null,
  options?: Intl.NumberFormatOptions // Note: style and currency options here will be ignored
) => {
  if (value === null || value === undefined) return 'N/A';

  // 1. Format the number using 'decimal' style and 'nl-NL' locale
  const numberFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
  const formattedNumber = numberFormatter.format(value);

  // 2. Manually prepend the Euro sign with a space
  const finalOutput = `€ ${formattedNumber}`;
  // console.log(`formatCurrency Input: ${value}, Output: ${finalOutput}`); // Optional debug
  return finalOutput;
};

// --- UPDATED formatPercentage ---
const formatPercentage = (value: number | null) => {
  if (value === null || value === undefined) return 'N/A';

  const isInteger = Math.abs(value % 1) < 0.001;
  const minDigits = isInteger ? 0 : 1;
  const maxDigits = isInteger ? 0 : 1;

  const percentFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  const decimalValue = value / 100;
  const finalOutput = percentFormatter.format(decimalValue);
  // console.log(`formatPercentage Input: ${value}, Output: ${finalOutput}`); // Optional debug
  return finalOutput;
};

const getCharacteristicColor = (characteristic: string) => {
  if (characteristic.includes('Growth') || characteristic.includes('Friendly'))
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (characteristic.includes('Demand'))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  if (characteristic.includes('Limited') || characteristic.includes('Risk'))
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
};

const InvestmentAnalysis = ({
  investmentScore,
  roi5Years,
  roi10Years,
  yearlyYield,
  monthlyRentalIncome,
  expectedMonthlyIncome,
  yearlyAppreciationPercentage,
  yearlyAppreciationValue,
  strengths,
  weaknesses,
  price, // Raw price string from props
  address,
  pricePerSqm,
  riskScore = 6.1,
  yieldScore = 4.5,
  growthScore = 8.0,
  locationScore = 8.6,
  conditionScore = 9.1,
  characteristics = [],
  
  // New props with defaults (mock data)
  bedrooms = 2,
  bathrooms = 1,
  size = 85,
  yearBuilt = 2010,
  description = "Beautiful and bright apartment located in a prime area. Recently renovated with high-quality materials. Open-concept living room and kitchen. Close to public transportation, shops, and restaurants.",
  features = ["Elevator", "Air conditioning", "Parking", "Built-in wardrobes", "Security system", "Balcony"],
  
  nearbyAmenities = {
    schools: 7,
    groceryStores: 5,
    gyms: 3,
    restaurants: 13,
    hospitals: 2,
    parks: 6
  },
  
  suitabilityScores = {
    families: 100,
    couples: 100,
    singles: 100
  },
  
  locationPros = [
    "7 educational institutions nearby",
    "Good access to 5 grocery stores",
    "15 dining options in the area",
    "Air conditioning available",
    "Established neighborhood"
  ],
  
  locationCons = [
    "Hospital congestion may cause noise",
    "Larger space may require more maintenance",
    "Tourist congestion during peak seasons",
    "Shared elevator maintenance costs"
  ],
  
  annualRentalIncome = 19200, // Default if not calculated from monthly
  annualExpenses = 5760,
  netOperatingIncome = 13440, // Default calculated from above defaults
  breakEvenPoint = 23.8,
  fiveYearProjectedValue = 380050
}: InvestmentAnalysisProps) => {
  console.log('%%% RUNNING InvestmentAnalysis Component - VERSION CHECK %%%');

  // State for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackUrl, setFeedbackUrl] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for AI score explanation modal
  const [showScoreModal, setShowScoreModal] = useState(false);

  // --- useEffect Debug Logs ---
  useEffect(() => {
    console.log('--- Running useEffect Debug Logs ---');
    try {
      // Test manual currency formatting
      const testValue = 12345.67;
      const numberFormatter = new Intl.NumberFormat('nl-NL', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const formattedNumber = numberFormatter.format(testValue);
      const manualCurrency = `€ ${formattedNumber}`;
      console.log(
        `DEBUG (useEffect): Manual 'nl-NL' currency format for ${testValue}: ${manualCurrency}`
      );

      // Test percent formatting (integer)
      const testPercentValueInt = 22;
      const testPercentDecimalInt = testPercentValueInt / 100;
      const percentFormatterInt = new Intl.NumberFormat('nl-NL', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      console.log(
        `DEBUG (useEffect): 'nl-NL' percent format for ${testPercentValueInt}% (integer): ${percentFormatterInt.format(
          testPercentDecimalInt
        )}`
      );

      // Test percent formatting (float)
      const testPercentValueFloat = 5.6;
      const testPercentDecimalFloat = testPercentValueFloat / 100;
      const percentFormatterFloat = new Intl.NumberFormat('nl-NL', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      console.log(
        `DEBUG (useEffect): 'nl-NL' percent format for ${testPercentValueFloat}% (float): ${percentFormatterFloat.format(
          testPercentDecimalFloat
        )}`
      );
    } catch (e) {
      console.error('DEBUG (useEffect): Error testing Intl.NumberFormat:', e);
    }
    console.log('--- Finished useEffect Debug Logs ---');
  }, []);
  // --- END DEBUG LOG LOCALE ---

  // --- Helper to parse number from price string ---
  const parsePriceString = (priceStr: string): number | null => {
    if (!priceStr) return null;
    // Remove currency symbols, thousands separators (dots/commas), extra text like 'k.k.'
    const cleanedStr = priceStr
      .replace(/€/g, '')
      .replace(/\./g, '') // Remove dots (used as thousands separators in some formats)
      .replace(/,/g, '.') // Replace comma with dot for decimal conversion (if any)
      .replace(/k\.k\./gi, '') // Remove 'k.k.' case-insensitive
      .trim();
    const match = cleanedStr.match(/^[0-9]+/); // Get leading numbers
    if (match && match[0]) {
      const num = parseFloat(match[0]);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  // --- End Helper ---

  // Parse the price prop to get a number
  const numericPrice = parsePriceString(price);

  // Format the numeric price for display in the header (no decimals)
  const formattedHeaderPrice =
    numericPrice !== null
      ? formatCurrency(numericPrice, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : price; // Fallback to raw price string if parsing fails

  const scoreColor = getScoreColor(investmentScore);
  const weightedAverage = (investmentScore / 10).toFixed(1);
  const weightedAverageNumber = parseFloat(weightedAverage);
  const displayWeightedAverage = weightedAverage.replace('.', ',');
  
  // Calculate annual rental income from monthly if provided
  const calculatedAnnualRentalIncome = monthlyRentalIncome 
    ? monthlyRentalIncome * 12 
    : annualRentalIncome;
    
  // Calculate net operating income if not provided
  const calculatedNetOperatingIncome = 
    calculatedAnnualRentalIncome - annualExpenses;
  
  // Generate projected property value data for chart
  const [projectedValues] = useState(() => {
    const basePrice = numericPrice || 320000; // Fallback to example price
    const yearlyAppreciation = yearlyAppreciationPercentage || 3.5;
    const appreciationFactor = 1 + (yearlyAppreciation / 100);
    
    return [
      basePrice,
      Math.round(basePrice * Math.pow(appreciationFactor, 1)),
      Math.round(basePrice * Math.pow(appreciationFactor, 2)),
      Math.round(basePrice * Math.pow(appreciationFactor, 3)),
      Math.round(basePrice * Math.pow(appreciationFactor, 4)),
      Math.round(basePrice * Math.pow(appreciationFactor, 5)),
    ];
  });

  // Approximate score breakdown into components (for visualization purposes)
  const scoreBreakdown = {
    rentalYield: Math.min(Math.round((yearlyYield || 4.2) * 8), 40), // 40% weight
    capRate: Math.min(Math.round(((calculatedNetOperatingIncome / (numericPrice || 350000)) * 100) * 6), 30), // 30% weight
    growthScore: Math.min(Math.round((yearlyAppreciationPercentage || 3.5) * 5), 15), // 15% weight
    cashFlow: Math.min(Math.round(((calculatedNetOperatingIncome - 12000) / (numericPrice ? numericPrice * 0.3 : 105000)) * 100), 15), // 15% weight
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFeedbackFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your server
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setSubmitSuccess(true);
      setFeedbackUrl('');
      setFeedbackComment('');
      setFeedbackFile(null);
      
      // Close modal after showing success message
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowFeedbackModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons - Top Right Floating */}
      <div className="flex justify-end gap-3 mb-4">
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {}}
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Download Report
        </button>
        <button 
          className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {}}
        >
          <BookmarkIcon className="h-5 w-5 mr-2" />
          Save to Watchlist
        </button>
        {/* Add Feedback Button */}
        <button 
          className="flex items-center px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          onClick={() => setShowFeedbackModal(true)}
        >
          <FlagIcon className="h-5 w-5 mr-2" />
          Feedback
        </button>
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Report an Issue</h2>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thank You for Your Feedback!</h3>
                  <p className="text-gray-500 dark:text-gray-400">We'll review your report and get back to you if needed.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="property-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Property URL
                    </label>
                    <input
                      id="property-url"
                      type="url"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com/property/123"
                      value={feedbackUrl}
                      onChange={(e) => setFeedbackUrl(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Attach Screenshot or PDF
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <PaperClipIcon className="h-full w-full text-gray-300 dark:text-gray-600" />
                      </span>
                      <button
                        type="button"
                        className="ml-5 bg-white dark:bg-slate-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    {feedbackFile && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        File selected: {feedbackFile.name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Comments
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Please describe the issue you're experiencing..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Score Explanation Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-amber-500" />
                How the AI Investment Score Works
              </h2>
              <button 
                onClick={() => setShowScoreModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-32 h-32 relative">
                  <CircularProgressbar
                    value={investmentScore}
                    text={`${investmentScore}`}
                    styles={buildStyles({
                      textSize: '1.8rem',
                      pathColor: scoreColor,
                      textColor: scoreColor,
                      trailColor: 'rgba(229, 231, 235, 0.5)',
                    })}
                  />
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-800">
                    <span className="text-xs font-medium text-gray-500">/ 100</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">
                Your Investment Score: {investmentScore}/100
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                This property has a {
                  investmentScore >= 80 ? 'excellent' : 
                  investmentScore >= 70 ? 'very good' : 
                  investmentScore >= 60 ? 'good' : 
                  investmentScore >= 50 ? 'average' : 
                  'below average'
                } investment potential.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  How We Calculate This Score
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Our AI investment score is calculated using a weighted combination of financial metrics and location factors:
                </p>
                
                {/* Score breakdown visualization */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Rental Yield (40%)
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {scoreBreakdown.rentalYield} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${(scoreBreakdown.rentalYield / 40) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on annual rental income relative to property price ({yearlyYield || 4.2}%)
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Cap Rate (30%)
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {scoreBreakdown.capRate} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 dark:bg-green-400 h-2 rounded-full" 
                        style={{ width: `${(scoreBreakdown.capRate / 30) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on net operating income relative to property value
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Area Growth (15%)
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {scoreBreakdown.growthScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full" 
                        style={{ width: `${(scoreBreakdown.growthScore / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on projected annual property appreciation ({yearlyAppreciationPercentage || 3.5}%)
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Cash Flow (15%)
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {scoreBreakdown.cashFlow} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full" 
                        style={{ width: `${(scoreBreakdown.cashFlow / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on cash-on-cash return (assuming 30% down payment)
                    </p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                What This Score Means For You
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Strengths
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {strengths.slice(0, 3).map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Considerations
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {weaknesses.slice(0, 3).map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">
                  <strong>Note:</strong> The AI investment score is a comparative tool to help evaluate 
                  investment potential across properties. While comprehensive, it should be considered 
                  alongside professional advice and personal investment goals.
                </p>
                <p>
                  Scores above 70 indicate potentially strong investment opportunities, 
                  scores between 50-70 suggest average opportunities that may require additional 
                  considerations, and scores below 50 indicate higher risk investments.
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
              <button
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Property Details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Property Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Key information about the property</p>
          </div>
          
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{address}</h3>
            
            {/* Property Image */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
              <img 
                src="https://placehold.co/800x400/e6e6e6/999999?text=Property+Image" 
                alt="Property" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Property Info Table */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Price</span>
                <span className="font-medium text-gray-800 dark:text-white">{formattedHeaderPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Location</span>
                <span className="font-medium text-gray-800 dark:text-white">{address.split(',').slice(-2).join(', ') || 'Barcelona, Spain'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Size</span>
                <span className="font-medium text-gray-800 dark:text-white">{size} m²</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Bedrooms</span>
                <span className="font-medium text-gray-800 dark:text-white">{bedrooms}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Bathrooms</span>
                <span className="font-medium text-gray-800 dark:text-white">{bathrooms}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                <span className="font-medium text-gray-800 dark:text-white">{yearBuilt}</span>
              </div>
            </div>
            
            {/* Description */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
            </div>
            
            {/* Features */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Features</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right Column - Financial Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Financial Analysis</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rental yield, appreciation, and ROI projections</p>
          </div>
          
          <div className="p-4">
            {/* Financial Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Rental Yield</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {formatPercentage(yearlyYield || 4.2)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">Annual ROI</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatPercentage(roi5Years || 7.95)}
                </p>
              </div>
            </div>
            
            {/* Projected Property Value Chart */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Projected Property Value (5 Years)</h4>
              <div className="h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                {/* Chart visualization */}
                <div className="flex h-full items-end justify-between">
                  {projectedValues.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-10 bg-emerald-400 dark:bg-emerald-500 rounded-t-sm" 
                        style={{ height: `${(value / projectedValues[5]) * 80}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Year {index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Financial Details */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                <span className="font-medium text-gray-800 dark:text-white">{formattedHeaderPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Estimated Monthly Rent</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {monthlyRentalIncome
                    ? formatCurrency(monthlyRentalIncome)
                    : '€ 1.600'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Annual Rental Income</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(calculatedAnnualRentalIncome, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Annual Expenses</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(annualExpenses, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Net Operating Income</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(calculatedNetOperatingIncome, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Estimated Annual Appreciation</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatPercentage(yearlyAppreciationPercentage || 3.5)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">5-Year Projected Value</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(projectedValues[5], {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Break-even Point</span>
                <span className="font-medium text-gray-800 dark:text-white">{breakEvenPoint} years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nearby Amenities Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Nearby Amenities</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Essential services and facilities in this area</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.schools}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Schools</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.groceryStores}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Grocery Stores</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.gyms}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gyms</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.restaurants}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restaurants</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <HomeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.hospitals}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hospitals</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <HomeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{nearbyAmenities.parks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Parks</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">This data represents the approximate number of facilities within a 1km radius.</p>
        </div>
      </div>
      
      {/* Location and Suitability - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Assessment */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Location Assessment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Advantages and disadvantages of this location</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center text-green-600 dark:text-green-400 font-medium mb-3">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  {locationPros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 text-sm">+</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="flex items-center text-red-600 dark:text-red-400 font-medium mb-3">
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                  Cons
                </h3>
                <ul className="space-y-2">
                  {locationCons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 text-sm">-</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Suitability & Score */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Suitability & Score</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Property rating and demographic fit</p>
          </div>
          
          <div className="p-6">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Suitable for:</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    Families
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{suitabilityScores.families}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full" style={{ width: `${suitabilityScores.families}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    Couples
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{suitabilityScores.couples}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full" style={{ width: `${suitabilityScores.couples}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    Singles
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{suitabilityScores.singles}/100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full" style={{ width: `${suitabilityScores.singles}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 dark:text-white">AI Property Score</h3>
                <div className="flex items-center">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{investmentScore}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/100</span>
                  </div>
                  <button
                    onClick={() => setShowScoreModal(true)} 
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    title="Explain score calculation"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-green-500 dark:bg-green-400 h-3 rounded-full" style={{ width: `${investmentScore}%` }}></div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">Excellent property with outstanding features and location.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pollution Data and Local News - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pollution Data */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Pollution Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Noise and air quality information for this location</p>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Enter your Pollution API key to fetch environmental data</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Pollution API key"
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Save & Fetch
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              You can get API keys from services like AirVisual, OpenAQ or similar pollution monitoring APIs.
            </p>
          </div>
        </div>
        
        {/* Local News */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Local News</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recent news articles about this location</p>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Enter your News API key to fetch local news articles</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter News API key"
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Save & Fetch
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              You can get a free API key from NewsAPI.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAnalysis;
