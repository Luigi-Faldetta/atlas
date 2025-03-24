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

  // Mock properties data
  const properties = [
    {
      id: 'prop-001',
      title: 'Luxury Apartment Complex',
      location: 'New York, NY',
      totalValue: 5000000,
      monthlyRent: 25000,
      annualAppreciation: 5.2,
      riskScore: 25,
      aiScore: 85,
      imageUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'prop-002',
      title: 'Commercial Office Building',
      location: 'Chicago, IL',
      totalValue: 12000000,
      monthlyRent: 80000,
      annualAppreciation: 3.8,
      riskScore: 30,
      aiScore: 78,
      imageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'prop-003',
      title: 'Suburban Housing Development',
      location: 'Austin, TX',
      totalValue: 8500000,
      monthlyRent: 42500,
      annualAppreciation: 6.5,
      riskScore: 20,
      aiScore: 92,
      imageUrl:
        'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
  ];

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Available Properties</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="space-y-4">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className={`cursor-pointer transition-all ${
                    selectedProperty?.id === property.id
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                  onClick={() => handlePropertySelect(property)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 h-48 md:h-auto">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      <h3 className="text-xl font-bold">{property.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {property.location}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Value</p>
                          <p className="font-semibold">
                            ${property.totalValue.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Rent</p>
                          <p className="font-semibold">
                            ${property.monthlyRent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Annual Appreciation
                          </p>
                          <p className="font-semibold">
                            {property.annualAppreciation}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">AI Score</p>
                          <p className="font-semibold">
                            {property.aiScore}/100
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(65, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">65% Funded</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            {selectedProperty ? (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Simulator</CardTitle>
                  <CardDescription>
                    See projected returns for {selectedProperty.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Investment Amount ($)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={investmentAmount}
                        onChange={handleAmountChange}
                        min={1000}
                        max={selectedProperty.totalValue}
                        step={1000}
                      />
                      <Button onClick={handleInvest}>Invest</Button>
                    </div>
                    <p className="text-sm mt-2">
                      Ownership:{' '}
                      {(
                        (investmentAmount / selectedProperty.totalValue) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Projected Revenue</h4>
                      <div className="h-60">
                        <LineChart
                          title="10-Year Revenue Projection"
                          labels={mockYearLabels}
                          datasets={[
                            {
                              label: 'Annual Revenue ($)',
                              data: calculateProjectedRevenue(
                                selectedProperty,
                                investmentAmount
                              ),
                              borderColor: 'rgb(75, 192, 192)',
                              backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Return on Investment</h4>
                      <div className="h-60">
                        <BarChart
                          title="ROI Over Time (%)"
                          labels={mockYearLabels}
                          datasets={[
                            {
                              label: 'ROI (%)',
                              data: calculateROI(
                                selectedProperty,
                                investmentAmount
                              ),
                              backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Simulator</CardTitle>
                  <CardDescription>
                    Select a property to see projected returns
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                  <p className="text-gray-500">
                    Please select a property from the list
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
