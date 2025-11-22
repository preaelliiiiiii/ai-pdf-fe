"use client";
import "./globals.css";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
<html lang="en">
  <body className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 overflow-hidden">
    <Sidebar collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

    <main
      className={`flex flex-col flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-20" : "ml-64"
      } p-8 overflow-hidden`}
    >
      <div className="flex-1 h-full overflow-auto rounded-2xl">
        {children}
      </div>
    </main>
  </body>
</html>

  );
}
