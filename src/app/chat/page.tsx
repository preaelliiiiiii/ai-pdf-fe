"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ChatWindow from "@/app/components/ChatWindow";
import { Send, FileText, Trash2 } from "lucide-react";
import api from "@/app/lib/api";

type Message = {
  sender?: "bot" | "user";
  role?: "user" | "assistant";
  text?: string;
  content?: string;
  timestamp?: string;
};

export default function ChatPage() {
  const WELCOME_MESSAGE: Message = {
    sender: "bot",
    text: "Halo! 👋 Aku Diko, asisten AI kamu. Aku bisa bantu jawab pertanyaan umum atau pertanyaan tentang dokumen yang sudah kamu upload!",
  };

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);

  // Load history + documents saat mount
  useEffect(() => {
    Promise.all([loadHistory(), loadDocuments()]);
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await api.getChatHistory();
      if (result.success && result.data.messages.length > 0) {
        // Prepend welcome message, lalu append history
        setMessages([WELCOME_MESSAGE, ...result.data.messages]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Tetap tampilkan welcome message kalau gagal load
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const result = await api.listPDFs();
      if (result.success) {
        setDocuments(result.data.files);
        setDocsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocsLoaded(true);
    }
  };

  const handleClearHistory = async () => {
    const confirmed = confirm("Hapus semua history chat?");
    if (!confirmed) return;
    try {
      await api.clearChatHistory();
      setMessages([WELCOME_MESSAGE]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const isDocumentRelatedQuestion = (question: string): boolean => {
    const lowerQ = question.toLowerCase();
    const documentKeywords = [
      "dokumen",
      "document",
      "pdf",
      "file",
      "berkas",
      "upload",
      "daftar",
      "list",
      "ada apa",
      "apa saja",
      "berapa banyak",
      "show",
      "tampilkan",
      "lihat",
      "cari",
      "search",
      "find",
      "tentang",
      "about",
      "ringkasan",
      "summary",
      "isi",
      "content",
    ];
    return documentKeywords.some((keyword) => lowerQ.includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      sender: "user",
      text: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const isAboutDocuments = isDocumentRelatedQuestion(userMessage);

      if (isAboutDocuments && documents.length > 0) {
        const docsInfo = documents
          .map(
            (doc, idx) => `
${idx + 1}. **${doc.originalName}**
   - Kategori: ${doc.analysis?.category || "N/A"}
   - Ringkasan: ${doc.analysis?.summary || "Tidak ada ringkasan"}
   - Keywords: ${doc.analysis?.keywords?.join(", ") || "N/A"}
   - Topik: ${doc.analysis?.mainTopics?.join(", ") || "N/A"}
   - Halaman: ${doc.analysis?.pageCount || "N/A"}
   - Upload: ${new Date(doc.uploadedAt).toLocaleDateString("id-ID")}
        `,
          )
          .join("\n---\n");

        const contextualPrompt = `
Saya adalah asisten AI yang membantu user dengan dokumen-dokumen mereka.
User memiliki ${documents.length} dokumen yang telah diupload:
${docsInfo}
Pertanyaan user: ${userMessage}
Berikan jawaban yang informatif berdasarkan daftar dokumen di atas.
Jawab dalam bahasa yang sama dengan pertanyaan user (Indonesia atau Inggris).
`;
        const result = await api.chatGeneral(contextualPrompt, userMessage);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `📚 **[Document Context Mode]**\n\n${result.data.response}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (isAboutDocuments && documents.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `📭 Maaf, saat ini belum ada dokumen yang diupload.\n\nSilakan upload dokumen PDF terlebih dahulu di menu **Documents**, lalu saya bisa membantu menjawab pertanyaan tentang dokumen tersebut.\n\nAtau, Anda bisa bertanya hal lain! 😊`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        const result = await api.chatGeneral(userMessage);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: result.data.response,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <motion.div
        className="p-6 flex-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
              💬 Diko AI Assistant
            </h1>
            <p className="text-slate-500 text-sm">
              Asisten AI pintarmu — tanya apa saja!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear history button */}
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="flex items-center gap-2 text-slate-500 hover:text-red-500 
                       border border-slate-200 px-3 py-2 rounded-xl hover:border-red-200 
                       hover:bg-red-50 transition text-sm"
            >
              <Trash2 size={16} />
              Clear
            </button>

            {/* Document Counter */}
            {docsLoaded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl border border-blue-200"
              >
                <FileText size={18} />
                <span className="font-semibold">{documents.length}</span>
                <span className="text-sm">docs loaded</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col flex-1 min-h-0 bg-white/70 backdrop-blur-md shadow-lg rounded-t-2xl border border-slate-200 mx-6 mb-6 p-4"
      >
        {/* Loading history indicator */}
        {historyLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
            <span className="animate-spin">⏳</span> Loading chat history...
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto mb-4 pr-2">
            <ChatWindow messages={messages} />
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={
              loading
                ? "AI is thinking..."
                : documents.length > 0
                  ? "Ask about your documents or anything else..."
                  : "Ask me anything..."
            }
            disabled={loading || historyLoading}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || historyLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md 
                     hover:bg-blue-700 active:scale-95 transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center min-w-[44px]"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        {loading && (
          <p className="text-xs text-slate-500 mt-2 animate-pulse">
            🤖 AI is generating response...
          </p>
        )}

        {!loading &&
          !historyLoading &&
          documents.length > 0 &&
          messages.length === 1 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">
                💡 Try asking:
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• "Apa saja dokumen yang ada?"</li>
                <li>• "Tampilkan daftar dokumen saya"</li>
                <li>• "Cari dokumen tentang [topik]"</li>
                <li>• "Ringkas semua dokumen"</li>
              </ul>
            </div>
          )}
      </motion.div>
    </div>
  );
}
  