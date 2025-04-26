import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "@/contexts/SocketContext";
import { MessageService } from "@/services/message.service";

interface ChatProps {
  targetID: string;
  toUsername: string;
  isGroup?: boolean;
}

const Chat = ({ targetID, toUsername, isGroup = false }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");
  const [socketError, setSocketError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [lastSentMessageId, setLastSentMessageId] = useState<string | null>(
    null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load message history
  useEffect(() => {
    const loadMessageHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = isGroup
          ? await MessageService.getGroupMessages(targetID)
          : await MessageService.getDirectMessages(targetID);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load message history:", error);
        setSocketError("Failed to load message history");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessageHistory();
  }, [targetID, isGroup]);

  // Emoji picker handler
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up socket connection and listeners
  useEffect(() => {
    if (!socket) {
      setConnectionStatus("error");
      setSocketError("Socket connection not available");
      return;
    }

    setConnectionStatus(isConnected ? "connected" : "connecting");

    // Handle messages
    const messageHandler = (newMessage: {
      fromUser: string;
      content: string;
      toUser?: string;
      groupId?: number;
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: newMessage.content,
          fromUser: isGroup
            ? newMessage.fromUser
            : newMessage.fromUser === toUsername
            ? newMessage.fromUser
            : "You",
          timestamp: new Date().toISOString(),
          type: isGroup ? "group" : "direct",
          groupId: isGroup ? Number(targetID) : undefined,
        },
      ]);
    };

    if (isGroup) {
      socket.on("groupMessage", messageHandler);
    } else {
      socket.on("directMessage", messageHandler);
    }

    // Handle socket response including errors
    socket.on(
      "response",
      (response: {
        msg_type: string;
        msg: { error_type: string; error_msg: string };
      }) => {
        if (response.msg_type === "error") {
          setConnectionStatus("error");

          // Handle specific error types
          if (response.msg.error_type === "not_friend") {
            setSocketError(
              "You need to be friends with this user to send messages"
            );
            // Remove the optimistically added message if it exists
            if (lastSentMessageId) {
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== lastSentMessageId)
              );
              setLastSentMessageId(null);
            }
          } else {
            setSocketError(response.msg.error_msg || "An error occurred");
          }
        }
      }
    );

    return () => {
      socket.off("directMessage");
      socket.off("groupMessage");
      socket.off("response");
    };
  }, [socket, isConnected, targetID, toUsername, lastSentMessageId, isGroup]);

  const isMessageEmpty = (msg: string) => {
    return msg.trim().length === 0;
  };

  const handleSendMessage = () => {
    if (!message || isMessageEmpty(message) || !socket) {
      return;
    }

    const messageId = uuidv4();
    setLastSentMessageId(messageId);

    // Add message to local state optimistically
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        content: message.trim(),
        fromUser: "You",
        timestamp: new Date().toISOString(),
        type: isGroup ? "group" : "direct",
        groupId: isGroup ? Number(targetID) : undefined,
      },
    ]);

    // Clear any previous errors
    setSocketError("");
    setConnectionStatus("connected");

    // Send the message
    if (isGroup) {
      socket.emit("groupMessage", {
        groupId: Number(targetID),
        content: message.trim(),
      });
    } else {
      socket.emit("directMessage", {
        toUser: toUsername,
        content: message.trim(),
      });
    }

    setMessage("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isMessageEmpty(message)) {
        handleSendMessage();
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="flex flex-col h-full border rounded">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="font-medium">
          {isGroup ? "👥 " : "👤 "}
          {toUsername}
        </div>
        <div className="text-sm">
          {connectionStatus === "connected" && !socketError ? (
            <span className="text-green-600">● Connected</span>
          ) : (
            <span className="text-red-600 flex items-center gap-2">
              <span>●</span>
              <span>{socketError || "Connection Error"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto w-full">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 ${msg.fromUser === "You" ? "text-right" : ""}`}
            >
              <div
                className={`p-3 rounded-lg max-w-full ${
                  msg.fromUser === "You"
                    ? "bg-blue-500 text-white rounded-br-none justify-self-end"
                    : msg.fromUser === "System"
                    ? "bg-gray-200 text-center w-full"
                    : "bg-gray-300 text-black rounded-bl-none justify-self-start"
                }`}
              >
                {msg.fromUser !== "You" && msg.fromUser !== "System" && (
                  <div className="text-xs font-medium mb-1">{msg.fromUser}</div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
                <div
                  className={`text-xs opacity-70 mt-1 ${
                    msg.fromUser === "You" ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t">
        <div className="relative">
          <div className="flex">
            <button
              className="p-2 text-gray-500 hover:text-blue-500"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 border rounded-l p-2 resize-none overflow-y-auto transition-all duration-200"
              placeholder={`Type a message to ${
                isGroup ? "group" : ""
              } ${toUsername}... (Press Shift + Enter for new line)`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ minHeight: "42px" }}
            />
            <button
              className={`px-4 rounded-r ${
                isMessageEmpty(message)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white transition-colors`}
              onClick={handleSendMessage}
              disabled={isMessageEmpty(message)}
            >
              Send
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
