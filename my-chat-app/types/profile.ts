export interface Profile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}
export interface UpdateProfileData {
  email?: string;
  firstName?: string;
  lastName?: string;
}
