import React, { createContext, useContext, useState, useCallback } from 'react';
import { USD_RATE } from '../data/products';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('hampers_nest_currency') || 'INR';
  });

  const toggleCurrency = useCallback((val) => {
    const next = val || (currency === 'INR' ? 'USD' : 'INR');
    setCurrency(next);
    localStorage.setItem('hampers_nest_currency', next);
  }, [currency]);

  const formatPrice = useCallback((inrValue) => {
    if (currency === 'USD') {
      const usd = (inrValue / USD_RATE).toFixed(2);
      return `$${usd}`;
    }
    return `₹${inrValue}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
