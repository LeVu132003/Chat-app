"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { profileService } from "@/services/profile.service";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshProfile = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const profile = await profileService.getProfile(token);
        console.log("profile", profile);
        // The profile will be automatically updated in the AuthContext
      } catch (err) {
        setError("Failed to load profile");
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    refreshProfile();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="mt-1 text-gray-900">{user?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="mt-1 text-gray-900">{user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="mt-1 text-gray-900">@{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="mt-1 text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
