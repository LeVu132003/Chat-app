import { Profile, UpdateProfileData } from "@/types/profile";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ProfileService {
  async getProfile(token: string): Promise<Profile> {
    const response = await fetch(`${API_URL}/v1/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  }

  async updateProfile(
    token: string,
    data: UpdateProfileData
  ): Promise<Profile> {
    const response = await fetch(`${API_URL}/v1/users/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

export const profileService = new ProfileService();
