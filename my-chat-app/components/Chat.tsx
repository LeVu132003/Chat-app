import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { sendMessage, refreshSocketConnection } from "@/utils/socket";
import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageService } from "@/services/message.service";

interface ChatProps {
  targetID: string;
  toUsername: string;
}

const Chat = ({ targetID, toUsername }: ChatProps) => {
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
  const { token } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load message history
  useEffect(() => {
    const loadMessageHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await MessageService.getDirectMessages(targetID);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load message history:", error);
        setSocketError("Failed to load message history");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessageHistory();
  }, [targetID]);

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
    // Set current username
    // Ensure socket connection is fresh with current session token
    setConnectionStatus("connecting");
    const currentSocket = refreshSocketConnection(token);

    if (!currentSocket) {
      setConnectionStatus("error");
      setSocketError(
        "Unable to initialize socket connection - auth token missing"
      );
      return;
    }

    // Set up socket event listeners
    currentSocket.on("connectionConfirmed", () => {
      setConnectionStatus("connected");
    });

    // Handle direct messages
    currentSocket.on(
      "directMessage",
      (newMessage: { fromUser: string; content: string; toUser: string }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            content: newMessage.content,
            fromUser:
              newMessage.fromUser === toUsername ? newMessage.fromUser : "You",
            timestamp: new Date().toISOString(),
            type: "direct",
          },
        ]);
      }
    );

    // Handle socket response including errors
    currentSocket.on(
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

    // Check connection status after a timeout
    const checkConnectionTimeout = setTimeout(() => {
      if (!currentSocket.connected) {
        setConnectionStatus("error");
        setSocketError("Connection timed out - server might be unavailable");
      }
    }, 5000);

    return () => {
      clearTimeout(checkConnectionTimeout);
      currentSocket.off("directMessage");
      currentSocket.off("connectionConfirmed");
      currentSocket.off("response");
    };
  }, [targetID, toUsername, token, lastSentMessageId]);

  const isMessageEmpty = (msg: string) => {
    // Remove whitespace and check if message is empty
    return msg.trim().length === 0;
  };

  const handleSendMessage = () => {
    if (!message || isMessageEmpty(message)) {
      return;
    }

    if (toUsername) {
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
          type: "direct",
        },
      ]);

      // Clear any previous errors
      setSocketError("");
      setConnectionStatus("connected");

      // Send the message to the target user using username
      sendMessage(toUsername, message.trim(), token);
      setMessage("");
    }
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
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate new height (capped at 4 lines, approximately 96px)
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="flex flex-col h-full border rounded">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
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
      <div className="flex-1 p-3 overflow-y-auto w-full bg-gray-50">
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
                className={` p-3 rounded-lg max-w-full ${
                  msg.fromUser === "You"
                    ? "bg-blue-500 text-white rounded-br-none justify-self-end"
                    : "bg-gray-300 text-black rounded-bl-none justify-self-start"
                }`}
              >
                <div className=" whitespace-pre-wrap break-words">
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
              placeholder="Type a message... (Press Shift + Enter for new line)"
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
