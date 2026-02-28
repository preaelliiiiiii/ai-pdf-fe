// lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api-ai.desa-maileppet.com";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr-session";
  let sessionId = localStorage.getItem("chat_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("chat_session_id", sessionId);
  }
  return sessionId;
}

export const api = {
  // PDF Management
  uploadPDF: async (file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Upload failed");
    }
    return res.json();
  },

  listPDFs: async () => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/list`);
    if (!res.ok) throw new Error("Failed to fetch PDFs");
    return res.json();
  },

  getPDFDetail: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/detail/${id}`);
    if (!res.ok) throw new Error("Failed to fetch PDF detail");
    return res.json();
  },

  deletePDF: async (fileName: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/delete/${fileName}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete PDF");
    return res.json();
  },

  searchPDFs: async (query: string) => {
    const res = await fetch(
      `${API_BASE_URL}/api/pdf/search?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) throw new Error("Failed to search PDFs");
    return res.json();
  },

  // AI Chat
  chatWithPDF: async (pdfId: string, question: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/chat/${pdfId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, sessionId: getSessionId() }),
    });
    if (!res.ok) throw new Error("Failed to chat with PDF");
    return res.json();
  },

  // message     = yang dikirim ke Lambda (bisa contextual prompt)
  // originalMessage = pesan asli user yang disimpan ke history
  chatGeneral: async (message: string, originalMessage?: string) => {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId: getSessionId(),
        ...(originalMessage && { originalMessage }),
      }),
    });
    if (!res.ok) throw new Error("Failed to chat with AI");
    return res.json();
  },

  askAllPDFs: async (question: string) => {
    const res = await fetch(`${API_BASE_URL}/api/ai/ask-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, sessionId: getSessionId() }),
    });
    if (!res.ok) throw new Error("Failed to ask all PDFs");
    return res.json();
  },

  // History
  getChatHistory: async () => {
    const sessionId = getSessionId();
    const res = await fetch(
      `${API_BASE_URL}/api/ai/history?sessionId=${sessionId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch chat history");
    return res.json();
  },

  clearChatHistory: async () => {
    const sessionId = getSessionId();
    const res = await fetch(
      `${API_BASE_URL}/api/ai/history?sessionId=${sessionId}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error("Failed to clear chat history");
    return res.json();
  },

  getPDFChatHistory: async (pdfId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/history/${pdfId}`);
    if (!res.ok) throw new Error("Failed to fetch PDF chat history");
    return res.json();
  },

  clearPDFChatHistory: async (pdfId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/history/${pdfId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear PDF chat history");
    return res.json();
  },
};

export default api;
