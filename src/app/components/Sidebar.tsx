"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, MessageSquare, Home, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0 }}
      className="h-screen bg-white shadow-xl border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        {!collapsed && (
          <h1 className="text-lg font-semibold text-blue-600 tracking-tight">
            ☁️ CloudDocs
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-slate-500 hover:text-blue-600 transition"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 text-slate-700">
        <SidebarLink
          href="/"
          icon={<Home size={18} />}
          label="Home"
          collapsed={collapsed}
        />
        <SidebarLink
          href="/documents"
          icon={<FileText size={18} />}
          label="Documents"
          collapsed={collapsed}
        />
        <SidebarLink
          href="/chat"
          icon={<MessageSquare size={18} />}
          label="Chatbot"
          collapsed={collapsed}
        />
      </nav>
    </motion.aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-blue-100 text-blue-700 font-semibold"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          isActive ? "text-blue-600" : ""
        }`}
      >
        {icon}
      </div>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
