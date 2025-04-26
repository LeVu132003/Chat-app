import { Group } from "@/types/group";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateGroupResponse {
  id: number;
  name: string;
  owner: number;
}

interface CreateGroupData {
  name: string;
  members: string[];
}

class GroupService {
  async getMyGroups(token: string): Promise<Group[]> {
    const response = await fetch(`${API_URL}/v1/groups/mine`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch groups");
    }

    return response.json();
  }

  async createGroup(
    token: string,
    data: CreateGroupData
  ): Promise<CreateGroupResponse> {
    const response = await fetch(`${API_URL}/v1/groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create group");
    }

    return response.json();
  }
}

export const groupService = new GroupService();
