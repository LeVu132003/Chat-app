import { DirectMessage, Message } from "@/types/message";
import { socketService } from "./socket.service";

class ChatService {
  private messages: Map<string, DirectMessage[]> = new Map();
  private messageHandlers: ((messages: DirectMessage[]) => void)[] = [];

  constructor() {
    socketService.onMessage((message: Message) => {
      // Convert socket message to DirectMessage format
      const directMessage: DirectMessage = {
        id: message.id || Date.now(),
        content: message.content,
        from_user: parseInt(message.fromUser),
        to_user: parseInt(message.toUser || "0"),
        createdAt: message.createdAt || new Date().toISOString(),
      };
      this.addMessage(directMessage);
    });
  }

  private addMessage(message: DirectMessage) {
    const chatId = this.getChatId(
      message.from_user.toString(),
      message.to_user.toString()
    );
    if (!this.messages.has(chatId)) {
      this.messages.set(chatId, []);
    }

    const messages = this.messages.get(chatId)!;
    messages.push(message);
    this.messages.set(chatId, messages);

    // Notify subscribers
    this.messageHandlers.forEach((handler) => handler(messages));
  }

  async getDirectMessages(
    token: string,
    userId: number
  ): Promise<DirectMessage[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/direct-messages?with=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch direct messages");
    }

    const messages = await response.json();
    return messages;
  }

  sendMessage(content: string, toUser: string) {
    socketService.sendDirectMessage(content, toUser);

    // Add message to local state immediately for optimistic UI update
    const directMessage: DirectMessage = {
      id: Date.now(), // Temporary ID that will be replaced by server
      content,
      from_user: -1, // Will be replaced by actual user ID from server
      to_user: parseInt(toUser),
      createdAt: new Date().toISOString(),
    };
    this.addMessage(directMessage);
  }

  getMessages(otherUser: string): DirectMessage[] {
    const chatId = this.getChatId("me", otherUser);
    return this.messages.get(chatId) || [];
  }

  onMessagesUpdate(handler: (messages: DirectMessage[]) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  private getChatId(user1: string, user2: string): string {
    return [user1, user2].sort().join(":");
  }
}

export const chatService = new ChatService();
