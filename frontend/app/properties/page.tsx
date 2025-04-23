'use client';
import { Property } from '../../types/property';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PropertyRecommendations from '@/components/ai/PropertyRecommendations';
import { propertyRecommendations } from '@/data/mock/ai-features';
import { properties } from '@/data/mock/properties';

// Mock data for charts
const mockYearLabels = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
];

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  // Calculate projected revenue based on investment amount and property details
  const calculateProjectedRevenue = (
    property: Property | undefined,
    amount: number
  ): number[] => {
    if (!property) return mockYearLabels.map(() => 0);

    const ownershipPercentage = amount / property.totalValue;
    const monthlyIncome = property.monthlyRent * ownershipPercentage;
    const annualIncome = monthlyIncome * 12;

    return mockYearLabels.map((_, index) => {
      // Compound growth with appreciation
      return Math.round(
        annualIncome * Math.pow(1 + property.annualAppreciation / 100, index)
      );
    });
  };

  // Calculate ROI over time
  const calculateROI = (
    property: Property | undefined,
    amount: number
  ): number[] => {
    if (!property) return mockYearLabels.map(() => 0);

    const projectedRevenue = calculateProjectedRevenue(property, amount);

    return mockYearLabels.map((_, index) => {
      const totalRevenue = projectedRevenue
        .slice(0, index + 1)
        .reduce((sum, val) => sum + val, 0);
      return Math.round((totalRevenue / amount) * 100);
    });
  };

  // Handle property selection
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  // Handle investment amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestmentAmount(Number(e.target.value) || 0);
  };

  // Handle investment submission
  const handleInvest = () => {
    if (!selectedProperty) {
      alert('Please select a property before investing.');
      return;
    }
    alert(
      `Investment of $${investmentAmount.toLocaleString()} in ${
        selectedProperty.title
      } submitted!`
    );
    // In a real app, this would call an API to create the investment
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Explore Properties</h1>
      
      {/* Atlas Recommendations */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <PropertyRecommendations recommendations={propertyRecommendations} />
      </div>
      
      {/* Available Properties */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Available Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.filter(p => p.status === 'Available').slice(0, 2).map(property => (
            <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 h-48 md:h-auto bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-6xl font-bold text-gray-400 dark:text-gray-500">
                    {property.name.charAt(0)}
                  </span>
                </div>
                <div className="w-full md:w-3/5 p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{property.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{property.location}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(property.price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(property.price * property.yield / 100 / 12)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Annual Appreciation</span>
                      <p className="font-medium">{property.appreciation}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">AI Score</span>
                      <p className="font-medium">{property.score}/100</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-4" 
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>65% Funded</span>
                      <span>{new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(property.price * 0.65)} of {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(property.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Investment Simulator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Investment Simulator</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Select a property to see projected returns</p>
        
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>Please select a property from the list</p>
        </div>
      </div>
    </div>
  );
}
