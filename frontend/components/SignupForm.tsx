'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    investmentAmount: '',
    priorExperience: '',
    painPoints: '',
    wishlist: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Prepare data for Sheety API
    // Note: column names in sheet must match these property names (case-sensitive)
    const sheetyData = {
      sheet1: {
        // Make sure these exactly match your column headers (case sensitive)
        // Note: Sheety often works better with lowercase column names
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        country: formData.country || '',
        investmentamount: formData.investmentAmount || '', // Try lowercase for compound names
        priorexperience: formData.priorExperience || '', // Try lowercase for compound names
        painpoints: formData.painPoints || '', // Try lowercase for compound names
        wishlist: formData.wishlist || ''
      }
    };
    
    console.log("Form data being sent:", sheetyData);
    
    try {
      // Sheety API endpoint
      const sheetyURL = 'https://api.sheety.co/89d08ce3a536fc3bfd603daeefce2e41/signupFormAtlas/sheet1';
      
      console.log("Submitting to Sheety:", sheetyURL);
      
      const response = await fetch(sheetyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetyData)
      });
      
      if (!response.ok) {
        // Get the response text to see the error details
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, details:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      setSubmitStatus('success');
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        investmentAmount: '',
        priorExperience: '',
        painPoints: '',
        wishlist: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[60vh] scrollbar-hide">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Step 1: Your Info</h2>
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-white">
            Full name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-white">
            Phone Number (optional)
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium text-white">
            Country of Residence
          </label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Spain, Netherlands..."
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
            required
          />
        </div>
      </section>

      <div className="w-full h-px bg-blue-700/50 my-6"></div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Step 2: Investment Intent</h2>
        
        <div className="space-y-2">
          <label htmlFor="investmentAmount" className="block text-sm font-medium text-white">
            How much would you consider investing?
          </label>
          <Select 
            onValueChange={(value) => handleSelectChange('investmentAmount', value)}
            required
          >
            <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
              <SelectValue placeholder="Select an amount" />
            </SelectTrigger>
            <SelectContent className="bg-blue-950 border-blue-800 text-white">
              <SelectItem value="less-than-100" className="text-white focus:bg-blue-800 focus:text-white">Less than €100</SelectItem>
              <SelectItem value="100-500" className="text-white focus:bg-blue-800 focus:text-white">€100–€500</SelectItem>
              <SelectItem value="500-1000" className="text-white focus:bg-blue-800 focus:text-white">€500–€1,000</SelectItem>
              <SelectItem value="1000-5000" className="text-white focus:bg-blue-800 focus:text-white">€1,000–€5,000</SelectItem>
              <SelectItem value="over-5000" className="text-white focus:bg-blue-800 focus:text-white">Over €5,000</SelectItem>
              <SelectItem value="just-curious" className="text-white focus:bg-blue-800 focus:text-white">Just curious for now</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="w-full h-px bg-blue-700/50 my-6"></div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Step 3: Your Experience</h2>
        
        <div className="space-y-2">
          <label htmlFor="priorExperience" className="block text-sm font-medium text-white">
            Have you invested in real estate before?
          </label>
          <Select 
            onValueChange={(value) => handleSelectChange('priorExperience', value)}
            required
          >
            <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent className="bg-blue-950 border-blue-800 text-white">
              <SelectItem value="Yes" className="text-white focus:bg-blue-800 focus:text-white">Yes</SelectItem>
              <SelectItem value="No" className="text-white focus:bg-blue-800 focus:text-white">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="painPoints" className="block text-sm font-medium text-white">
            What frustrates you most about real estate investment?
          </label>
          <Input
            id="painPoints"
            name="painPoints"
            value={formData.painPoints || ''}
            onChange={handleChange}
            placeholder="Your pain points, e.g., complexity, high costs, lack of access..."
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="wishlist" className="block text-sm font-medium text-white">
            What would make this platform a no-brainer for you?
          </label>
          <Input
            id="wishlist"
            name="wishlist"
            value={formData.wishlist || ''}
            onChange={handleChange}
            placeholder="e.g., transparency, easy returns, lower barriers..."
            className="w-full bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-300/70"
          />
        </div>
      </section>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 text-lg mt-5"
      >
        {isSubmitting ? 'Submitting...' : 'Join the Waitlist'}
      </Button>
      
      {submitStatus === 'success' && (
        <p className="text-green-400 text-center">Thank you for signing up! We'll be in touch soon.</p>
      )}
      
      {submitStatus === 'error' && (
        <p className="text-red-400 text-center">{errorMessage}</p>
      )}
    </form>
  )
} 