"use client";
import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";

type Message = { sender: "user" | "bot"; text: string };

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // scroll ke pesan terbaru setiap kali ada pesan baru
  useLayoutEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-y-auto pr-2 space-y-3 max-h-[60vh] scroll-smooth thin-scroll"
    >
      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-slate-200 text-slate-800 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
