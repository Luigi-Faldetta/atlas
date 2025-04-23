'use client';

import { useEffect } from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Building } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      console.log('User is signed in, redirecting...');
      router.push('/dashboard'); // This handles the redirect after successful modal sign-in/up
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-900 dark:to-blue-950 p-4">
        <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-900 dark:to-blue-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <Building className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in or create an account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {/* Remove redirection props for modal mode */}
          <SignInButton mode="modal">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </SignInButton>
          {/* Remove redirection props for modal mode */}
          <SignUpButton mode="modal">
            <Button variant="outline" className="w-full sm:w-auto">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 pt-4">
          By signing in or signing up, you agree to our Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
