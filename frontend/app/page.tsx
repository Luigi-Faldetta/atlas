'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }}></div>
        
        {/* Content container */}
        <div className="relative max-w-6xl mx-auto z-10 px-6 md:px-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-blue-900/50 backdrop-blur-md border border-blue-700/50 text-amber-400">
            <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-sm font-medium">Reimagining real estate investment</span>
          </div>
          
          {/* Main heading with animated gradient */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Invest in tokenized real estate
            </span> 
            <br className="hidden md:block" />
            <span className="text-white">with the trust of traditional wealth.</span>
          </h1>
          
          {/* Subheading with enhanced styling */}
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Fractionalized property investment, the <span className="font-semibold text-white">smarter way</span> to invest in property with lower barriers and higher flexibility.
          </p>
          
          {/* CTA section with dual buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Link href="/login" className="relative block">
                <Button className="relative px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg transform transition duration-300 group-hover:scale-105 group-hover:shadow-xl w-full">
                  Get Started
                </Button>
              </Link>
            </div>
            <Link href="#how-it-works">
              <Button variant="outline" className="px-8 py-6 text-lg bg-transparent hover:bg-blue-800/30 text-white border-white/20 hover:border-white/40 rounded-xl transition duration-300 w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-blue-200/70">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Regulated investment</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>5,000+ investors</span>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              So what is Atlas, really?
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mt-6 mb-8 rounded-full"></div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-amber-500/20 rounded-3xl blur-lg opacity-70"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-xl shadow-lg text-white mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Modern Real Estate Investment</h3>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                    Atlas is a <span className="font-semibold text-blue-600 dark:text-blue-400">new way to invest in real estate</span> — smarter, more flexible, and actually built for how people want to invest today.
                  </p>
                  <div className="flex space-x-2 mb-6">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">Smarter</span>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">Flexible</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-full text-sm font-medium">Modern</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-500 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">For Everyone, Not Just the Elite</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      We give you access to real estate opportunities that were once reserved for the <span className="line-through italic text-slate-400 dark:text-slate-500">wealthy or institutional players</span> — and we do it in a way that's:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="w-6 h-6 mr-2 rounded-full bg-blue-500 flex items-center justify-center text-white">✓</span>
                        <span>Fast</span>
                      </li>
                      <li className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="w-6 h-6 mr-2 rounded-full bg-blue-500 flex items-center justify-center text-white">✓</span>
                        <span>Transparent</span>
                      </li>
                      <li className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="w-6 h-6 mr-2 rounded-full bg-blue-500 flex items-center justify-center text-white">✓</span>
                        <span>Low-cost</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Atlas Exists */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Why Atlas exists
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Traditional real estate investing is outdated.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">High Capital Requirements</h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">It takes a <span className="font-semibold text-amber-600 dark:text-amber-400">ton of money</span> to buy a single property.</p>
            </div>
            
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Limited Flexibility</h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">You have <span className="font-semibold text-amber-600 dark:text-amber-400">no real flexibility</span> — once you're in, you're locked in.</p>
            </div>
            
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Difficult Exit Strategy</h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">Selling your stake? <span className="font-semibold text-amber-600 dark:text-amber-400">Slow, expensive, and messy</span>.</p>
            </div>
            
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transform hover:-translate-y-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Limited Options</h3>
              </div>
              <p className="pl-14 text-slate-600 dark:text-slate-400">Most people are left with only two options: <span className="font-semibold text-amber-600 dark:text-amber-400">Throw money at a REIT</span> and hope for the best, or avoid the game entirely.</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-amber-500/20 rounded-xl blur-md"></div>
            <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-16 w-20 h-20 bg-amber-500/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-16 w-20 h-20 bg-blue-300/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 text-white text-lg md:text-2xl font-bold">
                Atlas fixes that.
              </div>
              <div className="relative z-10 hidden md:block">
                <svg className="w-14 h-14 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                </svg>
              </div>
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
            {/* User Type 1 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">New investors</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want to get into real estate with as <span className="font-medium text-blue-600 dark:text-blue-400">little as a few hundred euros</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Type 2 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Traders and builders</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want <span className="font-medium text-blue-600 dark:text-blue-400">fast, liquid exposure</span> to a traditionally slow asset class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Type 3 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Property owners</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      who want to <span className="font-medium text-blue-600 dark:text-blue-400">unlock capital</span> by offering part of their property to investors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Type 4 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-3">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Institutional players</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      looking for a <span className="font-medium text-blue-600 dark:text-blue-400">smarter way</span> to manage, fund, or offload real estate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center">
              <span className="h-px w-12 bg-amber-500"></span>
              <span className="mx-4 text-xl font-medium text-slate-600 dark:text-slate-400">Find Your Investment Path</span>
              <span className="h-px w-12 bg-amber-500"></span>
            </div>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Whether you're just starting out or managing an extensive portfolio, Atlas provides the tools and opportunities you need to succeed in real estate investing.
            </p>
          </div>
        </div>
      </section>

      {/* What You Can Do on Atlas */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              What you can do on Atlas
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-slate-700 dark:text-slate-300 text-center mb-12 max-w-3xl mx-auto">
            Atlas gives you <span className="font-medium">fractional access</span> to high-quality properties. You invest only what you want — and get ownership in real estate that earns rental income, appreciates over time, and can be resold when you're ready.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-blue-900/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-amber-400">Fractional Ownership</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                But we didn't stop there. We also help you <span className="font-medium">choose better investments</span>, not just any real estate.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/70 dark:bg-slate-800/50 rounded-xl">
                  <div className="bg-amber-500 p-2 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">In-house Rating System</h4>
                    <p className="text-slate-700 dark:text-slate-300">Every property is analyzed to score profitability, risk, price trends, location, and more.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-900/30 dark:to-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-amber-400">Custom Portfolio Building</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Create a real estate portfolio tailored specifically to your investment preferences and financial goals.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/70 dark:bg-slate-800/50 rounded-xl">
                  <div className="bg-amber-500 p-2 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Your Own ETF</h4>
                    <p className="text-slate-700 dark:text-slate-300">Build a custom portfolio — like creating your own ETF — based on your risk level and income goals.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 rounded-2xl shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/4 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="md:w-3/4 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4">Your Personal Real Estate Analyst</h3>
                <p className="text-lg text-blue-100">
                  And if you want, you can just follow the model's recommendations. Think of it as your personal real estate analyst guiding your investment decisions every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* So What Powers It? */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-slate-900 dark:text-white">
              So what powers it?
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-12 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row gap-12 mb-16 items-center">
            <div className="md:w-1/2">
              <p className="text-xl text-slate-700 dark:text-slate-300 mb-8">
                Under the hood, Atlas runs on a secure digital infrastructure that:
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start gap-6">
                  <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-xl text-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Split Ownership</h3>
                    <p className="text-slate-700 dark:text-slate-300">Makes it easy to <span className="font-medium text-blue-600 dark:text-amber-400">split ownership into smaller shares</span></p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-xl text-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Automated Management</h3>
                    <p className="text-slate-700 dark:text-slate-300">Handles <span className="font-medium text-blue-600 dark:text-amber-400">income payouts and ownership tracking</span> automatically</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-xl text-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Integrated Marketplace</h3>
                    <p className="text-slate-700 dark:text-slate-300">Enables a <span className="font-medium text-blue-600 dark:text-amber-400">built-in marketplace</span> so you can buy and sell with ease</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="relative bg-gradient-to-br from-slate-800 to-blue-900 p-8 rounded-2xl shadow-xl overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-slate-400">blockchain-core.js</div>
                  </div>
                  <div className="space-y-2 font-mono text-sm text-slate-300">
                    <div><span className="text-amber-400">class</span> <span className="text-blue-400">PropertyToken</span> {`{`}</div>
                    <div className="pl-4"><span className="text-amber-400">constructor</span>(propertyId, shares, price) {`{`}</div>
                    <div className="pl-8"><span className="text-purple-400">this</span>.propertyId = propertyId;</div>
                    <div className="pl-8"><span className="text-purple-400">this</span>.totalShares = shares;</div>
                    <div className="pl-8"><span className="text-purple-400">this</span>.pricePerShare = price;</div>
                    <div className="pl-4">{`}`}</div>
                    <div className="pl-4"><span className="text-amber-400">async</span> <span className="text-green-400">splitOwnership</span>(shares) {`{`}</div>
                    <div className="pl-8"><span className="text-blue-300">// Creates transferable tokens</span></div>
                    <div className="pl-8"><span className="text-purple-400">return</span> await blockchain.mint(shares);</div>
                    <div className="pl-4">{`}`}</div>
                    <div className="pl-4"><span className="text-amber-400">async</span> <span className="text-green-400">distributeIncome</span>(amount) {`{`}</div>
                    <div className="pl-8"><span className="text-blue-300">// Automatic distribution to shareholders</span></div>
                    <div className="pl-4">{`}`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-blue-900/30 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xl text-slate-700 dark:text-slate-300 mb-4">
              You don't need to worry about how it all works. Just know that it's 
              <span className="font-bold text-blue-600 dark:text-amber-400"> built to be safe, fast, and scalable.</span>
            </p>
            <p className="text-xl text-slate-700 dark:text-slate-300">
              You click, you invest, and it just works.
            </p>
          </div>
        </div>
      </section>

      {/* Why Atlas is Different */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Why Atlas is different?
            </h2>
          </div>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          
          <div className="relative mb-12 max-w-3xl mx-auto">
            <p className="text-xl text-center text-slate-700 dark:text-slate-300">
              Atlas doesn't just let you invest — it helps you <span className="font-semibold text-blue-600 dark:text-blue-400">invest intelligently</span>, move quickly, and stay in control.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No waiting on agents.</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12">
                  Invest on your schedule with our <span className="font-medium text-blue-600 dark:text-blue-400">24/7 platform</span> — no appointments, no delays.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No hidden fees.</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12">
                  Complete <span className="font-medium text-blue-600 dark:text-blue-400">transparency</span> with all costs and fees clearly displayed before you invest.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No lock-in.</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12">
                  Buy and sell your shares <span className="font-medium text-blue-600 dark:text-blue-400">whenever you want</span> with our liquid secondary market.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Just real estate made flexible.</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12">
                  All the <span className="font-medium text-blue-600 dark:text-blue-400">benefits of property investment</span> without the traditional limitations and barriers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/5 flex justify-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="md:w-4/5 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4">Experience the difference today</h3>
                <p className="text-lg text-blue-100">
                  Join thousands of investors who have already discovered how Atlas is reinventing real estate investment for the digital age.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Ready to transform how you <span className="text-amber-400">invest</span> in real estate?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of investors already building wealth through tokenized property investments.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Link href="/login" className="relative block">
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
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Project Atlas</h3>
              <p className="mb-4">The future of real estate investment is here.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668-.069 4.948-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-500">FAQs</a></li>
                <li><a href="#" className="hover:text-amber-500">Blog</a></li>
                <li><a href="#" className="hover:text-amber-500">Documentation</a></li>
                <li><a href="#" className="hover:text-amber-500">Investment Guide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-500">About Us</a></li>
                <li><a href="#" className="hover:text-amber-500">Team</a></li>
                <li><a href="#" className="hover:text-amber-500">Careers</a></li>
                <li><a href="#" className="hover:text-amber-500">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-amber-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-500">Investment Disclaimer</a></li>
                <li><a href="#" className="hover:text-amber-500">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center">
            <p>© {new Date().getFullYear()} Project Atlas. All rights reserved.</p>
            <p className="mt-2 text-sm">Investment involves risk. The value of investments can go down as well as up and is not guaranteed.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 