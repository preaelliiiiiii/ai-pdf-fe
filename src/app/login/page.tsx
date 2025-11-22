"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      router.push("/documents"); // ✅ redirect setelah login
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* 🌈 Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 animate-gradient-x"></div>

      {/* 🔮 Decorative light effects */}
      <div className="absolute top-20 left-40 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>

      {/* 🧊 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/90 backdrop-blur-2xl shadow-2xl rounded-3xl w-full max-w-2xl p-12 border border-white/40 z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-3 tracking-tight drop-shadow-sm">
            ☁️ CloudDocs
          </h1>
          <p className="text-slate-500 text-lg">
            Masuk untuk mengelola dokumen dan berinteraksi dengan AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-7">
          <div>
            <label className="block text-base font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white/70">
              <Mail size={22} className="text-slate-400 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full text-lg outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white/70">
              <Lock size={22} className="text-slate-400 mr-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-lg outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition"
          >
            Masuk Sekarang
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-600 text-base mt-10">
          Belum punya akun?{" "}
          <span className="text-blue-700 hover:underline cursor-pointer">
            Daftar Sekarang
          </span>
        </p>
      </motion.div>
    </div>
  );
}
