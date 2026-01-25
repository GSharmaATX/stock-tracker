"use client";

import { useState, useEffect } from "react";
import { stockPositionsService } from "@/lib/services/stock-positions-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Position } from "@/lib/services/stock-positions-service";

interface PositionFormProps {
  position?: Position | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PositionForm({
  position,
  onClose,
  onSuccess,
}: PositionFormProps) {
  const [symbol, setSymbol] = useState("");
  const [sharesQty, setSharesQty] = useState("");
  const [avgCostBasis, setAvgCostBasis] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (position) {
      setSymbol(position.symbol);
      setSharesQty(position.shares_qty.toString());
      setAvgCostBasis(position.avg_cost_basis.toString());
      setCurrentPrice(position.current_price.toString());
    }
  }, [position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const positionData = {
        symbol: symbol.toUpperCase(),
        shares_qty: parseFloat(sharesQty),
        avg_cost_basis: parseFloat(avgCostBasis),
        current_price: parseFloat(currentPrice),
      };

      if (position) {
        // Update existing position
        await stockPositionsService.updatePosition(position.id, positionData);
      } else {
        // Create new position
        await stockPositionsService.createPosition(positionData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {position ? "Update Position" : "Add New Position"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol *
            </label>
            <Input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., AAPL"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shares Quantity *
            </label>
            <Input
              type="number"
              step="0.01"
              value={sharesQty}
              onChange={(e) => setSharesQty(e.target.value)}
              placeholder="Number of shares"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Cost Basis *
            </label>
            <Input
              type="number"
              step="0.01"
              value={avgCostBasis}
              onChange={(e) => setAvgCostBasis(e.target.value)}
              placeholder="Cost per share"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price *
            </label>
            <Input
              type="number"
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Current price per share"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : position
                  ? "Update Position"
                  : "Add Position"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
