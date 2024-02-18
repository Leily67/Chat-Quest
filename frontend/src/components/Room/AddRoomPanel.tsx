"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AiFillCloseCircle } from "react-icons/ai";
import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { DotLoader } from "react-spinners";

function AddRoomPanel({ hideAddRoomPanel }: any) {
  const [title, setTitle] = useState<string>("");
  const { user } = useUser();
  const [type, setType] = useState<string>("public");
  const [id, setId] = useState<string>("");
  const { socket, events, rooms } = useSocket();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = (e: any) => {
    setLoading(true);
    e.preventDefault();

    if (id) {
      if (rooms.find((room) => room._id === id)) {
        hideAddRoomPanel(true);
        router.replace("/chat/" + id);
        return;
      } else {
        socket?.emit(events.JOIN_ROOM, {
          user_id: user?._id,
          room_id: id,
        });
        setLoading(false);
      }
    }

    if (!title) return;

    socket?.emit(events.CREATE_ROOM, {
      user: user?._id,
      name: title,
      is_public: type === "public",
    });

    hideAddRoomPanel(true);
  };

  return (
    <div
      className="flex absolute top-0 left-0 z-20 flex-col justify-center items-center px-6 py-8 mx-auto w-full h-screen backdrop-blur-sm lg:py-0"
      onClick={() => hideAddRoomPanel(true)}
    >
      <div
        className="relative w-full bg-white rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <AiFillCloseCircle
          size={30}
          className="absolute -top-2 -right-2 cursor-pointer text-primary"
          onClick={() => hideAddRoomPanel(true)}
        />
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight leading-tight text-gray-900 md:text-2xl">
            Create or join a room
          </h1>
          <form className="space-1 md:space-y-2" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Room name
              </label>
              <input
                type="text"
                id="title"
                defaultValue={title}
                disabled={id ? true : false}
                onChange={(e) => setTitle(e.target.value)}
                className={`bg-gray-50 focus:outline-none  text-gray-900 sm:text-sm rounded-lg border focus:border-primary block w-full p-2.5 ${
                  id ? "bg-gray-300" : ""
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="roomType"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Room type
              </label>
              <select
                defaultValue={type}
                disabled={id ? true : false}
                onChange={(e) => setType(e.target.value)}
                id="roomType"
                className="bg-gray-50 focus:outline-none  text-gray-900 sm:text-sm rounded-lg border focus:border-primary block w-full p-2.5"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">
              Public chat will be visible to everyone.
            </p>
            <div
              className="space-y-2 sm:space-y-3"
              style={{ marginTop: "1.5rem" }}
            >
              <h2 className="text-l font-bold tracking-tight leading-tight text-gray-900">
                You have a chat ID?
              </h2>
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-900"
                >
                  Chat ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  disabled={title ? true : false}
                  defaultValue={id}
                  minLength={5}
                  onChange={(e) => setId(e.target.value)}
                  className={`bg-gray-50 focus:outline-none  text-gray-900 sm:text-sm rounded-lg border focus:border-primary block w-full p-2.5 ${
                    title ? "bg-gray-300" : ""
                  }`}
                />
              </div>
              <p className="text-sm text-gray-500">
                If you have a chat ID, you can enter it here to join the chat.
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <DotLoader color="#A78295" className="mt-5" size={35} />
              </div>
            ) : (
              <button type="submit" className="btn">
                Go !
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRoomPanel;
