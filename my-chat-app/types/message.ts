export interface Message {
  content: string;
  fromUser: string;
  toUser?: string;
  createdAt?: string;
}

export interface DirectMessagePayload {
  content: string;
  toUser: string;
}

export interface SocketErrorResponse {
  msg_topic: string;
  msg_type: "error";
  msg: {
    error_type: string;
    error_msg: string;
  };
}
