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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';

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

export default function Dashboard() {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Invested</CardTitle>
              <CardDescription>Across all properties</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                $
                {userInvestments
                  .reduce((sum, inv) => sum + inv.amount, 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Monthly Income</CardTitle>
              <CardDescription>Passive rental income</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                $
                {Math.round(
                  userInvestments.reduce((sum, inv) => {
                    const property = properties.find(
                      (p) => p.id === inv.propertyId
                    );
                    if (!property) return sum;
                    return sum + property.monthlyRent * (inv.percentage / 100);
                  }, 0)
                ).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Properties</CardTitle>
              <CardDescription>Number of investments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userInvestments.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <PieChart
                  title="Investment Distribution"
                  labels={userInvestments.map((inv) => inv.property.title)}
                  datasets={[
                    {
                      label: 'Allocation',
                      data: userInvestments.map((inv) => inv.amount),
                      backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                      ],
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Projected Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart
                  title="10-Year Projection"
                  labels={mockYearLabels}
                  datasets={[
                    {
                      label: 'Annual Revenue ($)',
                      data: userInvestments.reduce((total, inv) => {
                        const property = properties.find(
                          (p) => p.id === inv.propertyId
                        );
                        const revenue = calculateProjectedRevenue(
                          property,
                          inv.amount
                        );
                        return total.map((val, i) => val + revenue[i]);
                      }, Array(mockYearLabels.length).fill(0)),
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>AI Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvestments.map((investment) => {
                  const property = properties.find(
                    (p) => p.id === investment.propertyId
                  );
                  if (!property) {
                    return (
                      <TableRow key={investment.id}>
                        <TableCell colSpan={6} className="text-red-500">
                          Property not found
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">
                        {property.title}
                      </TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>
                        ${investment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{investment.percentage}%</TableCell>
                      <TableCell>
                        $
                        {Math.round(
                          property.monthlyRent * (investment.percentage / 100)
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            property.aiScore >= 80
                              ? 'bg-green-100 text-green-800'
                              : property.aiScore >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {property.aiScore}/100
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
