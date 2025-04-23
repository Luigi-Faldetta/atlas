import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price to currency format (EUR)
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', { // Using de-DE for Euro formatting
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
};
