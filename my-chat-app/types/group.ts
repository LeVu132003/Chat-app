export interface GroupMember {
  userId: number;
  username: string;
}

export interface Group {
  id: number;
  name: string;
  owner: number;
  members: GroupMember[];
}
