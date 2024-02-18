"use client";
import React, { useState } from "react";
import RoomCard from "./RoomCard";
import IRoom from "@/interfaces/IRoom";
import { useSocket } from "@/contexts/SocketContext";
import { BiLogOut, BiMessageAdd, BiMoon } from "react-icons/bi";
import AddRoomPanel from "./AddRoomPanel";
import { useRouter } from "next/navigation";
import useTheme from "@/hooks/useTheme";
import { FaMoon, FaSun } from "react-icons/fa";
import Avatar from "react-avatar";
import { useUser } from "@/contexts/UserContext";

function RoomSideBar() {
  const [showAddRoomPanel, setShowAddRoomPanel] = useState(false);
  const { rooms, roomUsers } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { logout, user } = useUser();

  const hideAddRoomPanel = () => setShowAddRoomPanel(false);
  const handleLogout = async () => {
    logout();
    router.replace("/");
  };

  return (
    <div className={`overflow-y-scroll w-20 h-screen px-2 border-r-2 sm:w-1/4 min-w-[80px] ${theme === 'light' ? 'bg-[#EFE1D1]' : 'bg-[#331D2C]'}`}>
      <div className="mt-2 flex items-center justify-between hidden sm:flex">
        <button onClick={handleLogout} className="btn logout-button">
          Sign out
        </button>
        <button onClick={toggleTheme} className="theme-toggle-button">
          {theme === "light" ? <FaMoon size={30} /> : <FaSun size={30} />}
        </button>
      </div>
      <div className="flex items-center flex-col justify-center pt-6 pb-4 ">
        <Avatar name={user?.nickname} round={true} size="50" />
        <div className="hidden sm:block text-center">
          <p className="mt-2 font-semibold">{user?.nickname}</p>
          <p>{user?.uuid}</p>
        </div>
      </div>
      <div onClick={toggleTheme} className="flex sm:hidden justify-center items-center p-1 my-2 rounded-lg border-2 cursor-pointer text-primary border-primary hover:bg-primary hover:text-white">
         {theme === "light" ? <FaMoon size={30} /> : <FaSun size={30} />}
      </div>
      <div onClick={handleLogout} className="flex sm:hidden justify-center items-center p-1 my-2 rounded-lg border-2 cursor-pointer text-primary border-primary hover:bg-primary hover:text-white">
        <BiLogOut size={30} />
      </div>
      <div
        className="flex justify-center items-center p-1 my-2 rounded-lg border-2 cursor-pointer text-primary border-primary hover:bg-primary hover:text-white"
        onClick={() => setShowAddRoomPanel(true)}
      >
        <BiMessageAdd size={30} />
      </div>
      <hr className="block py-1 border-t-1 border-gray-300 sm:hidden " />
      {rooms.filter((room) => !room.is_public).length > 0 && (
        <>
          <p className="py-5 h-[56px] text-xl sm:text-2xl font-semibold hidden sm:block ">
            Private rooms
          </p>
          <div>
            {rooms
              .filter((room) => !room.is_public)
              .map((room: IRoom, index) => {
                return (
                  <RoomCard
                    room={room}
                    users={roomUsers[room._id] ?? []}
                    key={index}
                  />
                );
              })}
          </div>
        </>
      )}
      {rooms.filter((room) => room.is_public).length > 0 &&
        rooms.filter((room) => !room.is_public).length > 0 && (
          <hr className="mt-2 py-1 border-t-1 border-gray-300" />
        )}
      {rooms.filter((room) => room.is_public).length > 0 && (
        <>
          <p className="py-5 h-[56px] text-xl sm:text-2xl font-semibold hidden sm:block ">
            Public rooms
          </p>
          <div>
            {rooms
              .filter((room) => room.is_public)
              .map((room: IRoom, index) => {
                return (
                  <RoomCard
                    room={room}
                    users={roomUsers[room._id] ?? []}
                    key={index}
                  />
                );
              })}
          </div>
        </>
      )}
      {showAddRoomPanel && <AddRoomPanel hideAddRoomPanel={hideAddRoomPanel} />}
    </div>
  );
}

export default RoomSideBar;
