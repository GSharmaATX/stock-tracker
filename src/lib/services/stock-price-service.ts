/**
 * Service to fetch real-time stock prices
 * Uses Finnhub API (free tier)
 * Falls back to provided data if API fails
 */

interface StockQuote {
  symbol: string;
  price: number;
  timestamp: number;
}

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// Log API key status on load
if (typeof window !== "undefined") {
  console.log(
    "Finnhub API Key configured:",
    FINNHUB_API_KEY ? "Yes" : "No (prices will use fallback)",
  );
}

// Cache to avoid excessive API calls (5 minute TTL)
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class StockPriceService {
  /**
   * Get current stock price by symbol
   * Uses cached data if available
   */
  static async getStockPrice(
    symbol: string,
    fallbackPrice?: number,
  ): Promise<number> {
    try {
      // Check cache first
      const cached = priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Cache hit for ${symbol}: ${cached.price}`);
        return cached.price;
      }

      // If no API key, use fallback
      if (!FINNHUB_API_KEY) {
        console.warn(
          `No FINNHUB_API_KEY set. Using fallback price for ${symbol}: ${fallbackPrice || 0}`,
        );
        return fallbackPrice || 0;
      }

      const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`;
      console.log(`Fetching price for ${symbol} from ${url}`);

      // Fetch from Finnhub
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Response for ${symbol}:`, data);

      // Check if we got valid data
      if (!data.c || typeof data.c !== "number") {
        throw new Error(
          `Invalid price data for ${symbol}. Got: ${JSON.stringify(data)}`,
        );
      }

      const price = data.c;
      console.log(`Price fetched for ${symbol}: $${price}`);

      // Cache the result
      priceCache.set(symbol, { price, timestamp: Date.now() });

      return price;
    } catch (err) {
      console.warn(
        `Failed to fetch price for ${symbol}:`,
        err instanceof Error ? err.message : String(err),
      );
      console.warn(
        `Using fallback price for ${symbol}: $${fallbackPrice || 0}`,
      );
      // Return fallback price if provided
      return fallbackPrice || 0;
    }
  }

  /**
   * Get prices for multiple stocks
   */
  static async getStockPrices(
    symbols: string[],
    fallbackPrices?: Record<string, number>,
  ): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    // Fetch all prices in parallel with a small delay to avoid rate limiting
    const promises = symbols.map(
      (symbol, index) =>
        new Promise<void>((resolve) => {
          setTimeout(async () => {
            const price = await this.getStockPrice(
              symbol,
              fallbackPrices?.[symbol],
            );
            prices[symbol] = price;
            resolve();
          }, index * 100); // 100ms delay between requests
        }),
    );

    await Promise.all(promises);
    return prices;
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    priceCache.clear();
  }
}
