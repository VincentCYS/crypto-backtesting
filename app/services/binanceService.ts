import axios from 'axios';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export interface KlineData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export async function fetchKlineData(symbol: string, interval: string = '1d', limit: number = 365) {
    try {
        const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
            params: {
                symbol: symbol.toUpperCase(),
                interval,
                limit
            }
        });

        return response.data.map((kline: any[]) => ({
            timestamp: kline[0],
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4])
        }));
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        throw error;
    }
}

export async function getAvailableSymbols() {
    try {
        const response = await axios.get(`${BINANCE_API_BASE}/exchangeInfo`);
        return response.data.symbols
            .filter((symbol: any) => symbol.quoteAsset === 'USDT')
            .map((symbol: any) => symbol.baseAsset);
    } catch (error) {
        console.error('Error fetching available symbols:', error);
        throw error;
    }
} 