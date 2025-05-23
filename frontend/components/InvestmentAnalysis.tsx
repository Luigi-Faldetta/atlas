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
  ShieldCheckIcon,
  BoltIcon,
  TagIcon,
  TruckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import {
  SunIcon,
  FireIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { // Assuming these icons might be useful for new metrics
  UsersIcon as CommunityIcon, // For Median Household Income, Age Distribution, Social Diversity
  BuildingStorefrontIcon, // For Cultural Venues, Local Markets
  MapPinIcon, // For Foot Traffic, Proximity to City
  ChatBubbleLeftRightIcon, // For Sentiment Score
  SparklesIcon, // For Aesthetic Score
  HeartIcon as PetIcon, // For Pet-Friendliness
  BuildingOffice2Icon as OfficeIcon, // For Short-term rental activity (e.g. Airbnb)
  BanknotesIcon, // For Assessed Property Value, Utility Costs
  ClipboardDocumentListIcon, // For Number of Listings
  WrenchScrewdriverIcon, // For Utility Costs
  MagnifyingGlassIcon, // For general search/discovery if needed
  InformationCircleIcon, // For generic info display
  MapIcon, // For Proximity to City
  BuildingLibraryIcon as CulturalIcon, // For Cultural Venues
  UserCircleIcon, // For Age Distribution, Social Diversity
  CurrencyDollarIcon, // For Median Household Income
  ArchiveBoxIcon, // For Number of Listings
  BeakerIcon, // For Social Diversity Index
  FaceSmileIcon, // For Sentiment Score
  PaintBrushIcon, // For Aesthetic Score
  HomeModernIcon, // For Pet-Friendliness, Parking Space
  FireIcon as HeatIcon, // Re-using FireIcon as HeatIcon for Urban Heat Island, if needed specifically
  PresentationChartLineIcon, // For Market Trends
} from '@heroicons/react/24/outline';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import InfoModal from './InfoModal';
import { useEffect, useState, useRef, useLayoutEffect } from 'react'; // Added useRef AND useLayoutEffect
import mcpApiClient from '../lib/api/mcpClient';
import { useAirQualityData, useLocalNews } from '../lib/api/useMcpData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

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
  
  // New metrics - optional with defaults
  buildingType?: string;
  energyLabel?: string;
  lotSize?: number; // in m²
  distanceToSupermarket?: number; // in meters
  publicTransitAccess?: boolean;
  noisePollutionIndex?: number; // 0-100
  airQualityIndex?: number; // 0-100
  crimeRate?: number; // per 1000 residents
  vacancyRate?: number; // percentage
  propertyTaxRate?: number; // percentage
  communityFees?: number; // monthly
  floodRisk?: number; // percentage risk

  // Newly added metrics from METRICS.md
  // Additional Environmental Metrics
  distanceToGreenSpaces?: number; // in meters
  averageSunExposure?: number; // hours per day
  urbanHeatIslandEffect?: number; // degrees Celsius difference
  // Additional Financial Metrics
  dscr?: number; // Debt Service Coverage Ratio (e.g., 1.25)
  cashOnCashReturn?: number; // percentage (e.g., 8.2)
  grm?: number; // Gross Rent Multiplier (e.g., 14.5)
  irr?: number; // Internal Rate of Return (e.g., 12.3)
  equityBuildup?: number; // currency (e.g., 7500)
  // Market & Trend Metrics
  daysOnMarket?: number; // days (e.g., 45)
  priceHistorySummary?: string; // e.g., "Property previously sold for €280,000 in 2018."
  neighborhoodPriceTrendSummary?: string; // e.g., "Area prices +5.5% year-over-year."
  rentalDemandForecast?: 'High' | 'Medium' | 'Low' | string; // e.g., "High"

  // --- Metrics from "Additional Proposed Metrics" ---
  // Socio-Economic & Demographic Metrics
  medianHouseholdIncome?: number; // currency
  ageDistributionSummary?: string; // e.g., "Predominantly 25-45 year olds"
  socialDiversityIndex?: number; // 0-100 score

  // Local Amenities & Lifestyle Metrics
  culturalVenuesNearby?: number; // count
  footTrafficLevel?: 'High' | 'Medium' | 'Low' | string;
  eventsPerMonthArea?: number; // count
  sentimentScoreLocalReviews?: number; // 0-100 or 1-5 stars
  publicArtAestheticScore?: number; // 0-100 score
  petFriendlinessScore?: number; // 0-100 score
  localMarketsNearby?: number; // count
  parkingSpace?: 'Available' | 'Limited' | 'None' | string; // More descriptive
  proximityToLargeCity?: { name: string; distanceKm: number; travelTimeMin: number };

  // Market Activity & Property Specifics (New)
  shortTermRentalActivity?: 'High' | 'Medium' | 'Low' | string;
  assessedPropertyValue?: number; // currency
  listingsNearby?: number; // count
  estimatedUtilityCosts?: number; // currency per month
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
  fiveYearProjectedValue = 380050,
  
  // New metrics with default values
  buildingType = "Apartment",
  energyLabel = "B",
  lotSize = 0, // Not applicable for apartments typically
  distanceToSupermarket = 350, // meters
  publicTransitAccess = true,
  noisePollutionIndex = 45, // 0-100 scale (lower is better)
  airQualityIndex = 65, // 0-100 scale (higher is better)
  crimeRate = 12.5, // per 1000 residents
  vacancyRate = 3.2, // percentage
  propertyTaxRate = 0.7, // percentage
  communityFees = 120, // monthly in euros
  floodRisk = 4, // percentage risk

  // Defaults for newly added metrics
  distanceToGreenSpaces = 450, // meters
  averageSunExposure = 7.1, // hours
  urbanHeatIslandEffect = 1.8, // °C
  dscr = 1.3, // ratio
  cashOnCashReturn = 7.5, // %
  grm = 15.2, // multiplier
  irr = 11.5, // %
  equityBuildup = 6800, // €
  daysOnMarket = 52, // days
  priceHistorySummary = "Last sold for €310,000 (2019). Listed at €295,000 (2017).",
  neighborhoodPriceTrendSummary = "Area prices +5.5% year-over-year.",
  rentalDemandForecast = "High",

  // Defaults for "Additional Proposed Metrics"
  // Socio-Economic & Demographic Metrics
  medianHouseholdIncome = 55000,
  ageDistributionSummary = "Majority: 30-45 (35%), 20-29 (25%), 46-60 (20%)",
  socialDiversityIndex = 72, // 0-100

  // Local Amenities & Lifestyle Metrics
  culturalVenuesNearby = 4, // e.g., theatres, museums
  footTrafficLevel = "Medium",
  eventsPerMonthArea = 12,
  sentimentScoreLocalReviews = 85, // e.g. out of 100, or 4.3 if 1-5 stars
  publicArtAestheticScore = 78, // 0-100
  petFriendlinessScore = 90, // 0-100, based on parks, services
  localMarketsNearby = 2, // e.g., farmer's markets
  parkingSpace = "Limited street parking",
  proximityToLargeCity = { name: "Amsterdam", distanceKm: 60, travelTimeMin: 45 },

  // Market Activity & Property Specifics (New)
  shortTermRentalActivity = "Medium",
  assessedPropertyValue = 330000,
  listingsNearby = 25,
  estimatedUtilityCosts = 180, // monthly
}: InvestmentAnalysisProps) => {
  console.log('%%% RUNNING InvestmentAnalysis Component - VERSION CHECK %%%');

  // GSAP Refs for animation targets
  const mainContainerRef = useRef<HTMLDivElement>(null); // Ref for GSAP context
  const propertyDetailsCardRef = useRef<HTMLDivElement>(null);
  const financialAnalysisCardRef = useRef<HTMLDivElement>(null);
  const nearbyAmenitiesSectionRef = useRef<HTMLDivElement>(null);
  const locationAssessmentCardRef = useRef<HTMLDivElement>(null);
  const suitabilityScoreCardRef = useRef<HTMLDivElement>(null);
  const airQualityCardRef = useRef<HTMLDivElement>(null);
  const localNewsCardRef = useRef<HTMLDivElement>(null);
  const propertySpecsCardRef = useRef<HTMLDivElement>(null);
  const environmentalSafetyCardRef = useRef<HTMLDivElement>(null);
  const marketTrendsCardRef = useRef<HTMLDivElement>(null);
  const socioEconomicCardRef = useRef<HTMLDivElement>(null);
  const lifestyleMetricsCardRef = useRef<HTMLDivElement>(null);
  const marketActivityCardRef = useRef<HTMLDivElement>(null);
  const projectedValueChartBarsRef = useRef<HTMLDivElement>(null); // Ref for the chart bars container

  // Refs for specific numerical values and progress bars
  const investmentScoreDisplayRef = useRef<HTMLSpanElement>(null);
  const yearlyYieldDisplayRef = useRef<HTMLParagraphElement>(null);
  const roi5YearsDisplayRef = useRef<HTMLParagraphElement>(null);
  const investmentScoreBarRef = useRef<HTMLDivElement>(null);

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

  // --- GSAP Animations ---
  useLayoutEffect(() => {
    const hoverListenerCleanups: Array<() => void> = [];
    const blurOverlayRef = mainContainerRef; // Using mainContainerRef for the overlay for now, can be a dedicated ref.
                                          // Ideally, a dedicated ref for a specific overlay div.

    // NEW: Function for focus hover effect with background blur
    const applyHoverFocusEffect = (element: HTMLElement, pageOverlay: HTMLElement | null) => {
      if (!element) return undefined;
      console.log('[GSAP Hover] Applying focus effect to:', element.className.split(' ').slice(0,3).join('.') , element);

      // Create or get a reference to the blur overlay
      let overlayEl: HTMLDivElement | null = document.getElementById('page-blur-overlay-gsap') as HTMLDivElement;
      if (!overlayEl && pageOverlay?.ownerDocument) {
          overlayEl = pageOverlay.ownerDocument.createElement('div');
          overlayEl.id = 'page-blur-overlay-gsap';
          overlayEl.className = "fixed inset-0 bg-black/10 backdrop-blur-sm pointer-events-none opacity-0 z-[49]"; // z-index just below cards
          pageOverlay.ownerDocument.body.appendChild(overlayEl); // Append to body to ensure it's behind everything
      }


      const onMouseEnter = () => {
        console.log('[GSAP Hover] MouseEnter on:', element.className.split(' ').slice(0,3).join('.'), element);
        gsap.to(element, {
          scale: 1.03,
          duration: 0.15, // Faster duration
          ease: "power1.out", // Snappier ease
          zIndex: 50 // Bring card above potential overlay
        });
        if (overlayEl) {
          gsap.to(overlayEl, {
            autoAlpha: 1,
            duration: 0.15, // Faster duration
            ease: "power1.out" // Snappier ease
          });
        }
      };

      const onMouseLeave = () => {
        console.log('[GSAP Hover] MouseLeave from:', element.className.split(' ').slice(0,3).join('.'), element);
        gsap.to(element, {
          scale: 1,
          duration: 0.15, // Faster duration
          ease: "power1.out", // Snappier ease
          zIndex: 'auto'
        });
        if (overlayEl) {
          gsap.to(overlayEl, {
            autoAlpha: 0,
            duration: 0.15, // Faster duration
            ease: "power1.out" // Snappier ease
          });
        }
      };

      element.addEventListener('mouseenter', onMouseEnter);
      element.addEventListener('mouseleave', onMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', onMouseEnter);
        element.removeEventListener('mouseleave', onMouseLeave);
        gsap.set(element, { clearProps: "scale,zIndex" });
        // Important: Clean up the dynamically created overlay if this component unmounts
        // However, if multiple cards are using it, only remove if it's the last one.
        // For simplicity here, we won't remove it, but in a real app, manage its lifecycle.
        // if (overlayEl && overlayEl.parentElement) {
        //   overlayEl.parentElement.removeChild(overlayEl);
        // }
        // Or just ensure it's hidden:
         if (overlayEl) {
            gsap.set(overlayEl, { autoAlpha: 0 });
         }
      };
    };


    const ctx = gsap.context(() => {
      const animateCard = (element: HTMLDivElement | null, delay: number = 0) => {
        if (!element) return;
        gsap.fromTo(element,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            delay,
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              toggleActions: "play none none none",
              once: true,
            }
          }
        );
      };

      const cardsToAnimate = [
        { ref: propertyDetailsCardRef, delay: 0 },
        { ref: financialAnalysisCardRef, delay: 0.1 },
        { ref: nearbyAmenitiesSectionRef, delay: 0 },
        { ref: locationAssessmentCardRef, delay: 0.1 },
        { ref: suitabilityScoreCardRef, delay: 0.15 },
        { ref: airQualityCardRef, delay: 0 },
        { ref: localNewsCardRef, delay: 0.1 },
        { ref: propertySpecsCardRef, delay: 0 },
        { ref: environmentalSafetyCardRef, delay: 0.1 },
        { ref: marketTrendsCardRef, delay: 0 },
        { ref: socioEconomicCardRef, delay: 0 },
        { ref: lifestyleMetricsCardRef, delay: 0.1 },
        { ref: marketActivityCardRef, delay: 0.15 },
      ];
      cardsToAnimate.forEach(card => animateCard(card.ref.current, card.delay));

      // Define refs for cards to exclude from hover effect
      const excludedHoverRefs = [
        nearbyAmenitiesSectionRef.current,
        marketActivityCardRef.current,
        lifestyleMetricsCardRef.current,
        socioEconomicCardRef.current,
        marketTrendsCardRef.current
      ].filter(ref => ref !== null); // Filter out any null refs just in case

      // Apply NEW hover focus effects to cards, excluding specified ones
      cardsToAnimate.forEach(cardConfig => {
        if (cardConfig.ref.current && !excludedHoverRefs.includes(cardConfig.ref.current)) {
          const listenerCleanup = applyHoverFocusEffect(cardConfig.ref.current, mainContainerRef.current);
          if (listenerCleanup) {
            hoverListenerCleanups.push(listenerCleanup);
          }
        }
      });

      // Helper function for number counting
      const animateCountUp = (element: HTMLElement | null, endValue: number, formattingOptions: { isCurrency?: boolean, isPercentage?: boolean, decimals?: number } = {}) => {
        if (!element || endValue === null || endValue === undefined) return;
        const { isCurrency = false, isPercentage = false, decimals = 0 } = formattingOptions;
        
        let startValue = 0;
        // Attempt to parse starting value from element to avoid jump, if it's a simple number
        const initialText = element.innerText.replace(/[^0-9.,-]+/g, '').replace(',', '.');
        if (!isNaN(parseFloat(initialText))) {
          startValue = parseFloat(initialText);
        }

        gsap.fromTo(element,
          { innerText: startValue }, // Start from current text or 0
          {
            innerText: endValue,
            duration: 1.5,
            ease: "power1.out",
            snap: { innerText: isPercentage || decimals > 0 ? Math.pow(10, -decimals) : 1 }, // Snap to appropriate decimal or whole number
            formatter: (value: number) => {
              const val = parseFloat(value.toFixed(decimals));
              if (isCurrency) return formatCurrency(val, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
              if (isPercentage) return formatPercentage(val * 100); // formatPercentage expects value like 5.5 for 5.5%
              return val.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
            },
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            }
          }
        );
      };

      // Animate key numerical values
      if (investmentScoreDisplayRef.current) {
        animateCountUp(investmentScoreDisplayRef.current, investmentScore, { decimals: 0 });
      }
      if (yearlyYieldDisplayRef.current && yearlyYield !== null) {
        // GSAP animates the raw number; formatter handles the display (formatPercentage expects 5.5 for 5.5%)
        animateCountUp(yearlyYieldDisplayRef.current, yearlyYield, { isPercentage: true, decimals: 1 });
      }
      if (roi5YearsDisplayRef.current && roi5Years !== null) {
        animateCountUp(roi5YearsDisplayRef.current, roi5Years, { isPercentage: true, decimals: 1 });
      }

      // Animate key progress bar
      if (investmentScoreBarRef.current && investmentScore) {
        gsap.to(investmentScoreBarRef.current, {
          width: `${investmentScore}%`,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: investmentScoreBarRef.current.parentElement, // Trigger based on parent container
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          }
        });
      }

      // Animate Projected Property Value Chart Bars
      if (projectedValueChartBarsRef.current) {
        gsap.fromTo(projectedValueChartBarsRef.current.querySelectorAll(".chart-bar-visual"),
          { scaleY: 0, transformOrigin: "bottom" },
          {
            scaleY: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: projectedValueChartBarsRef.current,
              start: "top 85%", // Start animation when top of chart is 85% in view
              toggleActions: "play none none none",
              once: true,
            }
          }
        );
      }

    }, mainContainerRef); // Scope GSAP context to the main container

    return () => {
      ctx.revert(); // Cleanup GSAP animations and ScrollTriggers
      hoverListenerCleanups.forEach(cleanup => cleanup()); // Cleanup hover event listeners
    };
  }, [investmentScore, yearlyYield, roi5Years]); // Add dependencies that, if changed, should re-run animations
  // --- End GSAP Animations ---

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
    <div ref={mainContainerRef} className="space-y-6">
      {/* 
        It's better to have a dedicated overlay div here if not creating it dynamically.
        Example:
        <div 
          id="page-blur-overlay-static" 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm pointer-events-none opacity-0 z-[49]"
        ></div> 
        And then get this element by ID or ref in the applyHoverFocusEffect function.
        The dynamic creation in applyHoverFocusEffect is a fallback.
      */}

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
                <div className="w-32 h-32 relative" title={`Overall AI Investment Score: ${investmentScore}/100. Click the question mark for a detailed breakdown.`}>
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
                        title={`Rental Yield contributes ${scoreBreakdown.rentalYield} points (out of 40 max) to the AI score. Based on ${yearlyYield || 4.2}%.`}
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
                        title={`Cap Rate contributes ${scoreBreakdown.capRate} points (out of 30 max) to the AI score.`}
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
                        title={`Area Growth contributes ${scoreBreakdown.growthScore} points (out of 15 max) to the AI score. Based on ${yearlyAppreciationPercentage || 3.5}% projected appreciation.`}
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
                        title={`Cash Flow contributes ${scoreBreakdown.cashFlow} points (out of 15 max) to the AI score.`}
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
        <div ref={propertyDetailsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Property Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Key information about the property</p>
          </div>
          
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{address}</h3>
            
            {/* Property Image */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
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
        <div ref={financialAnalysisCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Financial Analysis</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rental yield, appreciation, and ROI projections</p>
          </div>
          
          <div className="p-4">
            {/* Financial Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Rental Yield</p>
                <p ref={yearlyYieldDisplayRef} className="text-2xl font-bold text-blue-800 dark:text-blue-200" title={`Projected annual return from rental income: ${formatPercentage(yearlyYield || 4.2)}`}>
                  {formatPercentage(yearlyYield || 4.2)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">Annual ROI</p>
                <p ref={roi5YearsDisplayRef} className="text-2xl font-bold text-green-800 dark:text-green-200" title={`Projected 5-year average annual Return On Investment: ${formatPercentage(roi5Years || 7.95)}`}>
                  {formatPercentage(roi5Years || 7.95)}
                </p>
              </div>
            </div>
            
            {/* Projected Property Value Chart */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Projected Property Value (5 Years)</h4>
              <div className="h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                {/* Chart visualization */}
                <div ref={projectedValueChartBarsRef} className="flex h-full items-end justify-between">
                  {projectedValues.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-10 bg-emerald-400 dark:bg-emerald-500 rounded-t-sm chart-bar-visual" // Added chart-bar-visual class
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
              {/* Additional Financial Metrics Start Here */}
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <ScaleIcon className="h-4 w-4 mr-2" />
                  Debt Service Coverage Ratio (DSCR)
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{dscr?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                  Cash on Cash Return
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{formatPercentage(cashOnCashReturn)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Gross Rent Multiplier (GRM)
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{grm?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                  Internal Rate of Return (IRR)
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{formatPercentage(irr)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Equity Build-up (Year 1)
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(equityBuildup)}</span>
              </div>
              {/* Additional Financial Metrics End Here */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Nearby Amenities Section */}
      <div ref={nearbyAmenitiesSectionRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
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
        <div ref={locationAssessmentCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
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
        <div ref={suitabilityScoreCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
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
                  <div 
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                    style={{ width: `${suitabilityScores.families}%` }}
                    title={`Suitability for families: ${suitabilityScores.families}/100`}
                  ></div>
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
                  <div 
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                    style={{ width: `${suitabilityScores.couples}%` }}
                    title={`Suitability for couples: ${suitabilityScores.couples}/100`}
                  ></div>
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
                  <div 
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                    style={{ width: `${suitabilityScores.singles}%` }}
                    title={`Suitability for singles: ${suitabilityScores.singles}/100`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 dark:text-white">AI Property Score</h3>
                <div className="flex items-center">
                  <div className="flex items-baseline">
                    <span ref={investmentScoreDisplayRef} className="text-2xl font-bold text-green-600 dark:text-green-400">{investmentScore}</span>
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
                <div ref={investmentScoreBarRef} className="bg-green-500 dark:bg-green-400 h-3 rounded-full" style={{ width: '0%' /* Initial width for animation */ }}></div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">Excellent property with outstanding features and location.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pollution Data and Local News - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pollution Data */}
        <div ref={airQualityCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Air Quality Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Air quality information for this location</p>
          </div>
          
          <div className="p-6">
            {/* Use the propertyIdentifier derived from address */}
            {(() => {
              // Generate a property identifier from the address for API calls
              const propertyIdentifier = encodeURIComponent(address);
              const { data: airQualityData, isLoading, error, refetch } = useAirQualityData(propertyIdentifier);
              
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Loading air quality data...</span>
                  </div>
                );
              }
              
              if (error) {
                return (
                  <div className="py-4">
                    <div className="flex items-center text-amber-600 dark:text-amber-400 mb-3">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <span>Unable to load air quality data</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      There was an error loading the air quality information for this location.
                    </p>
                    <button 
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                );
              }
              
              if (!airQualityData) {
                return (
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <WifiIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      No air quality data is available for this location yet.
                    </p>
                    <button 
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      Refresh Data
                    </button>
                  </div>
                );
              }
              
              // If we have data, show it
              return (
                <div>
                  {/* AQI Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Air Quality Index</p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">{airQualityData.aqi}</p>
                      <p className={`text-sm font-medium ${
                        airQualityData.aqi <= 50 ? 'text-green-600 dark:text-green-400' :
                        airQualityData.aqi <= 100 ? 'text-yellow-600 dark:text-yellow-400' :
                        airQualityData.aqi <= 150 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {airQualityData.category}
                      </p>
                    </div>
                    <div className="w-24 h-24 relative">
                      <CircularProgressbar
                        value={Math.min(airQualityData.aqi, 300)}
                        maxValue={300}
                        text={`${airQualityData.aqi}`}
                        styles={buildStyles({
                          textSize: '1.8rem',
                          pathColor: airQualityData.aqi <= 50 ? '#10B981' : 
                                    airQualityData.aqi <= 100 ? '#F59E0B' : 
                                    airQualityData.aqi <= 150 ? '#F97316' : 
                                    '#EF4444',
                          textColor: 'gray',
                          trailColor: 'rgba(229, 231, 235, 0.3)',
                        })}
                      />
                    </div>
                  </div>
                  
                  {/* Pollutants */}
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">Pollutants</h4>
                  <div className="space-y-3 mb-4">
                    {airQualityData.pollutants.map((pollutant, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {pollutant.name}
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {pollutant.concentration} {pollutant.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full"
                            style={{ 
                              width: `${Math.min((pollutant.concentration / 100) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span>Location: {airQualityData.location}</span>
                    <span>Last updated: {airQualityData.lastUpdated}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Local News */}
        <div ref={localNewsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Local News</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recent news articles about this location</p>
          </div>
          
          <div className="p-6">
            {/* Use the propertyIdentifier derived from address */}
            {(() => {
              // Generate a property identifier from the address for API calls
              const propertyIdentifier = encodeURIComponent(address);
              // Rename data to newsArticlesArray for clarity, assuming it's NewsArticle[] on success
              const { data: newsArticlesArray, isLoading, error: hookError, refetch } = useLocalNews(propertyIdentifier);
              
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Loading local news...</span>
                  </div>
                );
              }
              
              if (hookError) {
                const errorMessage = (typeof hookError === 'object' && hookError !== null && 'message' in hookError) 
                                     ? String((hookError as any).message) 
                                     : typeof hookError === 'string' ? hookError : 'Failed to load news articles.';
                const isServiceDisabledError = errorMessage.includes('News service is not enabled');
                const displayMessage = isServiceDisabledError 
                  ? 'News Service Not Available' 
                  : 'Unable to load local news';
                const detailedMessage = isServiceDisabledError
                  ? 'The news service is currently not configured. Please check back later.'
                  : errorMessage;

                return (
                  <div className="py-4">
                    <div className="flex items-center text-amber-600 dark:text-amber-400 mb-3">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <span>{displayMessage}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {detailedMessage}
                    </p>
                    <button 
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                );
              }
              
              // If no hookError and not loading, check if newsArticlesArray is a non-empty array
              if (Array.isArray(newsArticlesArray) && newsArticlesArray.length > 0) {
                return (
                  <div className="space-y-4">
                    {newsArticlesArray.map((article, index) => (
                      <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                        {article.imageUrl && (
                          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-medium text-gray-800 dark:text-white mb-1 line-clamp-2">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                            {article.title}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{article.source}</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => window.open(`https://news.google.com/search?q=${encodeURIComponent(address)}`, '_blank')}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors mt-4"
                    >
                      View More News
                    </button>
                  </div>
                );
              }
              
              // Fallback: Not loading, no hookError, but not a non-empty array of articles
              return (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No news articles are available for this location yet.
                  </p>
                  <button 
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                  >
                    Refresh News
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* New section: Additional Property Metrics - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Specifications */}
        <div ref={propertySpecsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Property Specifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed information about property characteristics</p>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <HomeIcon className="h-4 w-4 mr-2" />
                Building Type
              </span>
              <span className="font-medium text-gray-800 dark:text-white">{buildingType}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <BoltIcon className="h-4 w-4 mr-2" />
                Energy Label
              </span>
              <span className="font-medium">
                <span className={`px-3 py-1 rounded-full ${
                  energyLabel === 'A' || energyLabel === 'A+' || energyLabel === 'A++' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  energyLabel === 'B' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  energyLabel === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  energyLabel === 'D' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                  energyLabel === 'E' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                  energyLabel === 'F' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-500'
                }`}>
                  {energyLabel}
                </span>
              </span>
            </div>
            
            {lotSize > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Lot Size
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{lotSize} m²</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                Distance to Supermarket
              </span>
              <span className="font-medium text-gray-800 dark:text-white">{distanceToSupermarket} meters</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <TruckIcon className="h-4 w-4 mr-2" />
                Public Transit Access
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {publicTransitAccess ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Available within 300m
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Not available nearby</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <ReceiptPercentIcon className="h-4 w-4 mr-2" />
                Property Tax Rate
              </span>
              <span className="font-medium text-gray-800 dark:text-white">{propertyTaxRate}%</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                Community Fees
              </span>
              <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(communityFees)} / month</span>
            </div>
          </div>
        </div>
        
        {/* Environmental & Safety Metrics */}
        <div ref={environmentalSafetyCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Environmental & Safety Metrics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Environmental factors and safety considerations</p>
          </div>
          
          <div className="p-6">
            {/* Noise Pollution */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                  Noise Pollution Index
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {noisePollutionIndex}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${
                  noisePollutionIndex <= 30 ? 'bg-green-500 dark:bg-green-400' :
                  noisePollutionIndex <= 60 ? 'bg-yellow-500 dark:bg-yellow-400' :
                  'bg-red-500 dark:bg-red-400'
                }`} style={{ width: `${noisePollutionIndex}%` }} title={`Noise Pollution Index: ${noisePollutionIndex}/100. Lower is better.`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lower is better - {
                  noisePollutionIndex <= 30 ? 'Very quiet area' :
                  noisePollutionIndex <= 50 ? 'Moderately quiet' :
                  noisePollutionIndex <= 70 ? 'Average noise levels' :
                  'High noise levels'
                }
              </p>
            </div>
            
            {/* Air Quality Index */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <WifiIcon className="h-4 w-4 mr-1" />
                  Air Quality Index
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {airQualityIndex}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${
                  airQualityIndex >= 70 ? 'bg-green-500 dark:bg-green-400' :
                  airQualityIndex >= 40 ? 'bg-yellow-500 dark:bg-yellow-400' :
                  'bg-red-500 dark:bg-red-400'
                }`} style={{ width: `${airQualityIndex}%` }} title={`Air Quality Index: ${airQualityIndex}/100. Higher is better.`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Higher is better - {
                  airQualityIndex >= 80 ? 'Excellent air quality' :
                  airQualityIndex >= 60 ? 'Good air quality' :
                  airQualityIndex >= 40 ? 'Moderate air quality' :
                  'Poor air quality'
                }
              </p>
            </div>
            
            {/* Crime Rate */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Crime Rate
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {crimeRate} per 1000 residents
                </span>
              </div>
              <div className="relative pt-6">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Low</span>
                  <span>Area Average: 15</span>
                  <span>High</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div className={`absolute top-0 h-5 w-0.5 bg-black dark:bg-white`} 
                       style={{ left: `${Math.min((crimeRate / 30) * 100, 100)}%` }}>
                  </div>
                  <div className="absolute -top-1 text-xs font-bold" 
                       style={{ left: `${Math.min((crimeRate / 30) * 100, 95)}%` }}>
                    ▼
                  </div>
                  <div className="flex">
                    <div className="bg-green-500 dark:bg-green-400 h-2 w-1/3 rounded-l-full"></div>
                    <div className="bg-yellow-500 dark:bg-yellow-400 h-2 w-1/3"></div>
                    <div className="bg-red-500 dark:bg-red-400 h-2 w-1/3 rounded-r-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                The area has a {
                  crimeRate <= 10 ? 'low' :
                  crimeRate <= 20 ? 'moderate' :
                  'high'
                } crime rate compared to the city average.
              </p>
            </div>
            
            {/* Flood Risk */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Flood Risk
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {floodRisk}% risk
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${
                  floodRisk <= 5 ? 'bg-green-500 dark:bg-green-400' :
                  floodRisk <= 15 ? 'bg-yellow-500 dark:bg-yellow-400' :
                  'bg-red-500 dark:bg-red-400'
                }`} style={{ width: `${Math.min(floodRisk * 5, 100)}%` }} title={`Flood Risk: ${floodRisk}%. Lower is better.`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {floodRisk <= 5 ? 'Minimal flood risk' :
                 floodRisk <= 15 ? 'Moderate flood risk - insurance recommended' :
                 'High flood risk area - special insurance required'}
              </p>
            </div>
            
            {/* Vacancy Rate */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  Area Vacancy Rate
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {vacancyRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${
                  vacancyRate <= 5 ? 'bg-green-500 dark:bg-green-400' :
                  vacancyRate <= 10 ? 'bg-yellow-500 dark:bg-yellow-400' :
                  'bg-red-500 dark:bg-red-400'
                }`} style={{ width: `${Math.min(vacancyRate * 5, 100)}%` }} title={`Area Vacancy Rate: ${vacancyRate}%. Lower is generally better for landlords.`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {vacancyRate <= 3 ? 'Very low vacancy rate - high demand area' :
                 vacancyRate <= 7 ? 'Average vacancy rate for the region' :
                 'Higher than average vacancy rate'}
              </p>
            </div>
            
            {/* Additional Environmental Metrics Start Here */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  Distance to Green Spaces
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {distanceToGreenSpaces} m
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Proximity to parks and natural areas.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <SunIcon className="h-4 w-4 mr-1" />
                  Average Sun Exposure
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {averageSunExposure} hrs/day
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Estimated daily sunlight.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <FireIcon className="h-4 w-4 mr-1" /> {/* Or ExclamationTriangleIcon if FireIcon is not suitable */}
                  Urban Heat Island Effect
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  +{urbanHeatIslandEffect} °C
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Temperature difference compared to rural surroundings.
              </p>
            </div>
            {/* Additional Environmental Metrics End Here */}
          </div>
        </div>
      </div>

      {/* New Section: Market & Trend Metrics */}
      <div ref={marketTrendsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Market & Trend Metrics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Insights into market conditions and trends for this area</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Days on Market (Average)
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{daysOnMarket} days</span>
          </div>
          
          <div className="py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Price History Summary
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{priceHistorySummary}</p>
          </div>
          
          <div className="py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Neighborhood Price Trends
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{neighborhoodPriceTrendSummary}</p>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <UserGroupIcon className="h-4 w-4 mr-2" /> {/* Using UserGroupIcon as UsersIcon might not be standard */}
              Rental Demand Forecast
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ 
              rentalDemandForecast === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              rentalDemandForecast === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              rentalDemandForecast === 'Low' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
            }`}>
              {rentalDemandForecast}
            </span>
          </div>
        </div>
      </div>
      {/* End New Section: Market & Trend Metrics */}

      {/* --- New Section: Socio-Economic & Demographic Metrics --- */}
      <div ref={socioEconomicCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Socio-Economic & Demographic Metrics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Understanding the local community and economic environment</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Median Household Income
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(medianHouseholdIncome, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <UserCircleIcon className="h-4 w-4 mr-2" />
              Age Distribution
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{ageDistributionSummary}</p>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <BeakerIcon className="h-4 w-4 mr-2" />
              Social Diversity Index
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{socialDiversityIndex}/100</span>
          </div>
        </div>
      </div>

      {/* --- New Section: Local Amenities & Lifestyle Metrics --- */}
      <div ref={lifestyleMetricsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Local Amenities & Lifestyle Metrics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quality of life and local attractions</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <CulturalIcon className="h-4 w-4 mr-2" />
              Cultural Venues Nearby
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{culturalVenuesNearby}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2" />
              Foot Traffic Level
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{footTrafficLevel}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Events per Month in Area
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{eventsPerMonthArea}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <FaceSmileIcon className="h-4 w-4 mr-2" />
              Sentiment Score (Local Reviews)
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{sentimentScoreLocalReviews}/100</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <PaintBrushIcon className="h-4 w-4 mr-2" />
              Public Art & Aesthetic Score
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{publicArtAestheticScore}/100</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <PetIcon className="h-4 w-4 mr-2" />
              Pet-Friendliness Score
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{petFriendlinessScore}/100</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
              Local Markets Nearby
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{localMarketsNearby}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <HomeModernIcon className="h-4 w-4 mr-2" />
              Parking Space
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{parkingSpace}</span>
          </div>
          <div className="py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <MapIcon className="h-4 w-4 mr-2" />
              Proximity to {proximityToLargeCity?.name || "Major City"}
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {proximityToLargeCity?.distanceKm} km, approx. {proximityToLargeCity?.travelTimeMin} mins drive
            </p>
          </div>
        </div>
      </div>

      {/* --- New Section: Market Activity & Property Specifics (New) --- */}
      <div ref={marketActivityCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Market Activity & Property Specifics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deeper dive into market dynamics and property details</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <OfficeIcon className="h-4 w-4 mr-2" />
              Short-term Rental Activity
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{shortTermRentalActivity}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <BanknotesIcon className="h-4 w-4 mr-2" />
              Assessed Property Value
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(assessedPropertyValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              Number of Listings Nearby
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{listingsNearby}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
              Estimated Utility Costs
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(estimatedUtilityCosts, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvestmentAnalysis;
