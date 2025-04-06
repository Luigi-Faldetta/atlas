'use client';

import { useState, useEffect } from 'react';
import {
  fetchProperties,
  fetchPropertyById,
  fetchUserInvestments,
  fetchPlatformStats,
  loginUser,
  registerUser,
  createInvestment,
  calculateProjectedReturns,
} from './mockApi';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

console.log('API_BASE_URL:', API_BASE_URL);

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResult {
  user: User;
  token: string;
}

// Mock API context to simulate backend integration
const useMockApi = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('atlas_token');
    const storedUser = localStorage.getItem('atlas_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Authentication functions
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use window.location.origin to get the correct base URL
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // For mock data purposes, if no real response data, create mock data
      const userData = data.user || {
        id: '1',
        name: 'Demo User',
        email: email
      };
      
      const tokenData = data.token || 'mock-jwt-token';
      
      localStorage.setItem('atlas_token', tokenData);
      localStorage.setItem('atlas_user', JSON.stringify(userData));
      
      setToken(tokenData);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      return { user: userData, token: tokenData };
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const { token, user } = await response.json();
    localStorage.setItem('atlas_token', token); // Store the JWT token
    return user;
  };

  const logout = () => {
    localStorage.removeItem('atlas_token'); // Remove the JWT token
    localStorage.removeItem('atlas_user'); // Remove the user data
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false); // Update the state
  };

  // const logout = () => {
  //   localStorage.removeItem('atlas_token'); // Remove the JWT token
  // };

  // const isAuthenticated = (): boolean => {
  //   if (typeof window === 'undefined') {
  //     return false; // Return false during server-side rendering
  //   }

  //   const token = localStorage.getItem('atlas_token');
  //   return !!token; // Return true if a token exists
  // };

  // API functions
  const getProperties = async () => {
    const token = localStorage.getItem('atlas_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch('/api/properties', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch properties');
    }

    return await response.json();
  };

  const getPropertyById = async (id: string): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const property = await fetchPropertyById(id);
      return property;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserInvestments = async (): Promise<any[]> => {
    if (!isAuthenticated || !currentUser) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const investments = await fetchUserInvestments(currentUser.id);
      return investments;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStats = async (): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const stats = await fetchPlatformStats();
      return stats;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const makeInvestment = async (
    propertyId: string,
    amount: number
  ): Promise<any> => {
    if (!isAuthenticated || !currentUser) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const investment = await createInvestment(
        currentUser.id,
        propertyId,
        amount
      );
      return investment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectedReturns = async (
    propertyId: string,
    amount: number,
    years: number = 10
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const projections = await calculateProjectedReturns(
        propertyId,
        amount,
        years
      );
      return projections;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated, // Use the state
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    getProperties,
    getPropertyById,
    getUserInvestments,
    getPlatformStats,
    makeInvestment,
    getProjectedReturns,
  };
};

export default useMockApi;
