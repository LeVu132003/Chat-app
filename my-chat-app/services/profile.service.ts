import { Profile } from "@/types/profile";
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
    console.log("response", response);
    return response.json();
  }
}

export const profileService = new ProfileService();
