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
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  // Initialize theme from localStorage
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme =
      (saved as "light" | "dark" | null) || (prefersDark ? "dark" : "light");
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 shadow-sm backdrop-blur-md transition-colors dark:bg-gray-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Tracker
          </h1>
          <nav className="flex items-center gap-3 sm:gap-4">
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium dark:text-gray-200 dark:hover:text-white"
            >
              Dashboard
            </a>
            <a
              href="/robinhood"
              className="text-gray-600 hover:text-gray-900 font-medium dark:text-gray-200 dark:hover:text-white"
            >
              Robinhood
            </a>
            <a
              href="/profit-loss"
              className="text-gray-600 hover:text-gray-900 font-medium dark:text-gray-200 dark:hover:text-white"
            >
              P/L Report
            </a>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              title="Toggle light/dark"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </Button>
            {onSettingsClick && (
              <Button onClick={onSettingsClick} variant="outline" size="sm">
                Settings
              </Button>
            )}
            {onLogout && (
              <Button onClick={onLogout} variant="outline" size="sm">
                Logout
              </Button>
            )}
          </nav>
        </div>
        <div className="mt-2 flex items-center justify-between">
          {userEmail && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {userEmail}
            </span>
          )}
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="sm:hidden"
            title="Toggle light/dark"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
        </div>
      </div>
    </header>
  );
}
