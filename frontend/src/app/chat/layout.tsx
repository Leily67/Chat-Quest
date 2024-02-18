"use client";

import RoomSideBar from "@/components/Room/RoomSideBar";
import SocketProvider from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { DotLoader } from "react-spinners";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isAuthenticated } = useUser();

  return (
    <SocketProvider>
      <div className="flex h-screen">
        {isLoaded && isAuthenticated ? (
          <>
            <RoomSideBar />
            {children}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <DotLoader color="#A78295" className="mx-auto" size={150} />
          </div>
        )}
      </div>
    </SocketProvider>
  );
}
