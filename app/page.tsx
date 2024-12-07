'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { TIMEFRAME_OPTIONS, TimeframeOption, TRADING_PAIRS } from './constants/constants';
import { fetchKlineData, KlineData } from './services/binanceService';

interface PnLData {
  coin: string;
  initialPrice: number;
  currentPrice: number;
  pnlPercentage: number;
}

export default function Home() {
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<PnLData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPnL, setTotalPnL] = useState<number>(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[4]); // Default to 1 Year
  const [brushTimeframe, setBrushTimeframe] = useState<[number, number]>([0, 100]); // Percentage values

  useEffect(() => {
    // Fetch available coins on component mount
    const fetchCoins = async () => {
      setAvailableCoins([...TRADING_PAIRS]);
    };
    fetchCoins();
  }, []);

  const handleCoinSelection = async (coin: string) => {
    if (selectedCoins.includes(coin)) {
      setSelectedCoins(selectedCoins.filter(c => c !== coin));
    } else {
      setSelectedCoins([...selectedCoins, coin]);
    }
  };

  const calculatePnL = (results: KlineData[][], selectedCoins: string[]) => {
    const pnlCalculations = selectedCoins.map((coin, index) => {
      const coinData = results[index];
      const initialPrice = coinData[0].close;
      const currentPrice = coinData[coinData.length - 1].close;
      const pnlPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;

      return {
        coin,
        initialPrice,
        currentPrice,
        pnlPercentage
      };
    });

    const avgPnL = pnlCalculations.reduce((acc, curr) => acc + curr.pnlPercentage, 0) / pnlCalculations.length;
    
    setPnlData(pnlCalculations);
    setTotalPnL(avgPnL);
  };

  const handleBrushChange = (brushRange: any) => {
    if (brushRange && brushRange.startIndex !== undefined && brushRange.endIndex !== undefined) {
      setBrushTimeframe([brushRange.startIndex, brushRange.endIndex]);
      
      // Recalculate PnL for the selected timeframe
      if (chartData.length > 0) {
        const selectedData = chartData.slice(brushRange.startIndex, brushRange.endIndex + 1);
        const recalculatedPnL = selectedCoins.map(coin => {
          const initialPrice = selectedData[0][`${coin}_hidden`];
          const currentPrice = selectedData[selectedData.length - 1][`${coin}_hidden`];
          const pnlPercentage = currentPrice - initialPrice;

          return {
            coin,
            initialPrice: selectedData[0][`${coin}_price`] || 0,
            currentPrice: selectedData[selectedData.length - 1][`${coin}_price`] || 0,
            pnlPercentage
          };
        });

        const newAvgPnL = recalculatedPnL.reduce((acc, curr) => acc + curr.pnlPercentage, 0) / recalculatedPnL.length;
        setPnlData(recalculatedPnL);
        setTotalPnL(newAvgPnL);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCoins.length === 0) {
        setChartData([]);
        setPnlData([]);
        setTotalPnL(0);
        return;
      }

      setLoading(true);
      try {
        // First fetch BTC data
        const btcData = await fetchKlineData(
          'BTCUSDT',
          selectedTimeframe.interval,
          selectedTimeframe.days
        );

        // Then fetch selected coins data
        const promises = selectedCoins.map(coin => 
          fetchKlineData(
            `${coin}USDT`, 
            selectedTimeframe.interval, 
            selectedTimeframe.days
          )
        );
        
        const results = await Promise.all(promises);
        
        // Calculate PnL
        calculatePnL(results, selectedCoins);

        // Combine all data for chart
        const combinedData = btcData.map((_:any, timeIndex: number) => {
          const dataPoint: any = {
            date: format(new Date(btcData[timeIndex].timestamp), 'MMM dd yyyy'),
          };
          
          // Calculate and store BTC data
          const btcInitialPrice = btcData[0].close;
          const btcCurrentPrice = btcData[timeIndex].close;
          dataPoint.btc = ((btcCurrentPrice - btcInitialPrice) / btcInitialPrice) * 100;
          dataPoint.btc_price = btcCurrentPrice;

          // Calculate selected coins performance
          selectedCoins.forEach((coin, coinIndex) => {
            const initialPrice = results[coinIndex][0].close;
            const currentPrice = results[coinIndex][timeIndex].close;
            const performance = ((currentPrice - initialPrice) / initialPrice) * 100;
            dataPoint[`${coin}_hidden`] = performance;
            dataPoint[`${coin}_price`] = currentPrice;
          });

          // Calculate portfolio performance
          const portfolioPerformance = selectedCoins.reduce((acc, coin) => {
            return acc + dataPoint[`${coin}_hidden`];
          }, 0) / selectedCoins.length;

          dataPoint.portfolio = portfolioPerformance;
          
          return dataPoint;
        });

        setChartData(combinedData);
        // Reset brush timeframe when new data is loaded
        setBrushTimeframe([0, combinedData.length - 1]);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCoins, selectedTimeframe]);

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Crypto Backtesting</h1>
        
        {/* Timeframe Selection */}
        <div className="mb-8">
          <h2 className="text-xl mb-4">Select Timeframe</h2>
          <div className="flex gap-2">
            {TIMEFRAME_OPTIONS.map((timeframe) => (
              <button
                key={timeframe.label}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-full ${
                  selectedTimeframe.label === timeframe.label
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coin Selection */}
        <div className="mb-8">
          <h2 className="text-xl mb-4">Select Cryptocurrencies to Compare</h2>
          <div className="flex flex-wrap gap-2">
            {availableCoins.slice(0, 100).map((coin) => (
              <button
                key={coin}
                onClick={() => handleCoinSelection(coin)}
                className={`px-4 py-2 rounded-full ${
                  selectedCoins.includes(coin)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        {/* PnL Summary */}
        {pnlData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl mb-4">Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Portfolio Performance Card */}
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2">Portfolio Performance</h3>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnL.toFixed(2)}%
                </p>
                {chartData.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400">BTC Performance</h4>
                    <p className={`text-lg font-semibold ${
                      chartData[chartData.length - 1].btc >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {chartData[chartData.length - 1].btc.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Individual Coin Performance Cards */}
              {pnlData.map((data) => (
                <div key={data.coin} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold mb-2">{data.coin}</h3>
                  <div className="space-y-2">
                    <p>Initial: ${data.initialPrice.toFixed(2)}</p>
                    <p>Current: ${data.currentPrice.toFixed(2)}</p>
                    <p className={`font-bold ${data.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.pnlPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ value: 'Performance %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                />
                <Legend />
                <Line
                  key="btc"
                  type="monotone"
                  dataKey="btc"
                  stroke="#f7931a"
                  strokeWidth={2}
                  dot={false}
                  name="BTC"
                />
                <Line
                  key="portfolio"
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Portfolio"
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#8884d8"
                  onChange={handleBrushChange}
                  startIndex={brushTimeframe[0]}
                  endIndex={brushTimeframe[1]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}