import { Message, MessageType } from "@/types/message";

// Interface cho response từ API
interface DirectMessageResponse {
  id: number;
  fromUser: number;
  toUser: number;
  content: string;
  attachment: string | null;
  attachmentType: string | null;
  createdAt: string;
}

export class MessageService {
  private static baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://chatchick.azurewebsites.net";

  /**
   * Lấy tin nhắn trực tiếp với một người dùng cụ thể
   * @param targetUserId - ID của người dùng cần lấy tin nhắn
   * @returns Promise<Message[]>
   */
  static async getDirectMessages(targetUserId: string): Promise<Message[]> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await fetch(
        `${this.baseUrl}/v1/direct-messages?with=${targetUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const messages: DirectMessageResponse[] = await response.json();
      const currentUserId = this.getCurrentUserId();

      return messages.map((msg) => ({
        id: msg.id.toString(),
        content: msg.content,
        fromUser:
          msg.fromUser === currentUserId ? "You" : `User ${msg.fromUser}`,
        timestamp: new Date(msg.createdAt).toISOString(),
        type: "direct" as MessageType,
        attachment: msg.attachment || undefined,
        attachmentType: msg.attachmentType || undefined,
      }));
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      throw error;
    }
  }

  private static getCurrentUserId(): number {
    const token = localStorage.getItem("token");
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return 0;
    }
  }
}
