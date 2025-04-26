import { io } from "socket.io-client";

// Only initialize socket in browser environment
let socket: any = null;

// Create a function that will create a new socket connection
// This allows us to reinitialize the connection when needed
const createSocket = (token: string | null) => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return null;
  }

  // Clean up existing socket if it exists
  if (socket) {
    socket.disconnect();
  }

  if (!token) {
    console.warn("No authentication token available for socket connection");
    return null;
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

  console.log(
    "Attempting to connect to WebSocket server with token:",
    token.substring(0, 10) + "..."
  );
  console.log("Connection URL:", WS_URL);

  // Create a new socket connection with current auth token
  const newSocket = io(WS_URL, {
    // Start with polling first for more reliable initial connections
    transports: ["polling", "websocket"],
    upgrade: true,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    timeout: 60000,
    auth: {
      token: token,
    },
  });

  newSocket.on("connect", () => {
    console.log("Connected to WebSocket server! Socket ID:", newSocket.id);
  });

  newSocket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  newSocket.on("disconnect", (reason) => {
    console.log("Disconnected from WebSocket server. Reason:", reason);
  });

  // Add handler for server responses including errors
  newSocket.on("response", (response) => {
    console.log("Server response:", response);

    // Handle specific error types if needed
    if (response.msg_type === "error") {
      console.error(
        `Socket error: ${response.msg.error_type} - ${response.msg.error_msg}`
      );
    }
  });

  newSocket.on("directMessage", (message: any) => {
    console.log("New message received:", message);
  });

  // Add handler for group messages
  newSocket.on("groupMessage", (message: any) => {
    console.log("New group message received:", message);
  });

  // Add handler for group updates (members joining/leaving)
  newSocket.on("groupUpdate", (update: any) => {
    console.log("Group update received:", update);
  });

  // Add handler for message sent confirmations
  newSocket.on("messageSent", (confirmation) => {
    console.log("Message sent confirmation:", confirmation);
  });

  return newSocket;
};

// Initialize socket in browser environment when module is loaded
// We don't initialize here anymore since we need the token from context
if (typeof window !== "undefined") {
  setTimeout(() => {
    socket = null; // Will be initialized when refreshSocketConnection is called
  }, 1000);
}

// Function to refresh socket connection (can be called after login/logout)
export const refreshSocketConnection = (token: string | null) => {
  console.log("Refreshing socket connection...");
  if (typeof window !== "undefined") {
    socket = createSocket(token);
  }
  return socket;
};

export const sendMessage = (
  toUser: string,
  content: string,
  token: string | null,
  attachment?: string,
  attachmentType?: string
) => {
  if (!socket) {
    console.error("Socket not initialized. Attempting to reconnect...");
    socket = createSocket(token);

    if (!socket) {
      console.error("Failed to initialize socket connection");
      return { success: false, error: "Not connected" };
    }
  }

  console.log(`Sending message to ${toUser}: ${content}`);
  socket.emit("directMessage", { toUser, content, attachment, attachmentType });
  return { success: true };
};

// Function to send a group message
export const sendGroupMessage = (
  groupId: number,
  content: string,
  attachment?: string,
  attachmentType?: string
) => {
  if (!socket) {
    console.error("Socket not initialized. Cannot send group message.");
    return { success: false, error: "Not connected" };
  }

  console.log(`Sending message to group ${groupId}: ${content}`);
  socket.emit("groupMessage", { groupId, content, attachment, attachmentType });
  return { success: true };
};

// Function to send a friend request
export const sendFriendRequest = (toUsername: string, token: string | null) => {
  if (!socket) {
    console.error("Socket not initialized. Cannot send friend request.");
    return { success: false, error: "Not connected" };
  }

  socket.emit("friendRequest", { toUsername });
  return { success: true };
};

export default socket;
