"use client";

import { useEffect, useState } from "react";
import { FriendRequest } from "@/types/friend";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FriendRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingIds, setProcessingIds] = useState<number[]>([]);

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

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleAccept = async (requestId: number) => {
    if (!token) return;

    try {
      setProcessingIds((prev) => [...prev, requestId]);
      await userService.acceptFriendRequest(token, requestId);

      // Remove the accepted request from the list
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      toast.success("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request:", err);
      toast.error("Failed to accept friend request");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

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
  console.log("Incoming requests", requests);
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {request.first_name[0]}
              {request.last_name[0]}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {request.first_name} {request.last_name}
              </div>
              <div className="text-sm text-gray-500">{request.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => handleAccept(request.id)}
              disabled={processingIds.includes(request.id)}
            >
              {processingIds.includes(request.id) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
