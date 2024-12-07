'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';

interface CoinSelectorProps {
  selectedCoins: string[];
  handleCoinSelection: (coin: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredCoins: string[];
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function CoinSelector({
  selectedCoins,
  handleCoinSelection,
  isDropdownOpen,
  setIsDropdownOpen,
  searchTerm,
  setSearchTerm,
  filteredCoins,
  dropdownRef,
}: CoinSelectorProps) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full sm:w-64 flex items-center justify-between px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <span className="truncate">
          {selectedCoins.length === 0
            ? 'Select coins'
            : `Selected ${selectedCoins.length} coin${selectedCoins.length === 1 ? '' : 's'}`}
        </span>
        <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
      </button>

      {/* Selected Coins Pills */}
      {selectedCoins.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCoins.map(coin => (
            <span
              key={coin}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
            >
              {coin}
              <button
                onClick={() => handleCoinSelection(coin)}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Panel */}
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
                onClick={() => handleCoinSelection(coin)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                  selectedCoins.includes(coin)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              >
                <span>{coin}</span>
                {selectedCoins.includes(coin) && (
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