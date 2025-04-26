import { SearchUsersParams, User, OutgoingRequestUser } from "@/types/user";
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

  async getOutgoingFriendRequests(
    token: string
  ): Promise<OutgoingRequestUser[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/friends/requests/outgoing`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch outgoing friend requests");
    }

    const users = await response.json();
    return users;
  }

  async acceptFriendRequest(token: string, requestId: number): Promise<void> {
    const response = await fetch(`${API_URL}/v1/friends/requests/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      throw new Error("Failed to accept friend request");
    }
  }

  async sendFriendRequest(token: string, toUsername: string): Promise<void> {
    const response = await fetch(`${API_URL}/v1/friends/requests/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toUsername }),
    });

    if (!response.ok) {
      throw new Error("Failed to send friend request");
    }
  }

  // Helper method to format user display name
  formatUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  formatOutgoingUserDisplayName(user: OutgoingRequestUser): string {
    return `${user.first_name} ${user.last_name}`;
  }

  // Helper method to get user initials
  getUserInitials(user: User): string {
    return (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  }

  getOutgoingUserInitials(user: OutgoingRequestUser): string {
    return (user.first_name?.[0] || "") + (user.last_name?.[0] || "");
  }
}

export const userService = new UserService();
