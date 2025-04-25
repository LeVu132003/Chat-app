import { Message } from "@/types/message";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function ChatMessage({
  message,
  isOwnMessage,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3",
        !isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {isOwnMessage && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-medium">
            {message.fromUser[0]?.toUpperCase()}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative max-w-xl px-4 py-2 rounded-lg shadow",
          !isOwnMessage ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
        )}
      >
        <span className="block">{message.content}</span>
      </div>

      {!isOwnMessage && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-medium">Me</span>
        </div>
      )}
    </div>
  );
}
