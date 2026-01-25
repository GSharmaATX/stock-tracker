/**
 * Service to fetch Robinhood stock holdings
 * Calls the Python Flask API
 */

export interface RobinhoodHolding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  equity: number;
  percentChange: number;
  intraday_return: number;
}

export interface RobinhoodResponse {
  success: boolean;
  holdings: RobinhoodHolding[];
  totalEquity: number;
  count: number;
}

const ROBINHOOD_API_URL =
  process.env.NEXT_PUBLIC_ROBINHOOD_API_URL || "http://localhost:5000";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  data: RobinhoodHolding[];
  timestamp: number;
}

let holdingsCache: CacheEntry | null = null;

export class RobinhoodService {
  /**
   * Fetch all holdings from Robinhood
   * Uses cache if available and not expired
   */
  static async getHoldings(forceRefresh = false): Promise<RobinhoodHolding[]> {
    try {
      // Return cached data if available and not expired
      if (!forceRefresh && holdingsCache) {
        const cacheAge = Date.now() - holdingsCache.timestamp;
        if (cacheAge < CACHE_TTL) {
          console.log(
            `Returning cached holdings (age: ${Math.round(cacheAge / 1000)}s)`,
          );
          return holdingsCache.data;
        }
      }

      console.log(`Fetching Robinhood holdings from ${ROBINHOOD_API_URL}`);

      const response = await fetch(
        `${ROBINHOOD_API_URL}/api/robinhood/holdings`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: RobinhoodResponse = await response.json();

      if (!data.success) {
        throw new Error(
          data.holdings ? "Failed to fetch holdings" : "Unknown error",
        );
      }

      // Update cache
      holdingsCache = {
        data: data.holdings,
        timestamp: Date.now(),
      };

      console.log(`Successfully fetched ${data.count} holdings from Robinhood`);
      return data.holdings;
    } catch (err) {
      console.error(
        "Failed to fetch Robinhood holdings:",
        err instanceof Error ? err.message : String(err),
      );
      // Return cached data if available, even if expired
      if (holdingsCache) {
        console.log("Returning expired cache due to fetch error");
        return holdingsCache.data;
      }
      return [];
    }
  }

  /**
   * Get total equity across all holdings
   */
  static async getTotalEquity(forceRefresh = false): Promise<number> {
    try {
      const holdings = await this.getHoldings(forceRefresh);
      return holdings.reduce((sum, holding) => sum + holding.equity, 0);
    } catch (err) {
      console.error(
        "Failed to fetch total equity:",
        err instanceof Error ? err.message : String(err),
      );
      return 0;
    }
  }

  /**
   * Clear the cache manually
   */
  static clearCache(): void {
    holdingsCache = null;
    console.log("Holdings cache cleared");
  }

  /**
   * Get cache age in seconds
   */
  static getCacheAge(): number | null {
    if (!holdingsCache) return null;
    return Math.round((Date.now() - holdingsCache.timestamp) / 1000);
  }
}
