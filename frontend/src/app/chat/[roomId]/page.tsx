"use client";
import ChatBody from "@/components/Chat/ChatBody";
import ChatFooter from "@/components/Chat/ChatFooter";
import ChatHeader from "@/components/Chat/ChatHeader";
import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const {
    roomId,
  }: {
    roomId: string;
  } = useParams();
  const { socket, events } = useSocket();
  const { user } = useUser();

  useEffect(() => {
    socket?.emit(events.JOIN_ROOM, { room_id: roomId, user_id: user?._id });
  }, [socket]);

  return (
    <div className="flex relative flex-col w-full h-screen">
      <ChatHeader roomId={roomId} />
      <ChatBody roomId={roomId} />
      <ChatFooter roomId={roomId} />
    </div>
  );
}

export default Page;
