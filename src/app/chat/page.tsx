"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ChatWindow from "@/app/components/ChatWindow";
import { Send } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 👋 What would you like to know about your documents?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // simulasi respons AI
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "This is a sample response based on your document context 🤖",
        },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <motion.div
        className="p-6 flex-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
          💬 AI Document Assistant
        </h1>
        <p className="text-slate-500 text-sm">
          Ask anything related to your uploaded documents.
        </p>
      </motion.div>

      {/* Chat area (flex-grow to fill available space) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-t-2xl border border-slate-200 mx-6 mb-6 p-4"
      >
        {/* Chat messages window */}
        <div className="flex-1 overflow-y-auto mb-4">
          <ChatWindow messages={messages} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your documents..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
