'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BetaSignupModal } from '@/components/BetaSignupModal';

// Import team member images
import joshuaImage from '@/assets/Joshua.jpg';
import davinoImage from '@/assets/Davino.jpeg';
import aljereauImage from '@/assets/Aljereau.jpeg';
import luigiImage from '@/assets/Luigi.jpeg';

export default function About() {
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Card flip styles
  const cardFlipStyles = {
    container: {
      perspective: '1000px',
      height: '550px', // Increased height to fit all content
    },
    card: {
      position: 'relative' as 'relative',
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      transformStyle: 'preserve-3d' as 'preserve-3d',
      transition: 'transform 0.6s ease',
    },
    cardFlipped: {
      transform: 'rotateY(180deg)',
    },
    face: {
      position: 'absolute' as 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden' as 'hidden',
      WebkitBackfaceVisibility: 'hidden' as 'hidden',
      transition: 'transform 0.6s ease, z-index 0.1s',
    },
    front: {},
    frontFlipped: {
      transform: 'rotateY(180deg)',
    },
    back: {
      transform: 'rotateY(180deg)',
    },
    backFlipped: {
      transform: 'rotateY(0deg)',
    },
    backHidden: {
      zIndex: '0',
    },
  };

  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section - Vision Statement */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden min-h-screen">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900"></div>

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
              backgroundSize: '50px 50px',
            }}
          ></div>
        </div>

        {/* Animated dots background */}
        <div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]"
          style={{ backgroundSize: '20px 20px' }}
        ></div>

        {/* Enhanced animated background elements */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        ></div>

        {/* Decorative geometric shapes - inspired by TrustLine */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 border border-amber-400/20 rounded-full"></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 border border-blue-300/20 rounded-lg rotate-45"></div>

        {/* Content container */}
        <div className="relative max-w-6xl mx-auto z-10 px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left content - Text and headline */}
            <div className="lg:w-1/2 text-left">
              <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-blue-900/50 backdrop-blur-md border border-blue-700/50 text-amber-400">
                <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-sm font-medium">Atlas Vision</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white relative">
                <span className="relative inline-block mb-2">
                  <span className="relative z-10">The Real Estate</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-blue-600/0 via-blue-600/50 to-blue-600/0 blur-sm"></span>
                </span>
                <span className="block text-amber-400 mb-2">Exchange</span>
                <span className="text-white/80">of the Future</span>
              </h1>

              <p className="text-xl mt-6 mb-8 text-blue-100 leading-relaxed max-w-lg">
                We fractionalize property ownership using AI, smart contracts,
                and built-in liquidity — transforming real estate into a
                responsive, tradable asset class.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative block">
                    <BetaSignupModal />
                  </div>
                </div>
              </div>
            </div>

            {/* Right content - Abstract visualization */}
            <div className="lg:w-1/2 relative flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-amber-500/10 rounded-3xl blur-xl"></div>
              <div className="relative w-full max-w-md aspect-square rounded-3xl border border-white/10 backdrop-blur-sm bg-gradient-to-br from-blue-900/40 to-slate-900/40 p-8 flex flex-col justify-between overflow-hidden">
                {/* Grid background pattern */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255, 255, 255, 0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3Cpattern id='grid' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Crect width='50' height='50' fill='url(%23smallGrid)'/%3E%3Cpath d='M 50 0 L 0 0 0 50' fill='none' stroke='rgba(255, 255, 255, 0.08)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
                    backgroundSize: '50px 50px',
                  }}
                ></div>

                {/* Main content */}
                <div className="flex-1 flex flex-col justify-center items-center my-4">
                  {/* Title - Market opportunity */}
                  <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-amber-400 mb-1">
                      Market opportunity
                    </h2>
                    <div className="w-16 h-0.5 bg-blue-500/50 mx-auto"></div>
                  </div>

                  {/* Metrics */}
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-white mb-1 bg-clip-text bg-gradient-to-r from-white to-blue-200">
                      €10Trillion<span className="text-amber-400">+</span>
                    </div>
                    <div className="text-blue-200 text-base mb-6">
                      sitting in low-yield savings across the EU
                    </div>

                    {/* Highlighted metrics */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto">
                      {/* Tokenization */}
                      <div className="bg-blue-800/40 rounded-xl p-4 border border-blue-700/30">
                        <h3 className="text-amber-400 text-sm font-medium mb-1">
                          Tokenization
                        </h3>
                        <p className="text-4xl font-bold text-white">
                          30<span className="text-blue-300 text-lg">%</span>
                        </p>
                        <p className="text-xs text-blue-300 mt-1">
                          YoY growth in real estate
                        </p>
                      </div>

                      {/* Digital-first */}
                      <div className="bg-blue-800/40 rounded-xl p-4 border border-blue-700/30">
                        <h3 className="text-amber-400 text-sm font-medium mb-1">
                          Digital-first
                        </h3>
                        <p className="text-4xl font-bold text-white">
                          60<span className="text-blue-300 text-lg">%</span>
                        </p>
                        <p className="text-xs text-blue-300 mt-1">
                          of Millennials & Gen Z
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights - inspired by ezCard */}
          <div
            id="features"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20"
          >
            <div className="relative group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
              <div className="w-10 h-10 rounded-full bg-blue-900/80 flex items-center justify-center mb-4 text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                Direct ownership
              </h3>
              <p className="text-blue-100 text-sm">
                Investors decide exactly what kind of property they invest in.
              </p>
            </div>

            <div className="relative group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <div className="w-10 h-10 rounded-full bg-blue-900/80 flex items-center justify-center mb-4 text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              <h3 className="text-white font-bold text-lg mb-2">
                Monthly payouts
              </h3>
              <p className="text-blue-100 text-sm">
                Users can earn between 6-15% yearly returns on their
                investments. Payed out monthly or quarterly.
              </p>
            </div>

            <div className="relative group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
              <div className="w-10 h-10 rounded-full bg-blue-900/80 flex items-center justify-center mb-4 text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                Real-time liquidity
              </h3>
              <p className="text-blue-100 text-sm">
                Investors will be able to trade and sell their smart contracts
                on a secondary market.
              </p>
            </div>

            <div className="relative group bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <div className="w-10 h-10 rounded-full bg-blue-900/80 flex items-center justify-center mb-4 text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                AI-powered scoring
              </h3>
              <p className="text-blue-100 text-sm">
                Our custom AI provides intelligent location analysis providing
                our customers with a comprehensive understanding of their
                investments.
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16">
            <a
              href="#team"
              className="flex flex-col items-center text-blue-100 hover:text-amber-400 transition-colors duration-300"
            >
              <span className="text-sm mb-2">Discover More</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 animate-bounce"
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
            </a>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Bold headline-first typography for section header */}
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              We are Team Daedalus
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-6 mb-8 rounded-full"></div>

            {/* Manifesto with improved styling and modern glass effect */}
            <div className="max-w-6xl mx-auto mb-12 px-6 space-y-8 relative">
              {/* Background decorative elements */}
              <div className="absolute -top-10 -left-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-gradient-to-r from-amber-400/10 to-pink-400/10 rounded-full blur-3xl"></div>

              {/* Glass container for manifesto */}
              <div className="relative backdrop-blur-md bg-white/30 dark:bg-slate-800/20 rounded-3xl p-8 md:p-12 border border-white/40 dark:border-slate-700/40 shadow-xl">
                {/* Mission Statement - Bold with gradient */}
                <p className="text-2xl md:text-3xl font-bold text-center mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                  Our mission is to build products that serve people.
                </p>

                {/* Core Manifesto - More concise with improved typography */}
                <div className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                  <p className="text-center mb-6">
                    We believe technology should empower — not exclude. Our
                    tools are forged with{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      integrity
                    </span>
                    ,{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      purpose
                    </span>
                    , and{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      precision
                    </span>
                    .
                  </p>

                  <p className="text-center mb-6">
                    We are{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      dreamers
                    </span>
                    ,{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      builders
                    </span>
                    , and{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      problem-solvers
                    </span>{' '}
                    on a shared mission: To make real estate investment
                    accessible, fair, and future-proof. Through Project Atlas,
                    we fractionalize ownership so families can{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      build wealth
                    </span>
                    , communities can{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      grow stronger
                    </span>
                    , and{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      no one is left behind
                    </span>
                    .
                  </p>

                  <p className="text-center">
                    We don't just write code. We craft systems to uplift. We
                    serve people first. Always.
                  </p>
                </div>

                {/* Combined conclusion as one sentence with distinct styling */}
                <div className="mt-8 inline-block relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-amber-500/20 blur-xl rounded-full"></div>
                  <p className="relative text-xl md:text-2xl font-semibold text-center px-8 py-2 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-full border border-white/30 dark:border-slate-700/30">
                    This is Daedalus, and we're just getting started.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team cards container with improved grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto max-w-6xl px-4">
            {/* Team Member 1 */}
            <div
              className={`relative perspective ${
                flippedCards['ATLS-001'] ? 'is-flipped' : ''
              }`}
              style={{ height: '450px', marginBottom: '15px' }}
              onClick={() => handleCardFlip('ATLS-001')}
            >
              <div className="card-inner">
                {/* Front of card - Modern glassmorphism style */}
                <div className="card-face card-front rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-red-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* ID Badge with modern styling */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono tracking-wider rounded-full border border-blue-500/30 dark:border-blue-400/30">
                        ATLS-001
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-slate-800 dark:text-white text-lg font-bold mb-3">
                      Joshua Vasilda
                    </div>

                    {/* Photo Frame - Modern styling */}
                    <div className="relative mx-auto w-32 h-32 mb-5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-400/20 rounded-xl -z-10"></div>
                      <div className="absolute inset-1 rounded-xl overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50">
                        <Image
                          src={joshuaImage}
                          alt="Joshua Vasilda"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 dark:ring-slate-700/20 rounded-xl"></div>
                    </div>

                    {/* Role info with improved typography */}
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-medium text-sm mb-2">
                      Founder
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide font-medium mb-1">
                      Business Dev
                    </div>

                    {/* Click to flip indicator - Modernized */}
                    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back of card - Modern glassmorphism style */}
                <div className="card-face card-back rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg flex flex-col">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-red-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* Back content */}
                    <div className="pt-4 pb-2 mb-3">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Joshua Vasilda
                      </h3>
                    </div>

                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        EXPERIENCE
                      </span>
                    </div>

                    <div className="flex-grow overflow-auto px-2">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        2X founder, with 10 years of startup experience with
                        expertise in business development & project management.
                        He has a background in Industrial product design and
                        social work.
                      </p>
                    </div>

                    {/* Click to flip back indicator - Modernized */}
                    <div className="mt-auto pt-3 flex justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Back to profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div
              className={`relative perspective ${
                flippedCards['ATLS-002'] ? 'is-flipped' : ''
              }`}
              style={{ height: '450px', marginBottom: '15px' }}
              onClick={() => handleCardFlip('ATLS-002')}
            >
              <div className="card-inner">
                {/* Front of card - Modern glassmorphism style */}
                <div className="card-face card-front rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-red-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* ID Badge with modern styling */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono tracking-wider rounded-full border border-blue-500/30 dark:border-blue-400/30">
                        ATLS-002
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-slate-800 dark:text-white text-lg font-bold mb-3">
                      Aljereau Marten
                    </div>

                    {/* Photo Frame - Modern styling */}
                    <div className="relative mx-auto w-32 h-32 mb-5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-400/20 rounded-xl -z-10"></div>
                      <div className="absolute inset-1 rounded-xl overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50">
                        <Image
                          src={aljereauImage}
                          alt="Aljereau Marten"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 dark:ring-slate-700/20 rounded-xl"></div>
                    </div>

                    {/* Role info with improved typography */}
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white font-medium text-sm mb-2">
                      Analyst
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide font-medium mb-1">
                      Finance & Data
                    </div>

                    {/* Click to flip indicator - Modernized */}
                    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back of card - Modern glassmorphism style */}
                <div className="card-face card-back rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg flex flex-col">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-red-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* Back content */}
                    <div className="pt-4 pb-2 mb-3">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                        Aljereau Marten
                      </h3>
                    </div>

                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        EXPERIENCE
                      </span>
                    </div>

                    <div className="flex-grow overflow-auto px-2">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        Has a MSc Financial Economics & MSc Marketing from the
                        Erasmus University of Rotterdam. With 6+ years working
                        in the corporate finance sector – ABN Amro, HTM &
                        Traderequity. Expertise in financial reporting,
                        forecasting, BI automation, data analysis, and growth
                        marketing.
                      </p>
                    </div>

                    {/* Click to flip back indicator - Modernized */}
                    <div className="mt-auto pt-3 flex justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Back to profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div
              className={`relative perspective ${
                flippedCards['ATLS-003'] ? 'is-flipped' : ''
              }`}
              style={{ height: '450px', marginBottom: '15px' }}
              onClick={() => handleCardFlip('ATLS-003')}
            >
              <div className="card-inner">
                {/* Front of card - Modern glassmorphism style */}
                <div className="card-face card-front rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* ID Badge with modern styling */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono tracking-wider rounded-full border border-blue-500/30 dark:border-blue-400/30">
                        ATLS-003
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-slate-800 dark:text-white text-lg font-bold mb-3">
                      Davino Rosaria
                    </div>

                    {/* Photo Frame - Modern styling */}
                    <div className="relative mx-auto w-32 h-32 mb-5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 dark:from-indigo-400/20 dark:to-blue-400/20 rounded-xl -z-10"></div>
                      <div className="absolute inset-1 rounded-xl overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50">
                        <Image
                          src={davinoImage}
                          alt="Davino Rosaria"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 dark:ring-slate-700/20 rounded-xl"></div>
                    </div>

                    {/* Role info with improved typography */}
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white font-medium text-sm mb-2">
                      Software Engineer
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide font-medium mb-1">
                      Frontend & UX/UI
                    </div>

                    {/* Click to flip indicator - Modernized */}
                    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back of card - Modern glassmorphism style */}
                <div className="card-face card-back rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg flex flex-col">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* Back content */}
                    <div className="pt-4 pb-2 mb-3">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                        Davino Rosaria
                      </h3>
                    </div>

                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        EXPERIENCE
                      </span>
                    </div>

                    <div className="flex-grow overflow-auto px-2">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        Has 4 years of software development experience,
                        specialising in frontend & UX/UI design. He holds a BSc
                        in computer science & Robotics industrial automation
                        from Hogeschool Leiden.
                      </p>
                    </div>

                    {/* Click to flip back indicator - Modernized */}
                    <div className="mt-auto pt-3 flex justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Back to profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 4 */}
            <div
              className={`relative perspective ${
                flippedCards['ATLS-004'] ? 'is-flipped' : ''
              }`}
              style={{ height: '450px', marginBottom: '15px' }}
              onClick={() => handleCardFlip('ATLS-004')}
            >
              <div className="card-inner">
                {/* Front of card - Modern glassmorphism style */}
                <div className="card-face card-front rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-amber-500/10 to-orange-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* ID Badge with modern styling */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono tracking-wider rounded-full border border-blue-500/30 dark:border-blue-400/30">
                        ATLS-004
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-slate-800 dark:text-white text-lg font-bold mb-3">
                      Luigi Faldetta
                    </div>

                    {/* Photo Frame - Modern styling */}
                    <div className="relative mx-auto w-32 h-32 mb-5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-400/20 rounded-xl -z-10"></div>
                      <div className="absolute inset-1 rounded-xl overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50">
                        <Image
                          src={luigiImage}
                          alt="Luigi Faldetta"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 dark:ring-slate-700/20 rounded-xl"></div>
                    </div>

                    {/* Role info with improved typography */}
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-medium text-sm mb-2">
                      Software Engineer
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide font-medium mb-1">
                      Full-Stack
                    </div>

                    {/* Click to flip indicator - Modernized */}
                    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back of card - Modern glassmorphism style */}
                <div className="card-face card-back rounded-2xl">
                  <div className="relative p-6 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-slate-700/30 h-full text-center overflow-hidden shadow-lg flex flex-col">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-b from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -z-10"></div>

                    {/* Back content */}
                    <div className="pt-4 pb-2 mb-3">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Luigi Faldetta
                      </h3>
                    </div>

                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        EXPERIENCE
                      </span>
                    </div>

                    <div className="flex-grow overflow-auto px-2">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        Full-stack developer with 6+ years experience in AI
                        development, backend & database systems. Also worked as
                        a software instructor teaching up-and-coming students
                        the ins and outs of software development.
                      </p>
                    </div>

                    {/* Click to flip back indicator - Modernized */}
                    <div className="mt-auto pt-3 flex justify-center">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Back to profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-10 px-6 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to reinvent your real estate investment?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Join Atlas today and be part of the real estate revolution.
          </p>
          <div className="relative group inline-block">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href="/"
              className="relative flex items-center justify-center px-6 py-3 text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transform transition duration-300 group-hover:scale-105 group-hover:shadow-xl"
            >
              Start Investing Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
