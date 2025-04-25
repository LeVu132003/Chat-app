export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface SearchUsersParams {
  username?: string;
  email?: string;
}

export interface SearchUsersResponse {
  users: User[];
}
