"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { stockPositionsService } from "@/lib/services/stock-positions-service";
import { PortfolioPositions } from "@/components/portfolio-positions";
import { AppHeader } from "@/components/app-header";
import { AuthPage } from "@/components/auth-page";
import { ProfileSettings } from "@/components/profile-settings";
import { PositionForm } from "@/components/position-form";
import { Button } from "@/components/ui/button";
import type { Position } from "@/lib/services/stock-positions-service";
import type { User } from "@/lib/services/auth-service";

export function DashboardContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setIsAuthenticated(true);
        setEmail(currentUser.email);
        setUser(currentUser);
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
    <div className="min-h-screen bg-stone-100">
      <AppHeader
        email={email}
        onLogout={handleLogout}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="max-w-7xl mx-auto">
        <div className="p-8 space-y-8">
          <h2 className="text-3xl font-bold">Portfolio Overview</h2>
          <PortfolioPositions
            positions={positions}
            onAddClick={() => {
              setEditingPosition(null);
              setShowPositionForm(true);
            }}
            onEditClick={(position) => {
              setEditingPosition(position);
              setShowPositionForm(true);
            }}
            onRefresh={loadPositions}
          />
        </div>
      </main>

      {showSettings && user && (
        <ProfileSettings
          user={user}
          onClose={() => setShowSettings(false)}
          onProfileUpdate={checkAuth}
        />
      )}

      {showPositionForm && (
        <PositionForm
          position={editingPosition}
          onClose={() => {
            setShowPositionForm(false);
            setEditingPosition(null);
          }}
          onSuccess={loadPositions}
        />
      )}
    </div>
  );
}
