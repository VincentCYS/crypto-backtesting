'use client';

import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Chart } from './components/Chart';
import { CoinSelector } from './components/CoinSelector';
import { PerformanceSummary } from './components/PerformanceSummary';
import { TimeframeSelector } from './components/TimeframeSelector';
import { TIMEFRAME_OPTIONS, TimeframeOption } from './constants/constants';
import { fetchKlineData, getAvailableSymbols, KlineData } from './services/binanceService';

interface PnLData {
  coin: string;
  initialPrice: number;
  currentPrice: number;
  pnlPercentage: number;
  weight?: number;
}

const calculateWeightedPnL = (data: PnLData[]) => {
  const defaultWeight = 100 / data.length;
  return data.reduce((acc, coin) => {
    const weight = coin.weight ?? defaultWeight;
    return acc + (coin.pnlPercentage * weight / 100);
  }, 0);
};

export default function Home() {
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<PnLData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPnL, setTotalPnL] = useState<number>(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[4]); // Default to 1 Year
  const [brushTimeframe, setBrushTimeframe] = useState<[number, number]>([0, 100]); // Percentage values
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [comparisonCoin, setComparisonCoin] = useState('');
  const [comparisonCoins, setComparisonCoins] = useState<string[]>([]);
  const [comparisonPnL, setComparisonPnL] = useState<number>(0);
  const [comparisonPnlData, setComparisonPnlData] = useState<PnLData[]>([]);
  const [isComparisonDropdownOpen, setIsComparisonDropdownOpen] = useState(false);
  const [comparisonSearchTerm, setComparisonSearchTerm] = useState('');
  const comparisonDropdownRef = useRef<HTMLDivElement>(null);
  const filteredComparisonCoins = availableCoins.filter(coin =>
    coin.toLowerCase().includes(comparisonSearchTerm.toLowerCase())
  );

  useEffect(() => {
    // Fetch available coins on component mount
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

  const handleCoinSelection = async (coin: string) => {
    if (selectedCoins.includes(coin)) {
      setSelectedCoins(selectedCoins.filter(c => c !== coin));
    } else {
      setSelectedCoins([...selectedCoins, coin]);
    }
  };

  const calculatePnL = (results: KlineData[][], selectedCoins: string[], setPnlData: React.Dispatch<React.SetStateAction<PnLData[]>>, setTotalPnL: React.Dispatch<React.SetStateAction<number>>) => {
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

  const handleWeightChange = (portfolio: 1 | 2, coinToUpdate: string, newWeight: number) => {
    const updatePortfolioWeights = (prevData: PnLData[]) => {
      const otherCoins = prevData.filter(d => d.coin !== coinToUpdate);
      const totalOtherWeight = 100 - newWeight;
      const weightRatio = totalOtherWeight / otherCoins.reduce((sum, coin) => sum + (coin.weight ?? (100 / prevData.length)), 0);
      
      return prevData.map(data => {
        if (data.coin === coinToUpdate) {
          return { ...data, weight: newWeight };
        }
        return { 
          ...data, 
          weight: ((data.weight ?? (100 / prevData.length)) * weightRatio)
        };
      });
    };

    if (portfolio === 1) {
      setPnlData(prev => {
        const updated = updatePortfolioWeights(prev);
        const newTotalPnL = calculateWeightedPnL(updated);
        setTotalPnL(newTotalPnL);
        return updated;
      });
    } else {
      setComparisonPnlData(prev => {
        const updated = updatePortfolioWeights(prev);
        const newComparisonPnL = calculateWeightedPnL(updated);
        setComparisonPnL(newComparisonPnL);
        return updated;
      });
    }

    // Update chart data with new weights
    setChartData(prev => prev.map(point => {
      const newPoint = { ...point };
      const data = portfolio === 1 ? pnlData : comparisonPnlData;
      const key = portfolio === 1 ? 'portfolio' : 'comparison';
      
      if (point[key] !== undefined) {
        const weightedPerf = data.reduce((acc, coinData) => {
          const weight = coinData.coin === coinToUpdate ? newWeight : (coinData.weight ?? (100 / data.length));
          return acc + (point[`${coinData.coin}_perf`] || 0) * (weight / 100);
        }, 0);
        newPoint[key] = weightedPerf;
      }
      
      return newPoint;
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCoins.length === 0 && comparisonCoins.length === 0) {
        setChartData([]);
        setPnlData([]);
        setComparisonPnlData([]);
        setTotalPnL(0);
        setComparisonPnL(0);
        return;
      }

      setLoading(true);
      try {
        // Fetch data for both portfolios
        const promises = [
          ...selectedCoins.map(coin => 
            fetchKlineData(`${coin}USDT`, selectedTimeframe.interval, selectedTimeframe.days)
          ),
          ...comparisonCoins.map(coin => 
            fetchKlineData(`${coin}USDT`, selectedTimeframe.interval, selectedTimeframe.days)
          )
        ];
        
        const results = await Promise.all(promises);
        
        // Calculate PnL for main portfolio
        if (selectedCoins.length > 0) {
          const mainResults = results.slice(0, selectedCoins.length);
          calculatePnL(mainResults, selectedCoins, setPnlData, setTotalPnL);
        }

        // Calculate PnL for comparison portfolio
        if (comparisonCoins.length > 0) {
          const comparisonResults = results.slice(selectedCoins.length);
          calculatePnL(comparisonResults, comparisonCoins, setComparisonPnlData, setComparisonPnL);
        }

        // Combine all data for chart
        const combinedData = results[0].map((_: any, timeIndex: number) => {
          const dataPoint: any = {
            date: format(new Date(results[0][timeIndex].timestamp), 'MMM dd yyyy'),
          };

          // Calculate main portfolio performance
          if (selectedCoins.length > 0) {
            selectedCoins.forEach((coin, coinIndex) => {
              const initialPrice = results[coinIndex][0].close;
              const currentPrice = results[coinIndex][timeIndex].close;
              const perf = ((currentPrice - initialPrice) / initialPrice) * 100;
              dataPoint[`${coin}_perf`] = perf;
            });

            const mainPortfolioPerf = pnlData.reduce((acc, coin) => {
              const weight = coin.weight || 100;
              const totalWeight = pnlData.reduce((sum, c) => sum + (c.weight || 100), 0);
              const normalizedWeight = weight / totalWeight;
              return acc + (dataPoint[`${coin.coin}_perf`] || 0) * normalizedWeight;
            }, 0);
            dataPoint.portfolio = mainPortfolioPerf;
          }

          // Calculate comparison portfolio performance
          if (comparisonCoins.length > 0) {
            comparisonCoins.forEach((coin, coinIndex) => {
              const resultIndex = coinIndex + selectedCoins.length;
              const initialPrice = results[resultIndex][0].close;
              const currentPrice = results[resultIndex][timeIndex].close;
              const perf = ((currentPrice - initialPrice) / initialPrice) * 100;
              dataPoint[`${coin}_perf`] = perf;
            });

            const comparisonPortfolioPerf = comparisonPnlData.reduce((acc, coin) => {
              const weight = coin.weight || 100;
              const totalWeight = comparisonPnlData.reduce((sum, c) => sum + (c.weight || 100), 0);
              const normalizedWeight = weight / totalWeight;
              return acc + (dataPoint[`${coin.coin}_perf`] || 0) * normalizedWeight;
            }, 0);
            dataPoint.comparison = comparisonPortfolioPerf;
          }

          return dataPoint;
        });

        setChartData(combinedData);
        setBrushTimeframe([0, combinedData.length - 1]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCoins, selectedTimeframe, comparisonCoins]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold">Crypto Backtesting</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <TimeframeSelector
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
          />
          <CoinSelector
            selectedCoins={selectedCoins}
            handleCoinSelection={handleCoinSelection}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredCoins={filteredCoins}
            dropdownRef={dropdownRef}

          />
          <CoinSelector
            selectedCoins={comparisonCoins}
            handleCoinSelection={(coin) => {
              if (comparisonCoins.includes(coin)) {
                setComparisonCoins(comparisonCoins.filter(c => c !== coin));
              } else {
                setComparisonCoins([...comparisonCoins, coin]);
              }
            }}
            isDropdownOpen={isComparisonDropdownOpen}
            setIsDropdownOpen={setIsComparisonDropdownOpen}
            searchTerm={comparisonSearchTerm}
            setSearchTerm={setComparisonSearchTerm}
            filteredCoins={filteredComparisonCoins}
            dropdownRef={comparisonDropdownRef}
            
          />
        </div>

        {!loading && chartData.length > 0 && (
          <Chart
            chartData={chartData}
            brushTimeframe={brushTimeframe}
            handleBrushChange={handleBrushChange}
            comparisonCoin={comparisonCoin}
          />
        )}

        {pnlData.length > 0 && (
          <PerformanceSummary
            pnlData={pnlData}
            totalPnL={totalPnL}
            chartData={chartData}
            comparisonPnlData={comparisonPnlData}
            comparisonPnL={comparisonPnL}
            onWeightChange={handleWeightChange}
          />
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
}