'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';

export default function AtlasDashboard() {
  // Mock platform stats
  const platformStats = {
    activeInvestors: 42,
    totalInvested: 3500000,
    projectedRevenue: 525000,
    operationalCosts: 175000,
    availableProperties: 3,
  };

  // Mock properties data
  const properties = [
    {
      id: 'prop-001',
      title: 'Luxury Apartment Complex',
      location: 'New York, NY',
      totalValue: 5000000,
      fundingPercentage: 65,
      status: 'Funding',
    },
    {
      id: 'prop-002',
      title: 'Commercial Office Building',
      location: 'Chicago, IL',
      totalValue: 12000000,
      fundingPercentage: 42,
      status: 'Funding',
    },
    {
      id: 'prop-003',
      title: 'Suburban Housing Development',
      location: 'Austin, TX',
      totalValue: 8500000,
      fundingPercentage: 78,
      status: 'Funding',
    },
    {
      id: 'prop-004',
      title: 'Retail Shopping Center',
      location: 'Los Angeles, CA',
      totalValue: 15000000,
      fundingPercentage: 100,
      status: 'Funded',
    },
    {
      id: 'prop-005',
      title: 'Vacation Rental Portfolio',
      location: 'Miami, FL',
      totalValue: 7500000,
      fundingPercentage: 35,
      status: 'Funding',
    },
  ];

  // Mock monthly data for charts
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Mock investor growth data
  const investorGrowthData = [12, 15, 18, 22, 25, 28, 30, 33, 36, 39, 41, 42];
  
  // Mock investment data
  const investmentData = [
    500000, 850000, 1200000, 1500000, 1800000, 2100000, 
    2400000, 2700000, 3000000, 3200000, 3350000, 3500000
  ];
  
  // Mock revenue data
  const revenueData = [
    30000, 51000, 72000, 90000, 108000, 126000, 
    144000, 162000, 180000, 192000, 201000, 210000
  ];
  
  // Mock operational costs data
  const costsData = [
    15000, 25500, 36000, 45000, 54000, 63000, 
    72000, 81000, 90000, 96000, 100500, 105000
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold">Atlas Platform Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Investors</CardTitle>
              <CardDescription>Total registered investors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{platformStats.activeInvestors}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Invested</CardTitle>
              <CardDescription>Capital deployed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${platformStats.totalInvested.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Projected Revenue</CardTitle>
              <CardDescription>Annual revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${platformStats.projectedRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Available Properties</CardTitle>
              <CardDescription>Open for investment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{platformStats.availableProperties}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart 
                  title="Monthly Growth Metrics"
                  labels={monthlyLabels}
                  datasets={[
                    {
                      label: 'Investors',
                      data: investorGrowthData,
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                      label: 'Investments ($10k)',
                      data: investmentData.map(val => val / 10000),
                      borderColor: 'rgb(54, 162, 235)',
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart 
                  title="Revenue vs Costs"
                  labels={monthlyLabels}
                  datasets={[
                    {
                      label: 'Revenue',
                      data: revenueData,
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                      label: 'Operational Costs',
                      data: costsData,
                      borderColor: 'rgb(255, 99, 132)',
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="properties">Property Status</TabsTrigger>
            <TabsTrigger value="allocation">Investment Allocation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Funding Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Funding Status</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>${property.totalValue.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            property.status === 'Funded' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {property.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  property.fundingPercentage === 100 ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${property.fundingPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{property.fundingPercentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="allocation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment by Property Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart 
                      title="Capital Allocation"
                      labels={['Residential', 'Commercial', 'Retail', 'Vacation']}
                      datasets={[
                        {
                          label: 'Allocation',
                          data: [1750000, 1200000, 300000, 250000],
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                          ],
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Investment by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart 
                      title="Geographic Distribution"
                      labels={['New York', 'Chicago', 'Austin', 'Los Angeles', 'Miami']}
                      datasets={[
                        {
                          label: 'Investment ($)',
                          data: [850000, 750000, 1100000, 500000, 300000],
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
