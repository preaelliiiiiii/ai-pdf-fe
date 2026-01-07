"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ChatWindow from "@/app/components/ChatWindow";
import { Send, FileText } from "lucide-react";
import api from "@/app/lib/api";

// Define the message type
type Message = {
  sender: "bot" | "user";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi there! 👋 I'm your AI assistant powered by Google Gemini. I can help you with general questions or answer questions about your uploaded documents!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const result = await api.listPDFs();
      if (result.success) {
        setDocuments(result.data.files);
        setDocsLoaded(true);
        console.log(`✅ Loaded ${result.data.files.length} documents`);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocsLoaded(true); // Still mark as loaded to avoid blocking chat
    }
  };

  // Smart detection: apakah pertanyaan tentang dokumen?
  const isDocumentRelatedQuestion = (question: string): boolean => {
    const lowerQ = question.toLowerCase();

    // Keywords yang indicate pertanyaan tentang dokumen
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
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Detect apakah pertanyaan tentang dokumen
      const isAboutDocuments = isDocumentRelatedQuestion(userMessage);

      if (isAboutDocuments && documents.length > 0) {
        // Mode: Document-aware chat
        console.log("🔍 Document-related question detected!");

        // Compile informasi dokumen
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
        `
          )
          .join("\n---\n");

        // Kirim context dokumen ke AI
        const contextualPrompt = `
Saya adalah asisten AI yang membantu user dengan dokumen-dokumen mereka.

User memiliki ${documents.length} dokumen yang telah diupload:

${docsInfo}

Pertanyaan user: ${userMessage}

Berikan jawaban yang informatif berdasarkan daftar dokumen di atas. Jika user bertanya tentang dokumen tertentu, sebutkan nama dan detailnya. Jika user bertanya secara umum, berikan overview dari semua dokumen.

Jawab dalam bahasa yang sama dengan pertanyaan user (Indonesia atau Inggris).
`;

        const result = await api.chatGeneral(contextualPrompt);

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `📚 **[Document Context Mode]**\n\n${result.data.response}`,
          },
        ]);
      } else if (isAboutDocuments && documents.length === 0) {
        // User nanya tentang dokumen tapi belum ada dokumen
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `📭 Maaf, saat ini belum ada dokumen yang diupload.\n\nSilakan upload dokumen PDF terlebih dahulu di menu **Documents**, lalu saya bisa membantu menjawab pertanyaan tentang dokumen tersebut.\n\nAtau, Anda bisa bertanya hal lain yang tidak terkait dokumen! 😊`,
          },
        ]);
      } else {
        // Mode: General chat
        console.log("💬 General chat mode");
        const result = await api.chatGeneral(userMessage);

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: result.data.response,
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
              💬 AI Chat Assistant
            </h1>
            <p className="text-slate-500 text-sm">
              Powered by Google Gemini AI - Ask me anything!
            </p>
          </div>

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
      </motion.div>

      {/* Chat area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-t-2xl border border-slate-200 mx-6 mb-6 p-4"
      >
        {/* Chat messages window */}
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          <ChatWindow messages={messages} />
        </div>

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
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
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

        {/* Status indicator */}
        {loading && (
          <p className="text-xs text-slate-500 mt-2 animate-pulse">
            🤖 AI is generating response...
          </p>
        )}

        {/* Helpful hints */}
        {!loading && documents.length > 0 && messages.length === 1 && (
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
