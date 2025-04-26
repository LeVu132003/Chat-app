"use client";

import { User, OutgoingRequestUser } from "@/types/user";
import { userService } from "@/services/user.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { UserPlus, Check, Loader2, Search } from "lucide-react";

export default function UserList() {
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<
    OutgoingRequestUser[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingRequests, setProcessingRequests] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;
      try {
        const friendsList = await userService.getFriends(token);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    const fetchOutgoingRequests = async () => {
      if (!token) return;
      try {
        const requests = await userService.getOutgoingFriendRequests(token);
        setOutgoingRequests(requests);
      } catch (err) {
        console.error("Error fetching outgoing requests:", err);
      }
    };

    fetchFriends();
    fetchOutgoingRequests();
  }, [token]);

  // Search users when the debounced search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!token || !debouncedSearch) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const results = await userService.searchUsers(token, {
          username: debouncedSearch,
        });
        // Filter out the current user from search results
        const filteredResults = results.filter((u) => u.id !== user?.id);
        setUsers(filteredResults);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Failed to search users");
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, token, user?.id]);

  const handleSendRequest = async (username: string) => {
    if (!token) return;

    try {
      setProcessingRequests((prev) => [...prev, username]);
      await userService.sendFriendRequest(token, username);

      // Update outgoing requests list
      const requests = await userService.getOutgoingFriendRequests(token);
      setOutgoingRequests(requests);

      toast.success("Friend request sent!");
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error("Failed to send friend request");
    } finally {
      setProcessingRequests((prev) => prev.filter((u) => u !== username));
    }
  };

  const isFriend = (userId: number) => {
    return friends.some((friend) => friend.id === userId);
  };

  const hasOutgoingRequest = (userId: number) => {
    return outgoingRequests.some((request) => request.user_id === userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          startIcon={Search}
          type="text"
          placeholder="Search users by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w"
        />
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {userService.getUserInitials(user)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {userService.formatUserDisplayName(user)}
                </div>
                <div className="text-sm text-gray-500">@{user.username}</div>
              </div>
            </div>

            {!isFriend(user.id) && (
              <div>
                {hasOutgoingRequest(user.id) ? (
                  <Button variant="outline" disabled className="text-gray-500">
                    <Check className="w-4 h-4 mr-2" />
                    Request Sent
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleSendRequest(user.username)}
                    disabled={processingRequests.includes(user.username)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    {processingRequests.includes(user.username) ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Add Friend
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && <div className="text-red-500 py-4">{error}</div>}
        {!isLoading && !error && users.length === 0 && searchTerm && (
          <div className="text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}
