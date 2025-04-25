import io from "socket.io-client";
import { Socket } from "socket.io-client";
import { Message, SocketErrorResponse } from "@/types/message";

class SocketService {
  private socket: typeof Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private errorHandlers: ((error: SocketErrorResponse) => void)[] = [];

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
      auth: {
        token,
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    this.socket.on("directMessage", (message: Message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on("error", (error: SocketErrorResponse) => {
      this.errorHandlers.forEach((handler) => handler(error));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendDirectMessage(content: string, toUser: string) {
    if (!this.socket?.connected) {
      throw new Error("Not connected to WebSocket server");
    }

    this.socket.emit("directMessage", {
      content,
      toUser,
    });
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
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
