"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "@/app/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type Props = {
  doc: { id: string; name: string; analysis?: any } | null;
  onClose: () => void;
};

export default function AskPDFModal({ doc, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Portal hanya bisa dipakai setelah mount di client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!doc) return;
    setMessages([]);
    setHistoryLoading(true);
    api
      .getPDFChatHistory(doc.id)
      .then((res) => {
        if (res.success) setMessages(res.data.messages);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [doc?.id]);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!doc || !mounted) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question, timestamp: new Date().toISOString() },
    ]);
    setLoading(true);
    try {
      const result = await api.chatWithPDF(doc.id, question);
      if (result.success && result.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.data.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Hapus history chat untuk dokumen ini?")) return;
    await api.clearPDFChatHistory(doc.id);
    setMessages([]);
  };

  const modal = (
    <AnimatePresence>
      {/* Backdrop — di-render langsung ke body lewat portal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 flex-shrink-0">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">🤖</span>
                <h2 className="font-semibold text-slate-800">
                  Tanya Diko tentang dokumen ini
                </h2>
              </div>
              <p className="text-xs text-slate-500 truncate">📄 {doc.name}</p>
              {doc.analysis?.category && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {doc.analysis.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleClear}
                title="Clear history"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {historyLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
                <span className="animate-spin">⏳</span> Loading history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
                <span className="text-4xl">💬</span>
                <p className="text-sm font-medium">
                  Tanya Diko apa saja tentang dokumen ini
                </p>
                {doc.analysis?.summary && (
                  <p className="text-xs text-slate-400 max-w-sm line-clamp-3">
                    {doc.analysis.summary}
                  </p>
                )}
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-1.5 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-0.5 mb-1.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-0.5 mb-1.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-white/60 px-1 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-slate-400"}`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Tanya Diko tentang dokumen ini..."
                disabled={loading || historyLoading}
                autoFocus
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || historyLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700
                         active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center min-w-[44px]"
              >
                {loading ? (
                  <span className="text-sm">⏳</span>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Render ke document.body supaya tidak terpengaruh overflow/transform parent
  return createPortal(modal, document.body);
}
