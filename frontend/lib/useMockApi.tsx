'use client';

import { useState, useEffect } from 'react';
import { fetchProperties, fetchPropertyById, fetchUserInvestments, fetchPlatformStats, loginUser, registerUser, createInvestment, calculateProjectedReturns } from './mockApi';

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
  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginUser(email, password);
      setCurrentUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('atlas_token', result.token);
      localStorage.setItem('atlas_user', JSON.stringify(result.user));
      
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerUser(email, password, name);
      setCurrentUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('atlas_token', result.token);
      localStorage.setItem('atlas_user', JSON.stringify(result.user));
      
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Remove from localStorage
    localStorage.removeItem('atlas_token');
    localStorage.removeItem('atlas_user');
  };

  // API functions
  const getProperties = async (): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const properties = await fetchProperties();
      return properties;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
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

  const makeInvestment = async (propertyId: string, amount: number): Promise<any> => {
    if (!isAuthenticated || !currentUser) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const investment = await createInvestment(currentUser.id, propertyId, amount);
      return investment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectedReturns = async (propertyId: string, amount: number, years: number = 10): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const projections = await calculateProjectedReturns(propertyId, amount, years);
      return projections;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
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
    getProjectedReturns
  };
};

export default useMockApi;
