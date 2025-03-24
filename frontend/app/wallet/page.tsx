'use client';

import React, { useState, useEffect } from 'react';
import { Token } from '@/types/blockchain';
import { useBlockchain } from '@/lib/BlockchainContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PieChart from '@/components/charts/PieChart';
import { AlertCircle } from 'lucide-react';

export default function WalletPage() {
  const { account, isConnected, connectWallet, getUserTokens, error } =
    useBlockchain();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMetaMaskWarning, setShowMetaMaskWarning] = useState(true);

  // Load user tokens when account changes
  useEffect(() => {
    const loadTokens = async () => {
      if (isConnected && account) {
        setLoading(true);
        try {
          const userTokens = await getUserTokens(account);
          setTokens(userTokens);
        } catch (err) {
          console.error('Error loading tokens:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTokens();
  }, [account, isConnected, getUserTokens]);

  // Function to generate a random color for 3D token visualization
  const getRandomColor = () => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-pink-500 to-purple-600',
      'bg-gradient-to-br from-indigo-500 to-blue-600',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          {/* Removed Atlas Wallet heading and Connect Wallet button */}
        </div>

        {/* Only keep non-MetaMask errors */}
        {error && !error.includes('MetaMask is not installed') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-500 mb-6">
              Connect your MetaMask wallet to view your digital property deeds
            </p>
            <Button
              onClick={connectWallet}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md"
            >
              Connect MetaMask
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p>Loading your tokens...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Assets</CardTitle>
                  <CardDescription>Value of all digital deeds</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    $
                    {tokens
                      .reduce((sum, token) => sum + token.investedAmount, 0)
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
                    {tokens
                      .reduce((sum, token) => sum + token.monthlyEarnings, 0)
                      .toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Digital Deeds</CardTitle>
                    <CardDescription>
                      Blockchain-secured property ownership
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Ownership</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Monthly Earnings</TableHead>
                          <TableHead>Token ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokens.map((token) => (
                          <TableRow key={token.tokenId}>
                            <TableCell className="font-medium">
                              {token.propertyTitle}
                            </TableCell>
                            <TableCell>{token.location}</TableCell>
                            <TableCell>{token.percentage}%</TableCell>
                            <TableCell>
                              ${token.investedAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${token.monthlyEarnings.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">
                                {token.tokenId.substring(0, 8)}...
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <PieChart
                        title="Investment Distribution"
                        labels={tokens.map((token) => token.propertyTitle)}
                        datasets={[
                          {
                            label: 'Allocation',
                            data: tokens.map((token) => token.investedAmount),
                            backgroundColor: [
                              'rgba(54, 162, 235, 0.6)',
                              'rgba(255, 99, 132, 0.6)',
                            ],
                          },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Digital Property Deeds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tokens.map((token) => (
                <div key={token.tokenId} className="relative group">
                  {/* 3D Token Visualization */}
                  <div className="perspective-1000">
                    <div className="relative transform-style-3d transition-transform duration-700 group-hover:rotate-y-180 w-full h-64">
                      {/* Front of the token */}
                      <div
                        className={`absolute inset-0 ${getRandomColor()} rounded-xl shadow-xl p-6 backface-hidden`}
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {token.propertyTitle}
                            </h3>
                            <p className="text-white/80">{token.location}</p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-white/80">Ownership:</span>
                              <span className="text-white font-bold">
                                {token.percentage}%
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-white/80">Value:</span>
                              <span className="text-white font-bold">
                                ${token.investedAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/80">
                                Monthly Income:
                              </span>
                              <span className="text-white font-bold">
                                ${token.monthlyEarnings.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <span className="text-xs font-mono bg-white/20 p-1 rounded text-white">
                              Token ID: {token.tokenId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Back of the token */}
                      <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 backface-hidden rotate-y-180">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              Blockchain Details
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Secured on Ethereum
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Token Address
                              </p>
                              <p className="text-sm font-mono break-all">
                                {token.tokenAddress}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Token ID
                              </p>
                              <p className="text-sm font-mono">
                                {token.tokenId}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Owner
                              </p>
                              <p className="text-sm font-mono">
                                {account
                                  ? `${account.substring(
                                      0,
                                      6
                                    )}...${account.substring(
                                      account.length - 4
                                    )}`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Standard
                              </p>
                              <p className="text-sm">ERC-721 (NFT)</p>
                            </div>
                          </div>

                          <div className="text-center">
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 p-1 rounded">
                              Hover to flip back
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
