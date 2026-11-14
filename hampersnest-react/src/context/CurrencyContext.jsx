import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { USD_RATE } from '../data/products';
import { useCart } from './CartContext';
import { API_BASE } from '../config';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};

export const CurrencyProvider = ({ children }) => {
  const { settings } = useCart();
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('hampers_nest_currency') || 'INR';
  });

  // Cached exchange rate state from backend memory (Frankfurter API backed)
  const [exchangeRate, setExchangeRate] = useState(() => {
    try {
      const saved = localStorage.getItem('hampers_nest_exchange_rate');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      rate: 0.010634,
      inrPerUsd: 94.04,
      base: 'INR',
      quote: 'USD',
      date: new Date().toISOString().split('T')[0]
    };
  });

  // Fetch cached exchange rate from backend memory on app load
  useEffect(() => {
    let isMounted = true;
    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/currency/rate`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data?.rate && isMounted) {
            setExchangeRate(json.data);
            try {
              localStorage.setItem('hampers_nest_exchange_rate', JSON.stringify(json.data));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Could not fetch backend exchange rate, using cached/fallback rate:', err);
      }
    };
    fetchRate();
    return () => { isMounted = false; };
  }, []);

  // Sync with settings if local storage is not set
  useEffect(() => {
    if (!localStorage.getItem('hampers_nest_currency') && settings?.currency) {
      setCurrency(settings.currency);
    }
  }, [settings?.currency]);

  const toggleCurrency = useCallback((val) => {
    const next = val || (currency === 'INR' ? 'USD' : 'INR');
    setCurrency(next);
    localStorage.setItem('hampers_nest_currency', next);
  }, [currency]);

  const formatPrice = useCallback((inrValue) => {
    if (inrValue === undefined || inrValue === null) return '';
    const numericInr = Number(inrValue);
    if (isNaN(numericInr)) return inrValue;

    if (currency === 'USD') {
      const usdValue = exchangeRate?.rate 
        ? numericInr * exchangeRate.rate 
        : (exchangeRate?.inrPerUsd ? numericInr / exchangeRate.inrPerUsd : numericInr / 94.04);
      
      const formattedUsd = usdValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `$${formattedUsd}`;
    }

    // Default INR (Traditional Rs. format)
    const formattedInr = numericInr.toLocaleString('en-IN');
    return `Rs. ${formattedInr}`;
  }, [currency, exchangeRate]);

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      toggleCurrency, 
      formatPrice, 
      exchangeRate 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
