"use client";
import { useState } from "react";

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function UploadModal({ show, onClose, onAdd }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!show) return null;

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onAdd(data.fileName); // Tambahkan nama file ke daftar dokumen
        onClose();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

        {/* Input File */}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border border-gray-300 rounded-lg p-2 w-full mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
