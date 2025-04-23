// Utility functions for interacting with localStorage for watchlist

const WATCHLIST_KEY = 'atlasPropertyWatchlist';

// Helper to safely get data from localStorage
const safelyGetLocalStorage = (key: string): any => {
  if (typeof window === 'undefined') {
    return null; // Return null on server-side
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
};

// Helper to safely set data in localStorage
const safelySetLocalStorage = (key: string, value: any): void => {
  if (typeof window === 'undefined') {
    console.warn(`LocalStorage is not available on the server-side. Cannot set key "${key}".`);
    return; // Do nothing on server-side
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

/**
 * Retrieves the list of property IDs from the watchlist in localStorage.
 * @returns {string[]} An array of property IDs.
 */
export const getWatchlist = (): string[] => {
  const watchlist = safelyGetLocalStorage(WATCHLIST_KEY);
  return Array.isArray(watchlist) ? watchlist : [];
};

/**
 * Checks if a property ID is currently in the watchlist.
 * @param {string} propertyId - The ID of the property to check.
 * @returns {boolean} True if the property is in the watchlist, false otherwise.
 */
export const isInWatchlist = (propertyId: string): boolean => {
  const watchlist = getWatchlist();
  return watchlist.includes(propertyId);
};

/**
 * Adds or removes a property ID from the watchlist in localStorage.
 * @param {string} propertyId - The ID of the property to toggle.
 * @returns {boolean} The new status (true if added/kept, false if removed).
 */
export const toggleWatchlist = (propertyId: string): boolean => {
  const currentWatchlist = getWatchlist();
  let newWatchlist: string[];
  let newStatus: boolean;

  if (currentWatchlist.includes(propertyId)) {
    // Remove the property
    newWatchlist = currentWatchlist.filter(id => id !== propertyId);
    newStatus = false;
  } else {
    // Add the property
    newWatchlist = [...currentWatchlist, propertyId];
    newStatus = true;
  }

  safelySetLocalStorage(WATCHLIST_KEY, newWatchlist);
  return newStatus;
}; 