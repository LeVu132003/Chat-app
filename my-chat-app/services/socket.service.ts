import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { Message, SocketErrorResponse } from "@/types/message";

interface ServerResponse {
  msg_type: string;
  msg: {
    error_type: string;
    error_msg: string;
  };
}

class SocketService {
  private socket: typeof Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private errorHandlers: ((error: SocketErrorResponse) => void)[] = [];
  private groupMessageHandlers: ((message: any) => void)[] = [];
  private groupUpdateHandlers: ((update: any) => void)[] = [];
  private messageSentHandlers: ((confirmation: any) => void)[] = [];

  connect(token: string) {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    console.log(
      "Attempting to connect to WebSocket server with token:",
      token.substring(0, 10) + "..."
    );

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
      transports: ["polling", "websocket"],
      upgrade: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: {
        token,
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server! Socket ID:", this.socket?.id);
    });

    this.socket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
      this.errorHandlers.forEach((handler) =>
        handler({
          msg_topic: "connection",
          msg_type: "error",
          msg: {
            error_type: "CONNECTION_ERROR",
            error_msg: err.message,
          },
        })
      );
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Disconnected from WebSocket server. Reason:", reason);
    });

    this.socket.on("response", (response: ServerResponse) => {
      console.log("Server response:", response);
      if (response.msg_type === "error") {
        this.errorHandlers.forEach((handler) =>
          handler({
            msg_topic: "server",
            msg_type: "error",
            msg: {
              error_type: response.msg.error_type,
              error_msg: response.msg.error_msg,
            },
          })
        );
      }
    });

    this.socket.on("directMessage", (message: Message) => {
      console.log("New message received:", message);
      this.messageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on("groupMessage", (message: any) => {
      console.log("New group message received:", message);
      this.groupMessageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on("groupUpdate", (update: any) => {
      console.log("Group update received:", update);
      this.groupUpdateHandlers.forEach((handler) => handler(update));
    });

    this.socket.on("messageSent", (confirmation: any) => {
      console.log("Message sent confirmation:", confirmation);
      this.messageSentHandlers.forEach((handler) => handler(confirmation));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendDirectMessage(
    content: string,
    toUser: string,
    attachment?: string,
    attachmentType?: string
  ) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }

    console.log(`Sending message to ${toUser}: ${content}`);
    this.socket.emit("directMessage", {
      content,
      toUser,
      attachment,
      attachmentType,
    });
  }

  sendGroupMessage(
    groupId: number,
    content: string,
    attachment?: string,
    attachmentType?: string
  ) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }

    console.log(`Sending message to group ${groupId}: ${content}`);
    this.socket.emit("groupMessage", {
      groupId,
      content,
      attachment,
      attachmentType,
    });
  }

  sendFriendRequest(toUsername: string) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }

    this.socket.emit("friendRequest", { toUsername });
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onGroupMessage(handler: (message: any) => void) {
    this.groupMessageHandlers.push(handler);
    return () => {
      this.groupMessageHandlers = this.groupMessageHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onGroupUpdate(handler: (update: any) => void) {
    this.groupUpdateHandlers.push(handler);
    return () => {
      this.groupUpdateHandlers = this.groupUpdateHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onMessageSent(handler: (confirmation: any) => void) {
    this.messageSentHandlers.push(handler);
    return () => {
      this.messageSentHandlers = this.messageSentHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onError(handler: (error: SocketErrorResponse) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }
}

export const socketService = new SocketService();
