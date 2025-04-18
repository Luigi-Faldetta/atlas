'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    investmentAmount: '',
    priorExperience: '',
    painPoints: '',
    wishlist: '',
    phone: '',
    interests: {
      owningRealEstate: false,
      monthlyIncome: false,
      diversifyingPortfolio: false,
      simplerWay: false,
      sellingExiting: false,
      other: false,
    },
    otherInterestText: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handler for interest checkboxes
  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: checked,
      },
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Prepare data for Sheety API
    const sheetyData = {
      sheet1: {
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        country: formData.country || '',
        investmentamount: formData.investmentAmount || '',
        priorexperience: formData.priorExperience || '',
        painpoints: formData.painPoints || '',
        wishlist: formData.wishlist || '',
        owningRealEstate: formData.interests.owningRealEstate ? 'Yes' : 'No',
        monthlyIncome: formData.interests.monthlyIncome ? 'Yes' : 'No',
        diversifyingPortfolio: formData.interests.diversifyingPortfolio
          ? 'Yes'
          : 'No',
        simplerWay: formData.interests.simplerWay ? 'Yes' : 'No',
        sellingExiting: formData.interests.sellingExiting ? 'Yes' : 'No',
        other: formData.interests.other ? formData.otherInterestText : 'No',
      },
    };

    console.log('Form data being sent:', sheetyData);

    try {
      // Sheety API endpoint
      const sheetyURL =
        'https://api.sheety.co/89d08ce3a536fc3bfd603daeefce2e41/signupFormAtlas/sheet1';

      console.log('Submitting to Sheety:', sheetyURL);

      const response = await fetch(sheetyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sheety API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorDetails: errorText,
        });
        throw new Error(
          `Submission failed: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log('Sheety API Response:', responseData);

      // Send confirmation email
      try {
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });

        if (!emailResponse.ok) {
          console.error(
            'Failed to send confirmation email:',
            await emailResponse.text()
          );
        }
      } catch (error) {
        console.error('Error sending confirmation email:', error);
      }

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
        wishlist: '',
        interests: {
          owningRealEstate: false,
          monthlyIncome: false,
          diversifyingPortfolio: false,
          simplerWay: false,
          sellingExiting: false,
          other: false,
        },
        otherInterestText: '',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 overflow-y-auto max-h-[60vh] scrollbar-hide px-1 mt-6"
    >
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            1
          </div>
          <h2 className="text-xl font-bold text-amber-400">Your Info</h2>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Full name
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white"
          >
            Email
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Enter your email"
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-white"
          >
            Phone Number (optional)
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-white"
          >
            Country of Residence
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Spain, Netherlands..."
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>
      </section>

      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent my-6 rounded-full"></div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            2
          </div>
          <h2 className="text-xl font-bold text-amber-400">
            Investment Intent
          </h2>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="investmentAmount"
            className="block text-sm font-medium text-white"
          >
            How much would you consider investing?
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Select
              onValueChange={(value) =>
                handleSelectChange('investmentAmount', value)
              }
              required
            >
              <SelectTrigger className="relative w-full rounded-xl py-2.5 h-11 bg-white border-blue-700/50 text-slate-800 hover:border-blue-600 transition-all duration-300">
                <SelectValue placeholder="Select an amount" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-700/50 rounded-xl shadow-lg backdrop-blur-lg text-slate-800">
                <SelectItem
                  value="less-than-100"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Less than €100
                </SelectItem>
                <SelectItem
                  value="100-500"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  €100–€500
                </SelectItem>
                <SelectItem
                  value="500-1000"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  €500–€1,000
                </SelectItem>
                <SelectItem
                  value="1000-5000"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  €1,000–€5,000
                </SelectItem>
                <SelectItem
                  value="over-5000"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Over €5,000
                </SelectItem>
                <SelectItem
                  value="just-curious"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Just curious for now
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent my-6 rounded-full"></div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            3
          </div>
          <h2 className="text-xl font-bold text-amber-400">
            Have you invested before?
          </h2>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priorExperience"
            className="block text-sm font-medium text-white"
          >
            This helps us understand your experience level.
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Select
              onValueChange={(value) =>
                handleSelectChange('priorExperience', value)
              }
              required
            >
              <SelectTrigger className="relative w-full rounded-xl py-2.5 h-11 bg-white border-blue-700/50 text-slate-800 hover:border-blue-600 transition-all duration-300">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-700/50 rounded-xl shadow-lg backdrop-blur-lg text-slate-800">
                <SelectItem
                  value="Yes, I've invested in real estate"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Yes, I've invested in real estate
                </SelectItem>
                <SelectItem
                  value="Yes, but only in stocks, crypto, or other assets"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Yes, but only in stocks, crypto, or other assets
                </SelectItem>
                <SelectItem
                  value="No, I'm new to investing"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  No, I'm new to investing
                </SelectItem>
                <SelectItem
                  value="Prefer not to say"
                  className="text-slate-800 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-lg"
                >
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="painPoints"
            className="block text-sm font-medium text-white"
          >
            What frustrates you most about real estate investment?
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="painPoints"
              name="painPoints"
              value={formData.painPoints || ''}
              onChange={handleChange}
              placeholder="Your pain points, e.g., complexity, high costs, lack of access..."
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="wishlist"
            className="block text-sm font-medium text-white"
          >
            What would make this platform a no-brainer for you?
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
            <Input
              id="wishlist"
              name="wishlist"
              value={formData.wishlist || ''}
              onChange={handleChange}
              placeholder="e.g., transparency, easy returns, lower barriers..."
              className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </section>

      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent my-6 rounded-full"></div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            4
          </div>
          <h2 className="text-xl font-bold text-amber-400">
            What interests you most about Atlas?
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white mb-2">
            You can select multiple options.
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="owningRealEstate"
                checked={formData.interests.owningRealEstate}
                onCheckedChange={(checked) =>
                  handleInterestChange('owningRealEstate', checked as boolean)
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
              />
              <Label htmlFor="owningRealEstate" className="text-white">
                Owning real estate without buying an entire property
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="monthlyIncome"
                checked={formData.interests.monthlyIncome}
                onCheckedChange={(checked) =>
                  handleInterestChange('monthlyIncome', checked as boolean)
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
              />
              <Label htmlFor="monthlyIncome" className="text-white">
                Monthly income through rental shares
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="diversifyingPortfolio"
                checked={formData.interests.diversifyingPortfolio}
                onCheckedChange={(checked) =>
                  handleInterestChange(
                    'diversifyingPortfolio',
                    checked as boolean
                  )
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
              />
              <Label htmlFor="diversifyingPortfolio" className="text-white">
                Diversifying my portfolio
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="simplerWay"
                checked={formData.interests.simplerWay}
                onCheckedChange={(checked) =>
                  handleInterestChange('simplerWay', checked as boolean)
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
              />
              <Label htmlFor="simplerWay" className="text-white">
                Simpler, smarter way to invest in real estate
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sellingExiting"
                checked={formData.interests.sellingExiting}
                onCheckedChange={(checked) =>
                  handleInterestChange('sellingExiting', checked as boolean)
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5"
              />
              <Label htmlFor="sellingExiting" className="text-white">
                Selling and exiting on my own terms
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="otherInterest"
                checked={formData.interests.other}
                onCheckedChange={(checked) =>
                  handleInterestChange('other', checked as boolean)
                }
                className="bg-white border-blue-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5 mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor="otherInterest" className="text-white">
                  Other
                </Label>
                {formData.interests.other && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                    <Input
                      id="otherInterestText"
                      name="otherInterestText"
                      value={formData.otherInterestText}
                      onChange={handleChange}
                      placeholder="Please specify..."
                      className="relative w-full rounded-xl py-2.5 bg-white border-blue-700/50 text-slate-800 placeholder:text-slate-400 hover:border-blue-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative group mt-8">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-3 text-lg rounded-xl shadow-lg transform transition duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
        >
          {isSubmitting ? 'Submitting...' : 'Join the Waitlist'}
        </Button>
      </div>

      {submitStatus === 'success' && (
        <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-3 text-center">
          <p className="text-green-400">
            Thank you for signing up! We'll be in touch soon.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-3 text-center">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}
