import { useEffect, useRef, useState } from "react";
import { DirectMessage } from "@/types/message";
import { chatService } from "@/services/chat.service";
import { socketService } from "@/services/socket.service";
import { useAuth } from "@/contexts/AuthContext";
import ChatMessage from "./ChatMessage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";

interface ChatProps {
  otherUser: string;
  otherUserId: number;
}

export default function Chat({ otherUser, otherUserId }: ChatProps) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
    }
    return () => socketService.disconnect();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError("");
        const directMessages = await chatService.getDirectMessages(
          token,
          otherUserId
        );
        setMessages(directMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [token, otherUserId]);

  useEffect(() => {
    // Subscribe to message updates
    const unsubscribe = chatService.onMessagesUpdate(
      (updatedMessages: DirectMessage[]) => {
        setMessages((prevMessages: DirectMessage[]) => {
          // Filter out messages that are already in the list
          const newMessages = updatedMessages.filter(
            (msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id)
          );
          return [...prevMessages, ...newMessages];
        });
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    chatService.sendMessage(newMessage.trim(), otherUserId.toString());
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 rounded-lg shadow-sm">
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={{
                id: message.id,
                content: message.content,
                fromUser: message.from_user.toString(),
                createdAt: message.createdAt,
              }}
              isOwnMessage={message.from_user === user?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
