"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth-service";
import RobinhoodPortfolio from "@/components/robinhood-portfolio";
import { AppHeader } from "@/components/app-header";
import { AuthPage } from "@/components/auth-page";
import type { User } from "@/lib/services/auth-service";

export default function RobinhoodPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
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
      <AppHeader email={user?.email} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto">
        <div className="p-8">
          <RobinhoodPortfolio />
        </div>
      </main>
    </div>
  );
}
