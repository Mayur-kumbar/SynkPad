"use client";

import Link from "next/link";
import { Layers, Bell, Settings, User, LogOut } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
        await api.post("/auth/logout", {}, { withCredentials: true})
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
  }

  return (
    <header className="bg-[#1a1f28] border-b border-[#2d3748] sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7de0c6] rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#0f1419]" />
          </div>
          <span className="text-xl font-semibold text-white">SynkPad</span>
        </Link>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#252b36] rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Link
            href="/settings"
            className="w-10 h-10 flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#252b36] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-[#7de0c6] rounded-full flex items-center justify-center text-sm font-medium text-[#0f1419] hover:bg-[#68c9ad] transition-colors"
            >
              MK
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1f28] border border-[#2d3748] rounded-lg shadow-xl py-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#252b36] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full cursor-pointer text-white hover:bg-[#252b36] transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
