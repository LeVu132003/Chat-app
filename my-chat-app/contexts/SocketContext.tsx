"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      // Cleanup existing socket when user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Only create a new socket if one doesn't exist
    if (!socketRef.current) {
      // Initialize socket connection
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: {
          token,
        },
        // Add reconnection options
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      // Socket event handlers
      socketInstance.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socketInstance.on("disconnect", (reason) => {
        setIsConnected(false);
        console.log("Socket disconnected:", reason);

        // Handle specific disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          socketInstance.connect();
        }
      });

      socketInstance.on("connect_error", (error) => {
        console.log("Connection error:", error);
        setIsConnected(false);
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

      socketRef.current = socketInstance;
    }

    // Cleanup only when component is unmounted AND user is logged out
    return () => {
      if (!token && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
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
