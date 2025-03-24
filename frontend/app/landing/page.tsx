import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen p-6 md:p-12 text-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Invest in tokenized real estate with the trust of traditional wealth.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-200">
            Fractionalized property investment, the easy way to invest in property.
          </p>
          <Link href="/login">
            <Button className="px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]" style={{ backgroundSize: '30px 30px' }}></div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Why Project Atlas?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg hover:shadow-lg transition-all">
              <div className="mb-4 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Stable Asset-Backed Investments</h3>
              <p className="text-slate-700 dark:text-slate-300">Real estate provides tangible value, giving you security and stability in your investment portfolio.</p>
            </div>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg hover:shadow-lg transition-all">
              <div className="mb-4 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Tokenized Ownership & Liquidity</h3>
              <p className="text-slate-700 dark:text-slate-300">Buy and sell property fractions anytime on our platform, giving you unprecedented liquidity for real estate.</p>
            </div>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg hover:shadow-lg transition-all">
              <div className="mb-4 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Passive Income & Long-Term Growth</h3>
              <p className="text-slate-700 dark:text-slate-300">Earn rental yield while your property appreciates in value, providing both immediate income and long-term returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Choose a property</h3>
              <p className="text-slate-700 dark:text-slate-300">Browse our curated selection of premium properties and select the one that matches your investment goals.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Buy fractional shares</h3>
              <p className="text-slate-700 dark:text-slate-300">Purchase your desired ownership percentage through our secure blockchain platform with just a few clicks.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Earn passive income</h3>
              <p className="text-slate-700 dark:text-slate-300">Receive regular rental distributions and benefit from property appreciation as the value grows over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Properties */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Investment Opportunities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Property Example 1 */}
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-slate-300">
                {/* Replace with actual property image */}
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 m-2 rounded-full text-sm font-bold">
                  8.2% ROI
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Luxury Apartment Complex</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">San Francisco, CA</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-amber-500 font-bold">$250/token</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">1,250 tokens available</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <span>$812,500 raised</span>
                  <span>65% funded</span>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Invest Now</Button>
              </div>
            </div>

            {/* Property Example 2 */}
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-slate-300">
                {/* Replace with actual property image */}
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 m-2 rounded-full text-sm font-bold">
                  7.5% ROI
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Commercial Plaza</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Austin, TX</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-amber-500 font-bold">$175/token</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">2,000 tokens available</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <span>$287,000 raised</span>
                  <span>82% funded</span>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Invest Now</Button>
              </div>
            </div>

            {/* Property Example 3 */}
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-slate-300">
                {/* Replace with actual property image */}
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 m-2 rounded-full text-sm font-bold">
                  9.1% ROI
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Vacation Rental Portfolio</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">Miami, FL</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-amber-500 font-bold">$300/token</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">800 tokens available</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <span>$108,000 raised</span>
                  <span>45% funded</span>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Invest Now</Button>
              </div>
            </div>
          </div>

          {/* Investment Calculator */}
          <div className="p-8 bg-blue-900 text-white rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-center">Investment Returns Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block mb-2">Investment Amount</label>
                <input type="number" placeholder="$10,000" className="w-full p-3 rounded bg-blue-800 text-white border border-blue-700 focus:outline-none focus:border-amber-500" />
                <p className="mt-2 text-blue-300 text-sm">Enter how much you want to invest</p>
              </div>
              <div className="flex flex-col justify-center bg-blue-800 p-5 rounded">
                <div className="flex justify-between mb-3">
                  <span>Estimated Annual Rental Yield:</span>
                  <span className="font-bold text-amber-400">$750</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span>Projected 5-Year Appreciation:</span>
                  <span className="font-bold text-amber-400">$2,250</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-700">
                  <span>Total 5-Year Return:</span>
                  <span className="font-bold text-amber-400">$6,000 (60%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-6 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Trust & Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
              <div className="mb-4 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Regulatory Compliance</h3>
              <p className="text-slate-700 dark:text-slate-300">Built with financial security in mind, adhering to all relevant regulations and compliance standards.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
              <div className="mb-4 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Smart Contract Transparency</h3>
              <p className="text-slate-700 dark:text-slate-300">Our blockchain transactions are verified and audited, providing complete transparency and security.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
              <div className="mb-4 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Institutional Partnerships</h3>
              <p className="text-slate-700 dark:text-slate-300">We work with established financial institutions and real estate firms to bring you the best opportunities.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">What Our Investors Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-300 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Sarah Johnson</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Early Investor</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300">"Project Atlas has made real estate investing accessible to me for the first time. The returns have been consistent and the platform is incredibly easy to use."</p>
              </div>
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-300 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Michael Chen</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Property Investor</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300">"The blockchain technology behind Project Atlas gives me confidence that my investments are secure and transparent. The rental income is a great bonus."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform how you invest in real estate?</h2>
          <p className="text-xl mb-8">Join thousands of investors already building wealth through tokenized property investments.</p>
          <Link href="/login">
            <Button className="px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900">
              Start Investing Today
            </Button>
          </Link>
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
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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