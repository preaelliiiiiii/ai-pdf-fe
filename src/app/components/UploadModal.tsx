"use client";
import { useState } from "react";
import api from "@/app/lib/api";

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (document: any) => void;
}

export default function UploadModal({
  show,
  onClose,
  onAdd,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  if (!show) return null;

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first!");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed!");
      return;
    }

    setUploading(true);
    setError("");
    setProgress("Uploading file...");

    try {
      setProgress("Uploading to S3...");
      const result = await api.uploadPDF(file);

      if (result.success) {
        setProgress("Analyzing with AI...");

        // Format data untuk frontend
        const newDoc = {
          id: result.data.id,
          name: result.data.originalName,
          fileName: result.data.fileName,
          date: new Date(result.data.uploadedAt).toLocaleDateString("id-ID"),
          uploadedAt: result.data.uploadedAt,
          fileSize: result.data.fileSizeFormatted,
          url: result.data.url,
          analysis: result.data.analysis,
        };

        setProgress("Complete! ✅");
        setTimeout(() => {
          onAdd(newDoc);
          onClose();
          resetForm();
        }, 500);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong during upload!");
      setProgress("");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError("");
    setProgress("");
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-[450px] border border-slate-200">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">
          📤 Upload PDF Document
        </h2>

        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select PDF File
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
            disabled={uploading}
            className="border border-slate-300 rounded-lg p-2 w-full text-sm
                     file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {file && (
            <p className="text-xs text-slate-600 mt-2">
              📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {progress}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300
                     disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition
                     flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span>
                Uploading...
              </>
            ) : (
              "Upload & Analyze"
            )}
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 mt-4">
          💡 File akan diupload ke S3 dan dianalisis menggunakan Google Gemini
          AI
        </p>
      </div>
    </div>
  );
}
