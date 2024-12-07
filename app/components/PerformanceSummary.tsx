'use client';

interface PnLData {
  coin: string;
  initialPrice: number;
  currentPrice: number;
  pnlPercentage: number;
  weight?: number;
}

interface PerformanceSummaryProps {
  pnlData: PnLData[];
  totalPnL: number;
  comparisonPnlData: PnLData[];
  comparisonPnL: number;
  chartData: any[];
  onWeightChange: (portfolio: 1 | 2, coin: string, weight: number) => void;
}

export function PerformanceSummary({ 
  pnlData, 
  totalPnL, 
  comparisonPnlData, 
  comparisonPnL, 
  chartData,
  onWeightChange 
}: PerformanceSummaryProps) {
  const handleResetWeights = (portfolio: 1 | 2) => {
    const data = portfolio === 1 ? pnlData : comparisonPnlData;
    const defaultWeight = 100 / data.length;
    data.forEach(coin => {
      onWeightChange(portfolio, coin.coin, defaultWeight);
    });
  };

  return (
    <div className="mb-8">
      {/* Portfolio Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio 1 Header */}
        <div className="bg-gray-100/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <h2 className="text-xl font-semibold">Portfolio 1</h2>
            <button
              onClick={() => handleResetWeights(1)}
              disabled={pnlData.length <= 1}
              className={`px-2 py-1 text-xs rounded ml-2 ${
                pnlData.length <= 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Reset Weights
            </button>
            <span className={`text-xl font-bold ml-auto ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Portfolio 2 Header */}
        {comparisonPnlData.length > 0 && (
          <div className="bg-gray-100/5 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f7931a]"></div>
              <h2 className="text-xl font-semibold">Portfolio 2</h2>
              <button
                onClick={() => handleResetWeights(2)}
                disabled={comparisonPnlData.length <= 1}
                className={`px-2 py-1 text-xs rounded ml-2 ${
                  comparisonPnlData.length <= 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Reset Weights
              </button>
              <span className={`text-xl font-bold ml-auto ${comparisonPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {comparisonPnL.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio 1 Details */}
        <div className="bg-gray-100/5 rounded-lg">
          <div className="divide-y divide-gray-800">
            {pnlData.map((data) => (
              <div key={data.coin} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{data.coin}</h3>
                    <div className="text-sm text-gray-400 mt-1">
                      ${data.initialPrice.toFixed(2)} → ${data.currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <span className={`font-semibold ${data.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.pnlPercentage >= 0 ? '+' : ''}{data.pnlPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.weight || 100}
                    onChange={(e) => onWeightChange(1, data.coin, parseInt(e.target.value))}
                    disabled={pnlData.length === 1}
                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                      pnlData.length === 1 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gray-700'
                    }`}
                  />
                  <span className="text-sm text-gray-400 w-12 text-right">{data.weight || 100}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio 2 Details */}
        {comparisonPnlData.length > 0 && (
          <div className="bg-gray-100/5 rounded-lg">
            <div className="divide-y divide-gray-800">
              {comparisonPnlData.map((data) => (
                <div key={data.coin} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{data.coin}</h3>
                      <div className="text-sm text-gray-400 mt-1">
                        ${data.initialPrice.toFixed(2)} → ${data.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className={`font-semibold ${data.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.pnlPercentage >= 0 ? '+' : ''}{data.pnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={data.weight || 100}
                      onChange={(e) => onWeightChange(2, data.coin, parseInt(e.target.value))}
                      disabled={comparisonPnlData.length === 1}
                      className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                        comparisonPnlData.length === 1 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-gray-700'
                      }`}
                    />
                    <span className="text-sm text-gray-400 w-12 text-right">{data.weight?.toFixed(1) || 100}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 