import { SearchUsersParams, User } from "@/types/user";
import { FriendRequest } from "@/types/friend";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class UserService {
  async searchUsers(token: string, params: SearchUsersParams): Promise<User[]> {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params.username) {
      queryParams.append("username", params.username);
    }
    if (params.email) {
      queryParams.append("email", params.email);
    }

    const response = await fetch(
      `${API_URL}/v1/users/search?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search users");
    }

    return response.json();
  }

  async getFriends(token: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/v1/friends`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch friends");
    }

    return response.json();
  }

  async getIncomingFriendRequests(token: string): Promise<FriendRequest[]> {
    const response = await fetch(`${API_URL}/v1/friends/requests/incoming`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch friend requests");
    }

    return response.json();
  }

  // Helper method to format user display name
  formatUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  // Helper method to get user initials
  getUserInitials(user: User): string {
    return (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  }
}

export const userService = new UserService();
