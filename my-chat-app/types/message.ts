export interface Message {
  id?: number;
  content: string;
  fromUser?: string;
  toUser?: string;
  createdAt?: string;
  attachment?: string;
  attachmentType?: string;
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
