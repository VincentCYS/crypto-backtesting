'use client';

import { TIMEFRAME_OPTIONS, TimeframeOption } from '../constants/constants';

interface TimeframeSelectorProps {
  selectedTimeframe: TimeframeOption;
  setSelectedTimeframe: (timeframe: TimeframeOption) => void;
}

export function TimeframeSelector({ selectedTimeframe, setSelectedTimeframe }: TimeframeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMEFRAME_OPTIONS.map((timeframe) => (
        <button
          key={timeframe.label}
          onClick={() => setSelectedTimeframe(timeframe)}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            selectedTimeframe.label === timeframe.label
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
} 