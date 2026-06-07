import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // If apiUrl ends with /api, we need to remove it for the socket connection
      const socketUrl = apiUrl.replace(/\/api$/, '');

      const newSocket = io(socketUrl, {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO Server');
        // Join a room specific to the user so they can receive direct messages if we use rooms later
        newSocket.emit('join_user_room', user._id);
      });

      return () => {
        console.log('🔌 Disconnecting from Socket.IO Server');
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
