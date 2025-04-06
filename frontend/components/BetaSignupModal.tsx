'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SignupForm } from '@/components/SignupForm'
import { X } from 'lucide-react'
import { useState } from 'react'

interface BetaSignupModalProps {
  trigger?: React.ReactNode
}

export function BetaSignupModal({ trigger }: BetaSignupModalProps) {
  const [open, setOpen] = useState(false)
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleButtonClick = () => {
    setOpen(true)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <Button 
          onClick={handleButtonClick}
          className="relative px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg transform transition duration-300 group-hover:scale-105 group-hover:shadow-xl w-full"
        >
          Sign up for the Beta
        </Button>
      )}
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl">
        {/* Background styling similar to the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] z-0" style={{ backgroundSize: '20px 20px' }}></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        
        {/* Custom close button with hover effect */}
        <button 
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 z-20 text-blue-100 hover:bg-blue-800/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Modal content */}
        <div className="relative z-10 p-8">
          <DialogHeader className="text-center">
            <div className="mx-auto w-fit inline-flex items-center px-3 py-1.5 mb-2 rounded-full bg-blue-900/50 backdrop-blur-md border border-blue-700/50 text-amber-400">
              <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-sm font-medium">Join our exclusive beta</span>
            </div>
            <DialogTitle className="text-3xl font-bold text-white">
              Welcome to Project Atlas
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-2 mb-6">
              Join our early beta and get exclusive access to fractional real estate investment in Spain.
            </DialogDescription>
          </DialogHeader>
          <SignupForm />
        </div>
      </DialogContent>
    </Dialog>
  )
} 