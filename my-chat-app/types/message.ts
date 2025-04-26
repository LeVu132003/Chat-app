export type MessageType = "direct" | "group";

export interface Message {
  id: string;
  content: string;
  fromUser: string;
  timestamp: string;
  type: MessageType;
}

export interface DirectMessage {
  id: number;
  content: string;
  from_user: number;
  to_user: number;
  createdAt: string;
  attachment?: string;
  attachmentType?: string;
  pending?: boolean;
}

export interface DirectMessagePayload {
  content: string;
  toUser: string;
}

export interface SocketErrorResponse {
  msg_topic: string;
  msg_type: string;
  msg: {
    error_type: string;
    error_msg: string;
  };
}
