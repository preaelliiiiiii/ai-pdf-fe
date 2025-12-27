"use client";
import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";

type Message = { sender: "user" | "bot"; text: string };

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll ke pesan terbaru
  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col overflow-y-scroll pr-2 space-y-3 scroll-smooth chat-scrollbar">
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
