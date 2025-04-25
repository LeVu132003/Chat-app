"use client";

import { useEffect, useState } from "react";
import { FriendRequest } from "@/types/friend";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function FriendRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError("");
        const incomingRequests = await userService.getIncomingFriendRequests(
          token
        );
        setRequests(incomingRequests);
      } catch (err) {
        console.error("Error fetching friend requests:", err);
        setError("Failed to load friend requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
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

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {request.from_user
                ? userService.getUserInitials(request.from_user)
                : "?"}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {request.from_user
                  ? userService.formatUserDisplayName(request.from_user)
                  : `User #${request.from_user}`}
              </div>
              <div className="text-sm text-gray-500">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                /* TODO: Add reject functionality */
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => {
                /* TODO: Add accept functionality */
              }}
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
