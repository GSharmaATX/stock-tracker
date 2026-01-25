"use client";

import { useState, useEffect } from "react";
import { stockPositionsService } from "@/lib/services/stock-positions-service";
import { StockPriceService } from "@/lib/services/stock-price-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Position } from "@/lib/services/stock-positions-service";

interface PortfolioPositionsProps {
  positions: Position[] | null;
  onAddClick: () => void;
  onEditClick: (position: Position) => void;
  onRefresh: () => void;
}

export function PortfolioPositions({
  positions,
  onAddClick,
  onEditClick,
  onRefresh,
}: PortfolioPositionsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [liveprices, setLivePrice] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    if (positions && positions.length > 0) {
      const abortController = new AbortController();

      const loadPrices = async () => {
        await fetchLivePrices();
      };

      loadPrices();

      return () => abortController.abort();
    }
  }, [positions]);

  const fetchLivePrices = async () => {
    if (!positions || positions.length === 0) return;

    setLoadingPrices(true);
    const fallbackPrices: Record<string, number> = {};

    // Create fallback prices map from positions
    positions.forEach((pos) => {
      fallbackPrices[pos.symbol] = pos.current_price;
    });

    try {
      const prices = await StockPriceService.getStockPrices(
        positions.map((p) => p.symbol),
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) {
      return;
    }

    setDeletingId(id);
    setDeleteError("");

    try {
      await stockPositionsService.deletePosition(id);
      onRefresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete position",
      );
      setDeletingId(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Your Positions</h3>
        <div className="flex gap-2">
          <Button onClick={fetchLivePrices} variant="outline" size="sm">
            {loadingPrices ? "Refreshing..." : "Refresh Prices"}
          </Button>
          <Button onClick={onAddClick}>Add Position</Button>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {deleteError}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Avg Cost</TableHead>
            <TableHead>Current Price*</TableHead>
            <TableHead>P/L</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions && positions.length > 0 ? (
            positions.map((pos) => {
              const currentPrice = liveprices[pos.symbol] || pos.current_price;
              const pl = (currentPrice - pos.avg_cost_basis) * pos.shares_qty;

              return (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{pos.symbol}</TableCell>
                  <TableCell>{pos.shares_qty}</TableCell>
                  <TableCell>${pos.avg_cost_basis.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>${currentPrice.toFixed(2)}</span>
                      {liveprices[pos.symbol] &&
                        liveprices[pos.symbol] !== pos.current_price && (
                          <span className="text-xs text-blue-600 font-semibold">
                            (Live)
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={
                      pl > 0 ? "text-green-500" : pl < 0 ? "text-red-500" : ""
                    }
                  >
                    ${pl.toFixed(2)}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      onClick={() => onEditClick(pos)}
                      size="sm"
                      variant="outline"
                      disabled={deletingId === pos.id}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(pos.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      disabled={deletingId === pos.id}
                    >
                      {deletingId === pos.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No positions yet. Add one to get started!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
