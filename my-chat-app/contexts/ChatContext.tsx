import React, { createContext, useContext, useState } from "react";

interface ChatContextType {
  startConversationWithFriend: (friend: {
    userId: number;
    username: string;
  }) => void;
  // Thêm các state và function khác nếu cần
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  // Copy các state và function từ Chat component

  return (
    <ChatContext.Provider value={{ startConversationWithFriend }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
