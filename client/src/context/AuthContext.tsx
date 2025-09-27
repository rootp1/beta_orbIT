'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of the context data
interface AuthContextType {
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (address: string) => void;
  logout: () => void;
  setWalletAddress: (address: string | null) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for wallet address
const WALLET_STORAGE_KEY = 'orbital_wallet_address';

// Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    try {
      const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
      if (savedWallet) {
        setWalletAddress(savedWallet);
      }
    } catch (error) {
      console.error('Error loading wallet from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save wallet address to localStorage when it changes
  useEffect(() => {
    try {
      if (walletAddress) {
        localStorage.setItem(WALLET_STORAGE_KEY, walletAddress);
      } else {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving wallet to localStorage:', error);
    }
  }, [walletAddress]);

  const login = (address: string) => {
    setWalletAddress(address);
  };

  const logout = () => {
    setWalletAddress(null);
    try {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing wallet from localStorage:', error);
    }
  };

  const isAuthenticated = !!walletAddress;

  return (
    <AuthContext.Provider value={{ 
      walletAddress, 
      isAuthenticated, 
      isLoading,
      login,
      logout,
      setWalletAddress 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};