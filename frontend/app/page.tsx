'use client';
//test comment
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Keep if used elsewhere or by layout
import { BetaSignupModal } from '@/components/BetaSignupModal'; // Keep existing import
import PropertyInvestmentDashboard from '@/components/PropertyInvestmentDashboard'; // Add new import

// Keep any other imports your layout might implicitly rely on from the original page.tsx

export default function Home() {
  // The main application layout (likely layout.tsx) will provide the overall structure including the sidebar.
  // This component just returns the specific content for the landing page route.
  return (
    // Remove the <main> tag from the new code, start directly with the sections
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900"></div>
        <div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]"
          style={{ backgroundSize: '20px 20px' }}
        ></div>

        {/* Animated background elements */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-2/3 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '7s', animationDelay: '2s' }}
        ></div>

        {/* Content container */}
        <div className="relative max-w-6xl mx-auto z-10 px-6 md:px-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-blue-900/50 backdrop-blur-md border border-blue-700/50 text-amber-400">
            <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-sm font-medium">
              Reimagining real estate investment
            </span>
          </div>

          {/* Main heading with animated gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-6">
            Start owning real estate —{' '}
            <span className="text-amber-400">without breaking the bank</span>
          </h1>

          {/* Subheading with enhanced styling */}
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Atlas makes it possible to invest in properties starting small,{' '}
            <span className="font-semibold text-white">
              while keeping full control over what you own
            </span>
            .
          </p>

          {/* CTA section with dual buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="relative group flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative block h-full">
                <BetaSignupModal />
              </div>
            </div>

            {/* Calculate investment button - scrolls to investment dashboard */}
            <div className="relative group flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <a
                href="#investment-calculator"
                className="relative flex items-center justify-center px-8 py-6 text-lg bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transform transition duration-300 group-hover:scale-105 group-hover:shadow-xl w-full h-full box-border leading-none"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('investment-calculator')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    });
                }}
              >
                Calculate your investment
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              How Atlas Works
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mt-6 mb-8 rounded-full"></div>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Property investing made simple in just three easy steps.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-2">
              No mortgage. No broker. No property management hassles.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-amber-500/20 rounded-3xl blur-lg opacity-70"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Step 1, 2, 3 cards */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                    <div className="flex items-center mb-4">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
                        1
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Browse properties
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Explore available properties with complete transparency on
                      price, location, and income potential.
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                    <div className="flex items-center mb-4">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
                        2
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Invest your amount
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Start with as little as €100 and purchase your share of a
                      property.
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                    <div className="flex items-center mb-4">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
                        3
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Collect & grow
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Receive your share of rental income monthly and watch your
                      investment grow in value.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-slate-700 dark:text-slate-300">
                  Simple and straightforward.{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    No hidden fees
                  </span>
                  , no surprises.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Real Estate Analyst Section */}
          <div className="mt-10">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 rounded-2xl shadow-xl text-white">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/4 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="md:w-3/4 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-4">
                    Your Personal Real Estate Analyst
                  </h3>
                  <p className="text-lg text-blue-100">
                    And if you want, you can just follow the model's
                    recommendations. Think of it as your personal real estate
                    analyst guiding your investment decisions every step of the
                    way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Atlas */}
      <section className="py-16 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Why Choose Atlas
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Real estate investment simplified, transparent, and accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  {/* SVG Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Straightforward Ownership
                </h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">
                You legally own a piece of a real property.
              </p>
            </div>
            {/* Repeat for other features: Monthly Income, Smart Ratings, Fully Transparent, No Management Needed */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Monthly Income
                </h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">
                You receive your share of the rental profits.
              </p>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Smart Ratings
                </h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">
                We use Atlas, our AI-powered model to highlight strong
                properties, making your investment decisions easier.
              </p>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Fully Transparent
                </h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">
                Property details, pricing, and income — always visible, never
                hidden.
              </p>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  No Management Needed
                </h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">
                We handle the legal, admin, and maintenance. You just invest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is Atlas For? */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Who Is Atlas for?
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mt-6 mb-8 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Type Cards */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    {/* SVG Icon */}
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      New investors
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want to get into real estate with as{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        little as a few hundred euros
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Repeat for other user types: Traders/Builders, Property Owners, Institutional Players */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Traders and builders
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        fast, liquid exposure
                      </span>{' '}
                      to a traditionally slow asset class.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Property owners
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want to{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        unlock capital
                      </span>{' '}
                      by offering part of their property to investors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Institutional players
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      looking for a{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        smarter way
                      </span>{' '}
                      to manage, fund, or offload real estate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center">
              <span className="h-px w-12 bg-amber-500"></span>
              <span className="mx-4 text-xl font-medium text-slate-600 dark:text-slate-400">
                Find Your Investment Path
              </span>
              <span className="h-px w-12 bg-amber-500"></span>
            </div>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Whether you're just starting out or managing an extensive
              portfolio, Atlas provides the tools and opportunities you need to
              succeed in real estate investing.
            </p>
          </div>
        </div>
      </section>

      {/* Investment Dashboard Section */}
      <section
        id="investment-calculator"
        className="relative bg-gray-100 dark:bg-slate-900 py-24 px-6 overflow-hidden" // Added dark mode bg
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              {' '}
              {/* Added dark mode text */}
              Calculate Your{' '}
              <span className="text-blue-600 dark:text-blue-400">
                Investment Returns
              </span>{' '}
              {/* Added dark mode text */}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {' '}
              {/* Added dark mode text */}
              Use our interactive calculator to see potential returns from
              fractional property investments.
            </p>
          </div>
          {/* Ensure PropertyInvestmentDashboard is imported and handles dark mode if needed */}
          <PropertyInvestmentDashboard />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900"></div>
        <div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]"
          style={{ backgroundSize: '20px 20px' }}
        ></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Ready to transform how you{' '}
              <span className="text-amber-400">invest</span> in real estate?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of investors already building wealth through
              tokenized property investments.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Link href="/login" className="relative block">
                {/* Ensure Button component is imported */}
                <Button className="relative px-10 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg transform transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  Start Investing Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Footer Columns */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">
                Project Atlas
              </h3>
              <p className="mb-4">
                The future of real estate investment is here.
              </p>
              <div className="flex space-x-4">
                {/* Social Icons */}
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668-.069 4.948-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-amber-500">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Investment Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-amber-500">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Investment Disclaimer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Risk Disclosure
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center">
            <p>
              © {new Date().getFullYear()} Project Atlas. All rights reserved.
            </p>
            <p className="mt-2 text-sm">
              Investment involves risk. The value of investments can go down as
              well as up and is not guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </> // Close the React Fragment
  );
}
