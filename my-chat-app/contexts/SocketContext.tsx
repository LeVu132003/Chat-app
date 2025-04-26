"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) return;

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token,
      },
    });

    // Socket event handlers
    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socketInstance.on("friendRequest", (data) => {
      toast.info(
        <div className="flex flex-col gap-2">
          <div>{data.content}</div>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/friends/requests")}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              View Request
            </button>
          </div>
        </div>,
        {
          duration: 5000,
        }
      );
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
