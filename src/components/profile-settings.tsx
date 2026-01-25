"use client";

import { useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { User } from "@/lib/services/auth-service";

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onProfileUpdate: () => void;
}

export function ProfileSettings({
  user,
  onClose,
  onProfileUpdate,
}: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [displayName, setDisplayName] = useState(
    user.user_metadata?.display_name || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await authService.updateProfile({
        display_name: displayName,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Profile updated successfully!");
        onProfileUpdate();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "password"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                {passwordSuccess}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
