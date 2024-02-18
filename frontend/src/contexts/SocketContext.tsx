"use client";
import IMessage from "@/interfaces/IMessage";
import ISocketContext from "@/interfaces/ISocketContext";
import { createContext, useContext, useEffect, useState } from "react";
import * as io from "socket.io-client";
import { useUser } from "./UserContext";
import { IUser } from "@/interfaces/IUser";
import IRoom from "@/interfaces/IRoom";
import { api } from "@/services/api";

const events = {
  UPDATE_ONLINE_USERS: "update-online-users",
  CONNECTION: "connection",
  CREATE_ROOM: "create-room",
  DELETE_ROOM: "delete-room",
  JOIN_ROOM: "join-room",
  QUIT_ROOM: "leave-room",
  SEND_MESSAGE: "send-message",
  ADD_REACTION: "add-reaction",
  REMOVE_REACTION: "remove-reaction",
};

const intialData: ISocketContext = {
  socket: undefined,
  roomUsers: {},
  messages: {},
  events: events,
  rooms: [],
};

const SocketContext = createContext<ISocketContext>(intialData);

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [roomUsers, setRoomUsers] = useState<{
    [key: string]: {
      user: IUser;
      socket: string;
    }[];
  }>({});
  const [socket, setSocket] = useState<io.Socket>();
  const [messages, setMessages] = useState<{ [key: string]: IMessage[] }>({});
  const [rooms, setRooms] = useState<IRoom[]>([]);

  useEffect(() => {
    if (!user) return;

    fetchRoomsfromServer();

    let socket = io.connect(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
      {
        query: {
          user_id: user._id,
        },
      }
    );

    socket.on(
      events.UPDATE_ONLINE_USERS,
      (_roomUsers: {
        [key: string]: {
          user: IUser;
          socket: string;
        }[];
      }) => {
        setRoomUsers(_roomUsers);
      }
    );

    socket.on(events.SEND_MESSAGE, (message: IMessage) => {
      setMessages((prev) => {
        if (
          prev[message.room as string]?.find(
            (m) => m._id && m._id === message._id
          )
        ) {
          return {
            ...prev,
            [message.room as string]: prev[message.room as string]?.map((m) =>
              m._id === message._id ? message : m
            ),
          };
        }

        return {
          ...prev,
          [message.room as string]: [
            ...(prev[message.room as string] || []),
            message,
          ],
        };
      });
    });

    socket.on(events.CREATE_ROOM, (room: IRoom) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on(events.DELETE_ROOM, (room: IRoom) => {
      setRooms((prev) => prev.filter((r) => r._id !== room._id));
    });

    socket.on(events.JOIN_ROOM, (room: IRoom) => {
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) {
          return prev;
        }
        return [...prev, room];
      });
    });

    socket.on(events.QUIT_ROOM, (room: IRoom) => {
      setRooms((prev) => prev.filter((r) => r._id !== room._id));
    });

    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, [user]);

  async function fetchRoomsfromServer(): Promise<void> {
    const response = await api("/authenticated-user/rooms");
    if (!response.ok) {
      return;
    }
    const rooms: IRoom[] = await response.json();
    setRooms(rooms);
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        roomUsers,
        messages,
        events,
        rooms,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
