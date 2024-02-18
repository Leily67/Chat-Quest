import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import IRoom from "@/interfaces/IRoom";
import { IUser } from "@/interfaces/IUser";
import { useLongPress } from "@uidotdev/usehooks";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import Avatar from "react-avatar";
import useTheme from "@/hooks/useTheme";

function RoomCard({
  room,
  users,
}: {
  room: IRoom;
  users: {
    user: IUser;
    socket: string;
  }[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { roomId } = useParams();
  const { socket, events } = useSocket();
  const { user } = useUser();
  const { theme } = useTheme();

  const attrs = useLongPress(
    () => {
      setIsOpen(true);
    },
    {
      onCancel: (event) => {
        router.replace(`/chat/${room._id}`);
      },
      threshold: 300,
    }
  );

  return (
    <div
      {...attrs}
      className={`flex group relative gap-3 items-center py-2 flex-col sm:flex-row ${
        room._id === roomId ? "bg-primary" : ""
      } cursor-pointer hover:bg-primary transition-colors duration-200`}
    >
      <Avatar name={room.name} round={true} size="50" className="text-sm" />
      <div className="hidden sm:block">
        <p className="font-medium line-clamp-1">{room.name}</p>
        <p className="text-sm text-secondary">
          <span className="text-xs">🟢</span> {users.length} online
        </p>
        {users.find((u) => u.user._id === user?._id) && (
          <p className="text-sm text-black">T&apos;es dedans frère</p>
        )}
      </div>
      {user?._id === room.user && (
        <div
          className={`trash ${isOpen ? "" : "hide"}`}
          onClick={() => {
            socket?.emit(events.DELETE_ROOM, {
              room_id: room._id,
              user,
            });
            router.replace("/chat");
            setIsOpen(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default RoomCard;
