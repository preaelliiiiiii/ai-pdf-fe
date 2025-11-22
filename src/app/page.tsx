"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 text-center relative overflow-hidden">
      {/* Background subtle blur or glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 max-w-3xl px-4"
      >
        <h1 className="text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-md leading-tight">
          ☁️ CloudDocs ChatAI
        </h1>
        <p className="text-gray-700 mb-10 text-2xl leading-relaxed">
          Kelola dokumen Anda dan berinteraksi dengan{" "}
          <span className="font-semibold text-blue-600">AI berbasis cloud</span>{" "}
          untuk pengalaman cerdas dan efisien.
        </p>

        <Link
          href="/chat"
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-blue-700 hover:shadow-xl active:scale-95 transition text-lg font-semibold"
        >
          🚀 Mulai Sekarang
        </Link>
      </motion.div>
    </div>
  );
}
