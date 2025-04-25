export interface FriendRequest {
  id: number;
  from_user: number;
  to_user: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}
