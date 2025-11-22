"use client";
import { Dispatch, SetStateAction } from "react";
import { FaTrash } from "react-icons/fa";

type Props = {
  documents: { id: number; name: string; date: string }[];
  setDocuments: Dispatch<
    SetStateAction<{ id: number; name: string; date: string }[]>
  >;
  startIndex: number; // posisi awal untuk nomor urut
};

export default function DocumentList({ documents, setDocuments, startIndex }: Props) {
  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <table className="w-full bg-white rounded-xl shadow">
      <thead>
        <tr className="bg-gray-100 text-gray-700 text-left">
          <th className="p-4">No</th>
          <th className="p-4">Document Name</th>
          <th className="p-4">Date</th>
          <th className="p-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {documents.length === 0 ? (
          <tr>
            <td colSpan={4} className="p-6 text-center text-gray-500">
              No documents uploaded yet.
            </td>
          </tr>
        ) : (
          documents.map((doc, index) => (
            <tr key={doc.id}>
              <td className="p-4">{startIndex + index + 1}</td>
              <td className="p-4">
                <a
                  href={`/uploads/${doc.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {doc.name}
                </a>
              </td>
              <td className="p-4">{doc.date}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  <FaTrash size={16} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
