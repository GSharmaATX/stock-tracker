"use client";

import { useEffect, useState } from "react";
import {
  RobinhoodService,
  RobinhoodHolding,
} from "@/lib/services/robinhood-service";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function RobinhoodPortfolio() {
  const [holdings, setHoldings] = useState<RobinhoodHolding[]>([]);
  const [totalEquity, setTotalEquity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<
    "symbol" | "equity" | "percentChange"
  >("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchHoldings();
  }, []);

  const sortHoldings = (
    data: RobinhoodHolding[],
    column: "symbol" | "equity" | "percentChange",
    direction: "asc" | "desc",
  ) => {
    const sorted = [...data].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (column === "symbol") {
        aValue = a.symbol;
        bValue = b.symbol;
      } else if (column === "equity") {
        aValue = a.equity;
        bValue = b.equity;
      } else if (column === "percentChange") {
        aValue = a.percentChange;
        bValue = b.percentChange;
      }

      if (typeof aValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return direction === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  };

  const handleColumnSort = (column: "symbol" | "equity" | "percentChange") => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedHoldings = () => {
    return sortHoldings(holdings, sortColumn, sortDirection);
  };

  const SortIcon = ({
    column,
  }: {
    column: "symbol" | "equity" | "percentChange";
  }) => {
    if (sortColumn !== column) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const fetchHoldings = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await RobinhoodService.getHoldings(forceRefresh);
      setHoldings(data);

      // Calculate total equity
      const total = data.reduce((sum, holding) => sum + holding.equity, 0);
      setTotalEquity(total);

      // Update cache age
      const age = RobinhoodService.getCacheAge();
      setCacheAge(age);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch Robinhood holdings",
      );
      console.error("Error fetching holdings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchHoldings(true);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Loading Robinhood holdings...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-semibold">Error loading Robinhood data</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">
            Make sure the Python API service is running on http://localhost:5000
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="mt-4"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Retry"}
          </Button>
        </div>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          No holdings found in Robinhood account
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Robinhood Portfolio</h2>
            <p className="text-3xl font-semibold text-green-600">
              ${totalEquity.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Equity Value</p>
            {cacheAge !== null && (
              <p className="text-xs text-gray-400 mt-2">
                Cache age: {cacheAge} seconds
              </p>
            )}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleColumnSort("symbol")}
                >
                  Symbol <SortIcon column="symbol" />
                </th>
                <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold">
                  Avg Buy Price
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleColumnSort("equity")}
                >
                  Equity <SortIcon column="equity" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleColumnSort("percentChange")}
                >
                  % Change <SortIcon column="percentChange" />
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedHoldings().map((holding) => (
                <tr key={holding.symbol} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{holding.symbol}</td>
                  <td className="py-3 px-4 text-right">
                    {holding.quantity.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${holding.averageBuyPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    ${holding.equity.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      holding.percentChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {holding.percentChange >= 0 ? "+" : ""}
                    {holding.percentChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
