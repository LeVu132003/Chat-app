export interface Group {
  id: number;
  name: string;
  owner: number;
  members: GroupMember[];
}

export interface CreateGroupResponse {
  id: number;
  name: string;
  owner: number;
}

export interface CreateGroupData {
  name: string;
  members: string[];
}

export interface GroupMember {
  userId: number;
  username: string;
}

export interface GroupDetails extends Group {
  members: GroupMember[];
}
