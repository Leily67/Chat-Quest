"use client";
import { useSocket } from "@/contexts/SocketContext";
import React, { useState } from "react";
import Popup from "../shared/Popup";

function ChatHeader({ roomId }: { roomId: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { rooms } = useSocket();
  const room = rooms.find((room) => room._id === roomId);

  return (
    <div className="basis-[7%] border-b-2 flex items-center justify-between p-3 font-medium">
      <p className="text-xl">{room?.name}</p>
      {!room?.is_public && room?.is_joinable && (
        <>
          <button
            type="submit"
            className="btn"
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              setIsCopied(true);
            }}
          >
            Share
          </button>
          <Popup
            text="Invite copied to clipboard"
            showPopup={isCopied}
            setShowPopup={setIsCopied}
          />
        </>
      )}
    </div>
  );
}

export default ChatHeader;
