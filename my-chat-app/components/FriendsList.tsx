"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

export default function FriendsList() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError("");
        const friendsList = await userService.getFriends(token);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't added any friends yet.</p>
        <p className="text-gray-500 mt-2">
          Use the "Find Users" tab to search and add friends!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {userService.getUserInitials(friend)}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {userService.formatUserDisplayName(friend)}
              </div>
              <div className="text-sm text-gray-500">@{friend.username}</div>
            </div>
          </div>

          <button
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            onClick={() => {
              /* TODO: Add chat functionality */
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
