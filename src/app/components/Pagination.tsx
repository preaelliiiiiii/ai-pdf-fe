"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null; // kalau cuma 1 halaman, sembunyikan

  return (
    <div className="flex justify-center items-center gap-2 py-4 sticky bottom-0">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg border ${
          currentPage === 1
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-blue-600 border-blue-200 hover:bg-blue-50"
        }`}
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded-lg border ${
            currentPage === i + 1
              ? "bg-blue-600 text-white border-blue-600"
              : "text-slate-700 border-slate-200 hover:bg-blue-50"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg border ${
          currentPage === totalPages
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-blue-600 border-blue-200 hover:bg-blue-50"
        }`}
      >
        Next
      </button>
    </div>
  );
}
