"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { stockPositionsService } from "@/lib/services/stock-positions-service";
import { ProfitLossReport } from "@/components/profit-loss-report";
import { AuthPage } from "@/components/auth-page";
import { Button } from "@/components/ui/button";
import type { Position } from "@/lib/services/stock-positions-service";

export default function ProfitLossPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email);
        await loadPositions();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await stockPositionsService.getAllPositions();
      setPositions(data);
    } catch (err) {
      console.error("Failed to load positions:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setPositions([]);
      setEmail("");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    checkAuth();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Stock Tracker</h1>
            <nav className="flex items-center gap-6">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </a>
              <a
                href="/profit-loss"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                P/L Report
              </a>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </nav>
          </div>
          <span className="text-sm text-gray-600 mt-2 block">{email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="p-8 space-y-8">
          <h2 className="text-3xl font-bold">Profit & Loss Report</h2>
          <ProfitLossReport data={positions} />
        </div>
      </main>
    </div>
  );
}
