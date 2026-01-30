"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---
interface Alert {
  id: number;
  recommendation: string;
  sentiment: string;
  sentiment_score: number;
  urgency: string;
}

interface Signal {
  id: string;
  headline: string;
  content: string;
  ai_analysis: string;
  source: string;
  sentiment_score: number;
  urgency: string;
  recommendation: string;
}

interface MarketData {
  market_summary: {
    summary: string;
    top_alerts: Alert[];
  };
  signals: Signal[];
  success: boolean;
}

interface MarketContextType {
  data: MarketData | null;
  loading: boolean;
  refresh: () => void;
  lastUpdated: Date | null;
}

const MarketContext = createContext<MarketContextType>({
  data: null,
  loading: true,
  refresh: () => {},
  lastUpdated: null,
});

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      console.log("Fetching fresh market data...");
      const res = await fetch('https://unnoting-tanya-boilingly.ngrok-free.dev/api/bearish', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const jsonData = await res.json();
      
      // 1. Update State
      setData(jsonData);
      setLastUpdated(new Date());
      setLoading(false);

      // 2. Save to Browser Storage (The key step)
      localStorage.setItem('bearishMarketData', JSON.stringify(jsonData));
      localStorage.setItem('bearishLastUpdated', new Date().toISOString());
      
    } catch (err) {
      console.error("Background Fetch Failed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // A. INSTANT LOAD: Check LocalStorage first
    const cachedData = localStorage.getItem('bearishMarketData');
    const cachedTime = localStorage.getItem('bearishLastUpdated');

    if (cachedData) {
      console.log("Loaded data from Browser Storage (Instant)");
      setData(JSON.parse(cachedData));
      if (cachedTime) setLastUpdated(new Date(cachedTime));
      setLoading(false); // Show data immediately
    }

    // B. BACKGROUND UPDATE: Fetch fresh data anyway
    fetchData();

    // C. POLL: Refresh every 15 minutes
    const interval = setInterval(fetchData, 900000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ data, loading, refresh: fetchData, lastUpdated }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketData = () => useContext(MarketContext);