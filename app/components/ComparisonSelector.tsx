'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { getAvailableSymbols } from "../services/binanceService";

interface ComparisonSelectorProps {
  comparisonCoin: string;
  setComparisonCoin: (coin: string) => void;
}

export function ComparisonSelector({ comparisonCoin, setComparisonCoin }: ComparisonSelectorProps) {
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      const coins = await getAvailableSymbols();
      setAvailableCoins(coins);
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCoins = availableCoins.filter(coin =>
    coin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full sm:w-64 flex items-center justify-between px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <span className="truncate">
          Compare with {comparisonCoin}
        </span>
        <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filteredCoins.map((coin) => (
              <button
                key={coin}
                onClick={() => {
                  setComparisonCoin(coin);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                  comparisonCoin === coin
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                <span>{coin}</span>
                {comparisonCoin === coin && (
                  <span className="text-blue-500">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 