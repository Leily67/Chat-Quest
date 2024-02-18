import UserProvider from "@/contexts/UserContext";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'react-tooltip/dist/react-tooltip.css';

const calibre = localFont({
  src: [
    { path: "../../public/fonts/CalibreMedium.otf", weight: "500" },
    { path: "../../public/fonts/CalibreLight.otf", weight: "300" },
    { path: "../../public/fonts/CalibreSemibold.otf", weight: "600" },
    { path: "../../public/fonts/CalibreBold.otf", weight: "bold" },
  ]
});

export const metadata: Metadata = {
  title: "Chat Quest",
  description: "Transform every conversation into an adventure.",
  icons: "/images/cat.svg",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["irc", "chat", "adventure", "epitech", "project", "next.js"],
  authors: [
    { name: "Alexis" },
    { name: "Florian" },
    { name: "Colette" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={`${calibre.className} overflow-hidden`}>
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
