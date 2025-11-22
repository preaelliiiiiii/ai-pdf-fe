"use client";
import { useState, useMemo } from "react";
import DocumentList from "../components/DocumentList";
import UploadModal from "../components/UploadModal";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Pagination from "../components/Pagination";

export default function DocumentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Awal tanpa dummy data
  const [documents, setDocuments] = useState<
    { id: number; name: string; date: string; url: string }[]
  >([]);

  // Filter dokumen berdasarkan search
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAddDocument = (name: string, url: string) => {
    setDocuments((prev) => [
      {
        id: Date.now(),
        name,
        url,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev, // tambahkan di awal agar terbaru di atas
    ]);
    setCurrentPage(1); // otomatis kembali ke halaman pertama agar terlihat
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
            Manage and explore your uploaded documents easily.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition"
        >
          <Plus size={18} /> Upload Document
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white rounded-xl shadow mx-6 mb-4 px-4 py-2 border border-slate-200">
        <Search size={18} className="text-slate-500" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent focus:outline-none text-slate-700"
        />
      </div>

      {/* Wrapper: List + Pagination */}
      <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-t-2xl border border-slate-200 mx-6 mb-6 overflow-hidden">
        {/* Scrollable document list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <DocumentList
            documents={currentDocuments}
            setDocuments={setDocuments}
            startIndex={startIndex} // kirim index awal agar nomor lanjut
          />
        </motion.div>

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) =>
            setCurrentPage(Math.min(Math.max(page, 1), totalPages))
          }
        />
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
