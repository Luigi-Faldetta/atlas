'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PreloadPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Replace with your actual logo */}
          <div className="absolute inset-0 rounded-full bg-blue-900 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-blue-800 opacity-50 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-900">
            <span className="text-4xl font-bold text-amber-500">A</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">Project Atlas</h1>
        <p className="text-xl text-blue-200 mb-8">
          Tokenized Real Estate Investment
        </p>
        <div className="relative w-64 h-2 mx-auto bg-blue-900 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-amber-500 animate-progress"></div>
        </div>
        <p className="mt-4 text-blue-400">
          Loading investment opportunities...
        </p>
      </div>

      {/* Add custom animation to styles/globals.css */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
      `}</style>
    </main>
  );
}
