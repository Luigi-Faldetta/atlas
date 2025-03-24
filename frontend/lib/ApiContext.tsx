'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useMockApi from './useMockApi';

// Define the API context type
interface ApiContextType {
  isAuthenticated: boolean;
  currentUser: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  getProperties: () => Promise<any[]>;
  getPropertyById: (id: string) => Promise<any>;
  getUserInvestments: () => Promise<any[]>;
  getPlatformStats: () => Promise<any>;
  makeInvestment: (propertyId: string, amount: number) => Promise<any>;
  getProjectedReturns: (propertyId: string, amount: number, years?: number) => Promise<any>;
}

// Create context
const ApiContext = createContext<ApiContextType | null>(null);

// Provider component
export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const api = useMockApi();
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook to use the API context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
