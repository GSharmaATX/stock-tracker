"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { StockPriceService } from "@/lib/services/stock-price-service";

export function ProfitLossReport({ data }: { data: any[] }) {
  const [liveprices, setLivePrice] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const fetchLivePrices = async () => {
    if (!data || data.length === 0) return;

    setLoadingPrices(true);
    const fallbackPrices: Record<string, number> = {};

    // Create fallback prices map from positions
    data.forEach((pos) => {
      fallbackPrices[pos.symbol] = pos.current_price;
    });

    try {
      const prices = await StockPriceService.getStockPrices(
        data.map((p) => p.symbol),
        fallbackPrices,
      );

      setLivePrice(prices);
      console.log("Live prices fetched successfully:", prices);
    } catch (err) {
      console.error("Failed to fetch live prices:", err);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const abortController = new AbortController();

      const loadPrices = async () => {
        await fetchLivePrices();
      };

      loadPrices();

      return () => abortController.abort();
    }
  }, [data]);

  const chartData = data.map((pos) => ({
    name: pos.symbol,
    pl:
      ((liveprices[pos.symbol] || pos.current_price) - pos.avg_cost_basis) *
      pos.shares_qty,
  }));

  return (
    <Card className="p-6 w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Profit & Loss by Asset</h2>
        <Button
          onClick={fetchLivePrices}
          variant="outline"
          size="sm"
          disabled={loadingPrices}
        >
          {loadingPrices ? "Refreshing..." : "Refresh Prices"}
        </Button>
      </div>
      <div className="w-full h-[400px] min-w-0">
        <ChartContainer
          config={{ pl: { label: "P/L", color: "hsl(var(--primary))" } }}
          className="w-full h-full"
        >
          <BarChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pl" fill="var(--color-pl)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
