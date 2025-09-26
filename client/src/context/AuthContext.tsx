'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface AuthContextType {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ walletAddress, setWalletAddress }}>
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