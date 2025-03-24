'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';

export default function AnalyticsPage() {
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
    },
  ];

  // Mock user investments
  const userInvestments = [
    {
      id: 'inv-001',
      propertyId: 'prop-001',
      amount: 250000,
      percentage: 5,
      property: properties[0],
    },
    {
      id: 'inv-002',
      propertyId: 'prop-003',
      amount: 425000,
      percentage: 5,
      property: properties[2],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Portfolio Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart
                  title="Historical & Projected Returns"
                  labels={[
                    '2023',
                    '2024',
                    '2025',
                    '2026',
                    '2027',
                    '2028',
                    '2029',
                    '2030',
                  ]}
                  datasets={[
                    {
                      label: 'Your Portfolio',
                      data: [0, 5.2, 11.5, 18.3, 26.1, 34.5, 43.8, 54.2],
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                      label: 'S&P 500',
                      data: [0, 7.8, 15.9, 24.5, 33.6, 43.2, 53.4, 64.1],
                      borderColor: 'rgb(54, 162, 235)',
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    },
                    {
                      label: 'REITs',
                      data: [0, 4.1, 8.4, 13.0, 17.8, 22.9, 28.3, 34.0],
                      borderColor: 'rgb(255, 99, 132)',
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChart
                  title="Risk vs. Return Analysis"
                  labels={userInvestments.map((inv) => {
                    const property = properties.find(
                      (p) => p.id === inv.propertyId
                    );
                    return property?.title ?? 'Unknown Property';
                  })}
                  datasets={[
                    {
                      label: 'Risk Score (Lower is Better)',
                      data: userInvestments.map((inv) => {
                        const property = properties.find(
                          (p) => p.id === inv.propertyId
                        );
                        return property?.riskScore ?? 0;
                      }),
                      backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    },
                    {
                      label: 'AI Score (Higher is Better)',
                      data: userInvestments.map((inv) => {
                        const property = properties.find(
                          (p) => p.id === inv.propertyId
                        );
                        return property?.aiScore ?? 0;
                      }),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
