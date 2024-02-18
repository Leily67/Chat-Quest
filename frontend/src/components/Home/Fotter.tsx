import React from "react";
import useTheme from "@/hooks/useTheme";

function Footer() {
  return (
    <footer
      className={`flex justify-center items-center absolute bottom-0 w-full h-16 border-gray-20 text-center`}
    >
      <div className="w-full">
        <span className="font-semibold">
          © ChatQuest {new Date().getFullYear()} - Made with ❤️ by
        </span>
        <span className="text-primary">&nbsp;Alexis, Florian, Colette</span>.
      </div>
    </footer>
  );
}

export default Footer;
