"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/services/auth-service";

interface AppHeaderProps {
  email?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
}

export function AppHeader({
  email,
  onLogout,
  onSettingsClick,
}: AppHeaderProps) {
  const [userEmail, setUserEmail] = useState(email || "");

  useEffect(() => {
    if (!email) {
      // Fetch user email if not provided
      const fetchEmail = async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setUserEmail(user.email);
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      };
      fetchEmail();
    }
  }, [email]);

  return (
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
              href="/robinhood"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Robinhood
            </a>
            <a
              href="/profit-loss"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              P/L Report
            </a>
            {onSettingsClick && (
              <Button onClick={onSettingsClick} variant="outline">
                Settings
              </Button>
            )}
            {onLogout && (
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            )}
          </nav>
        </div>
        {userEmail && (
          <span className="text-sm text-gray-600 mt-2 block">{userEmail}</span>
        )}
      </div>
    </header>
  );
}
