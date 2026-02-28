"use client";
import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Message = {
  sender?: "user" | "bot";
  role?: "user" | "assistant";
  text?: string;
  content?: string;
  timestamp?: string;
};

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    // flex-1 + min-h-0 = kunci agar div ini bisa shrink dan scroll internal bekerja
    <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 scroll-smooth chat-scrollbar">
      {messages.map((msg, idx) => {
        const isUser = msg.sender === "user" || msg.role === "user";
        const text = msg.text || msg.content || "";

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
              }`}
            >
              {isUser ? (
                <p>{text}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-900">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-slate-700">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2 text-slate-900">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mb-2 text-slate-900">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mb-1 text-slate-800">
                        {children}
                      </h3>
                    ),
                    code: ({ children }) => (
                      <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-300 pl-3 italic text-slate-600 mb-2">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="border-slate-200 my-2" />,
                  }}
                >
                  {text}
                </ReactMarkdown>
              )}

              {msg.timestamp && (
                <p
                  className={`text-[10px] mt-1.5 ${isUser ? "text-blue-200" : "text-slate-400"}`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
