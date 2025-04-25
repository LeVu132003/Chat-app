export interface FriendRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
}
