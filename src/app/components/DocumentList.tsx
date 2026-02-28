"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import { MessageSquare } from "lucide-react";
import api from "@/app/lib/api";
import AskPDFModal from "./AskPDFModal";

type Props = {
  documents: any[];
  setDocuments: Dispatch<SetStateAction<any[]>>;
  startIndex: number;
};

export default function DocumentList({
  documents,
  setDocuments,
  startIndex,
}: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [askDoc, setAskDoc] = useState<any | null>(null);

  const handleDelete = async (doc: any) => {
    if (
      !confirm(
        `Are you sure you want to delete "${doc.name}"?\nThis action cannot be undone.`,
      )
    )
      return;

    setDeleting(doc.id);
    try {
      const result = await api.deletePDF(doc.fileName);
      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      } else {
        throw new Error(result.message || "Delete failed");
      }
    } catch (error: any) {
      alert(`❌ Failed to delete: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (doc: any) => {
    if (doc.url) window.open(doc.url, "_blank");
    else alert("URL not available for this document");
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-left border-b border-slate-200">
              <th className="p-4 font-semibold">No</th>
              <th className="p-4 font-semibold">Document Info</th>
              <th className="p-4 font-semibold">AI Analysis</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-5xl">📭</span>
                    <p className="text-lg font-medium">
                      No documents uploaded yet
                    </p>
                    <p className="text-sm text-slate-400">
                      Click Upload PDF button to get started
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc, index) => (
                <tr
                  key={doc.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="p-4 text-slate-600 font-medium">
                    {startIndex + index + 1}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleView(doc)}
                        className="text-blue-600 hover:underline font-medium text-left flex items-center gap-2 w-fit"
                      >
                        📄 {doc.name}
                      </button>
                      <span className="text-xs text-slate-500">
                        {doc.fileSize || "N/A"}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    {doc.analysis ? (
                      <div className="flex flex-col gap-1 max-w-md">
                        <p className="text-sm font-semibold text-slate-800">
                          {doc.analysis.title || "No title"}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {doc.analysis.summary || "No summary"}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {doc.analysis.category && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {doc.analysis.category}
                            </span>
                          )}
                          {doc.analysis.pageCount && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {doc.analysis.pageCount} pages
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No analysis
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-sm text-slate-600">{doc.date}</td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                        title="View Document"
                      >
                        <FaEye size={16} />
                      </button>

                      {/* ⭐ Tombol Ask AI */}
                      <button
                        onClick={() => setAskDoc(doc)}
                        className="text-emerald-600 hover:text-emerald-800 p-2 hover:bg-emerald-50 rounded-lg transition"
                        title="Ask AI about this document"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deleting === doc.id}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Document"
                      >
                        {deleting === doc.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <FaTrash size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ask AI Modal */}
      {askDoc && <AskPDFModal doc={askDoc} onClose={() => setAskDoc(null)} />}
    </>
  );
}
