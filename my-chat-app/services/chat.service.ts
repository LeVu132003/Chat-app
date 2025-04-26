import { DirectMessage, Message } from "@/types/message";
import { socketService } from "./socket.service";

interface ChatState {
  messages: Map<string, DirectMessage[]>;
  activeChats: Set<string>;
  isLoading: boolean;
  error: string | null;
}

class ChatService {
  private state: ChatState = {
    messages: new Map(),
    activeChats: new Set(),
    isLoading: false,
    error: null,
  };
  private messageHandlers: ((
    messages: DirectMessage[],
    chatId: string
  ) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];
  private loadingHandlers: ((isLoading: boolean) => void)[] = [];

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    socketService.onMessage((message: Message) => {
      try {
        const directMessage: DirectMessage =
          this.convertToDirectMessage(message);
        this.addMessage(directMessage);
      } catch (error) {
        this.handleError(
          "Failed to process incoming message: " + (error as Error).message
        );
      }
    });

    socketService.onError((error) => {
      this.handleError(`Socket error: ${error.msg.error_msg}`);
    });
  }

  private convertToDirectMessage(message: Message): DirectMessage {
    if (!message.fromUser || !message.toUser) {
      throw new Error("Invalid message format: missing user information");
    }

    return {
      id: message.id || Date.now(),
      content: message.content,
      from_user: parseInt(message.fromUser),
      to_user: parseInt(message.toUser),
      createdAt: message.createdAt || new Date().toISOString(),
      attachment: message.attachment,
      attachmentType: message.attachmentType,
    };
  }

  private handleError(error: string) {
    this.state.error = error;
    this.errorHandlers.forEach((handler) => handler(error));
  }

  private setLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
    this.loadingHandlers.forEach((handler) => handler(isLoading));
  }

  async getDirectMessages(
    token: string,
    userId: number
  ): Promise<DirectMessage[]> {
    try {
      this.setLoading(true);
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages = await response.json();
      const chatId = this.getChatId("me", userId.toString());
      this.state.messages.set(chatId, messages);
      this.state.activeChats.add(chatId);
      this.notifyMessageUpdate(chatId);
      return messages;
    } catch (error) {
      this.handleError(`Failed to fetch messages: ${(error as Error).message}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async sendMessage(
    content: string,
    toUser: string,
    attachment?: string,
    attachmentType?: string
  ) {
    try {
      const chatId = this.getChatId("me", toUser);

      // Add optimistic message
      const optimisticMessage: DirectMessage = {
        id: Date.now(),
        content,
        from_user: -1, // Will be updated when confirmed
        to_user: parseInt(toUser),
        createdAt: new Date().toISOString(),
        attachment,
        attachmentType,
        pending: true, // Mark as pending until confirmed
      };

      this.addMessage(optimisticMessage);

      // Send via socket
      socketService.sendDirectMessage(
        content,
        toUser,
        attachment,
        attachmentType
      );
    } catch (error) {
      this.handleError(`Failed to send message: ${(error as Error).message}`);
      throw error;
    }
  }

  private addMessage(message: DirectMessage) {
    const chatId = this.getChatId(
      message.from_user.toString(),
      message.to_user.toString()
    );

    const currentMessages = this.state.messages.get(chatId) || [];
    const updatedMessages = [...currentMessages, message];

    // Sort messages by creation date
    updatedMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    this.state.messages.set(chatId, updatedMessages);
    this.state.activeChats.add(chatId);
    this.notifyMessageUpdate(chatId);
  }

  getMessages(otherUser: string): DirectMessage[] {
    const chatId = this.getChatId("me", otherUser);
    return this.state.messages.get(chatId) || [];
  }

  onMessagesUpdate(
    handler: (messages: DirectMessage[], chatId: string) => void
  ) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onError(handler: (error: string) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }

  onLoadingChange(handler: (isLoading: boolean) => void) {
    this.loadingHandlers.push(handler);
    return () => {
      this.loadingHandlers = this.loadingHandlers.filter((h) => h !== handler);
    };
  }

  private notifyMessageUpdate(chatId: string) {
    const messages = this.state.messages.get(chatId) || [];
    this.messageHandlers.forEach((handler) => handler(messages, chatId));
  }

  private getChatId(user1: string, user2: string): string {
    return [user1, user2].sort().join(":");
  }

  // Clear chat history for a specific user
  clearChat(userId: string) {
    const chatId = this.getChatId("me", userId);
    this.state.messages.delete(chatId);
    this.state.activeChats.delete(chatId);
    this.notifyMessageUpdate(chatId);
  }

  // Clear all chat histories
  clearAllChats() {
    this.state.messages.clear();
    this.state.activeChats.clear();
    this.state.error = null;
  }
}

export const chatService = new ChatService();
