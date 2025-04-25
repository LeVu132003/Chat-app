"use client";

import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function UserList() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);

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
        setUsers(results);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Failed to search users");
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, token]);

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
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w"
        />
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
          >
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
        ))}

        {!isLoading && !error && users.length === 0 && searchTerm && (
          <div className="text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}
