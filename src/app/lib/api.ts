// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      `${API_BASE_URL}/api/pdf/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Failed to search PDFs");
    return res.json();
  },

  // AI Chat
  chatWithPDF: async (pdfId: string, question: string) => {
    const res = await fetch(`${API_BASE_URL}/api/pdf/chat/${pdfId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("Failed to chat with PDF");
    return res.json();
  },

  chatGeneral: async (message: string) => {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to chat with AI");
    return res.json();
  },

  askAllPDFs: async (question: string) => {
    const res = await fetch(`${API_BASE_URL}/api/ai/ask-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("Failed to ask all PDFs");
    return res.json();
  },
};

export default api;
