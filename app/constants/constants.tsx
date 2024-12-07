export const TRADING_PAIRS = [
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'XRP',
  'ADA',
  'AVAX',
  'DOGE',
  'DOT',
  'MATIC',
  'LINK',
  'UNI',
  'ATOM',
  'LTC',
  'OP',
  'NEAR',
  'APT',
  'ARB',
  'FTM',
  'ALGO',
  'SAND',
  'MANA',
  'GALA',
  'SUI',
  'TIA',
  'SEI',
  'RNDR',
  'IMX',
  'INJ',
  'FET',
  'ROSE',
  'ZIL',
  'OCEAN',
  'BLUR',
  'AGIX',
  'ORCA',
  'ZK',
  '1INCH',
] as const;

export type TradingPair = typeof TRADING_PAIRS[number];

export const TIMEFRAME_OPTIONS = [
  { label: '1 Week', days: 7, interval: '1h' },
  { label: '1 Month', days: 30, interval: '4h' },
  { label: '3 Months', days: 90, interval: '1d' },
  { label: '6 Months', days: 180, interval: '1d' },
  { label: '1 Year', days: 365, interval: '1d' },
] as const;

export interface TimeframeOption {
  label: string;
  days: number;
  interval: string;
}
