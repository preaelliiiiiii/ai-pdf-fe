"use client";
import { useState, useMemo, useEffect } from "react";
import DocumentList from "../components/DocumentList";
import UploadModal from "../components/UploadModal";
import { motion } from "framer-motion";
import { Plus, Search, RefreshCw } from "lucide-react";
import Pagination from "../components/Pagination";
import api from "@/app/lib/api";

export default function DocumentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 5;

  const [documents, setDocuments] = useState<any[]>([]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await api.listPDFs();

      if (result.success) {
        // Format data untuk frontend
        const formattedDocs = result.data.files.map((pdf: any) => ({
          id: pdf.id,
          name: pdf.originalName,
          fileName: pdf.fileName,
          date: new Date(pdf.uploadedAt).toLocaleDateString("id-ID"),
          uploadedAt: pdf.uploadedAt,
          fileSize: pdf.fileSizeFormatted,
          url: pdf.url,
          analysis: pdf.analysis,
        }));

        // Sort by upload date (newest first)
        formattedDocs.sort(
          (a: any, b: any) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      alert("Gagal memuat dokumen dari server");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  // Filter dokumen berdasarkan search
  const filteredDocuments = useMemo(() => {
    if (!search) return documents;

    const lowerSearch = search.toLowerCase();
    return documents.filter((doc) => {
      const searchText = `
        ${doc.name}
        ${doc.analysis?.title || ""}
        ${doc.analysis?.summary || ""}
        ${doc.analysis?.category || ""}
        ${doc.analysis?.keywords?.join(" ") || ""}
      `.toLowerCase();

      return searchText.includes(lowerSearch);
    });
  }, [documents, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAddDocument = (newDoc: any) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden">
      {/* Header Section */}
      <motion.div
        className="flex items-center justify-between p-6 flex-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            📁 Document Center
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage and explore your uploaded documents with AI analysis.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-xl 
                     shadow-md hover:bg-slate-700 active:scale-95 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl 
                     shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            <Plus size={18} /> Upload PDF
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white rounded-xl shadow mx-6 mb-4 px-4 py-2 border border-slate-200">
        <Search size={18} className="text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, title, category, keywords..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent focus:outline-none text-slate-700"
        />
      </div>

      {/* Document Stats */}
      {!loading && (
        <div className="mx-6 mb-4 flex gap-4 text-sm text-slate-600">
          <span>📊 Total: {documents.length} documents</span>
          {search && <span>🔍 Found: {filteredDocuments.length} results</span>}
        </div>
      )}

      {/* Wrapper: List + Pagination */}
      <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-t-2xl border border-slate-200 mx-6 mb-6 overflow-hidden">
        {/* Scrollable document list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-slate-600">Loading documents...</p>
              </div>
            </div>
          ) : (
            <DocumentList
              documents={currentDocuments}
              setDocuments={setDocuments}
              startIndex={startIndex}
            />
          )}
        </motion.div>

        {/* Pagination Component */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) =>
              setCurrentPage(Math.min(Math.max(page, 1), totalPages))
            }
          />
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddDocument}
      />
    </div>
  );
}
