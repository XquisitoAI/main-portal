import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    // Obtener token para autenticación
    let isMounted = true;

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token || !isMounted) {
          return;
        }

        // Crear conexión socket
        const socket = io(SOCKET_URL, {
          auth: {
            token,
            clientType: "main-portal",
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        // Event handlers
        socket.on("connect", () => {
          console.log("[Socket] Connected:", socket.id);
          setIsConnected(true);
          setError(null);

          // Unirse a sala de super-admin
          socket.emit("join:super-admin");
        });

        socket.on("disconnect", (reason) => {
          console.log("[Socket] Disconnected:", reason);
          setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
          console.error("[Socket] Connection error:", err);
          setError(err.message);
          setIsConnected(false);
        });

        socket.on("connection:authenticated", (data) => {
          console.log("[Socket] Authenticated:", data);
        });

        socket.on("room:joined", (data) => {
          console.log("[Socket] Room joined:", data);
        });

        socketRef.current = socket;
      } catch (err) {
        console.error("[Socket] Error getting token:", err);
        setError("Failed to authenticate");
      }
    };

    connectSocket();

    // Cleanup
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isSignedIn, getToken]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
};
