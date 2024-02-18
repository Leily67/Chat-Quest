"use client";

import Footer from "@/components/Home/Fotter";
import LoginPopup from "@/components/Home/LoginPopup";
import Navbar from "@/components/Home/Navbar";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import { useState } from "react";
import { DotLoader } from "react-spinners";

export default function Home() {
  const { isLoaded, isAuthenticated } = useUser();
  const [showForm, setShowForm] = useState<boolean>(false);

  return isLoaded && !isAuthenticated ? (
    <>
      <Navbar />
      <main>
        <div className="flex flex-col items-center min-h-screen">
          <div className="flex flex-col items-center justify-center px-5 pb-12 mt-36 mb-12 lg:px-36">
            <div className="text-center">
              <p className="text-[80px] sm:text-[100px] lg:text-[196px] text-transparent font-bold leading-none lg:leading-tight tracking-tight bg-gradient bg-clip-text">
                ChatQuest
                <br />
              </p>
              <p className="text-[15px] sm:text-xl lg:text-[25px] leading-9 font-semibold">
                Transform every conversation into an adventure 🐱
              </p>
            </div>
            <button
              type="submit"
              className="mt-8 flex justify-center items-center w-48 h-14 text-lg btn cursor-pointer"
              onClick={() => {
                setShowForm(true);
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
      {showForm && (
        <LoginPopup showPopup={showForm} setShowPopup={setShowForm} />
      )}
      <Footer />
    </>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <DotLoader color="#A78295" className="mx-auto" size={150} />
    </div>
  );
}
