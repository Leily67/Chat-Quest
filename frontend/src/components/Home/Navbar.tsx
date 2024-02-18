import React, { useState } from "react";
import Image from "next/image";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "@/hooks/useTheme";

function Navbar() {
  const [navbarActive, setNavbarActive] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className={`flex justify-between items-center px-5 lg:px-36 h-[100px] ${
        theme === "light" ? "bg-[#EFE1D1]" : "bg-[#331D2C]"
      }`}
    >
      <Image src="/images/cat.svg" alt="logo" height={60} width={80} />

      <div className="hidden gap-10 font-medium lg:flex items-center">
        <button onClick={toggleTheme} className="text-xl p-2">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      <div className="lg:hidden" onClick={() => setNavbarActive(!navbarActive)}>
        {navbarActive ? (
          <AiOutlineClose size={30} />
        ) : (
          <AiOutlineMenu size={30} />
        )}
      </div>

      {navbarActive && (
        <div
          className={`absolute top-[80px] right-6 rounded-full font-medium text-xl py-2 px-4 ${
            theme === "light" ? "bg-[#EFE1D1]" : "bg-[#331D2C]"
          }`}
        >
          <button
            onClick={toggleTheme}
            className={`block p-2 ${
              theme === "light" ? "bg-[#EFE1D1]" : "bg-[#331D2C]"
            }`}
          >
            Mode {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
