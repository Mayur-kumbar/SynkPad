"use client"

import Link from "next/link"
import { ChevronLeft, Download, Users, Clock } from "lucide-react"
import getLastActiveTime from "@/lib/getLastActiveTime"

export default function DocumentHeader({ documentDetails }) {
  return (
    <header className="bg-[#1a1f28] border-b border-[#2d3748] px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/workspace/${documentDetails?.workspaceId}`}className="text-[#94a3b8] hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Workspace
              </Link>
              <span>›</span>
              <Link href={`/workspace/${documentDetails?.workspaceId}`} className="hover:text-white transition-colors">
                Document
              </Link>
              <span>›</span>
              <span className="text-white">{documentDetails?.title}</span>
            </div>
            <h1 className="text-xl font-semibold text-white">{documentDetails?.title}</h1>
            <p className="text-sm text-[#94a3b8] mt-0.5">Last edited {getLastActiveTime(documentDetails?.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
         
          <button className="flex items-center gap-2 px-4 py-2 bg-[#252b36] border border-[#2d3748] text-white rounded-lg hover:bg-[#2d3748] transition-colors">
            <Users className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#252b36] border border-[#2d3748] text-white rounded-lg hover:bg-[#2d3748] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#252b36] border border-[#2d3748] text-white rounded-lg hover:bg-[#2d3748] transition-colors">
            <Clock className="w-4 h-4" />
            Snapshots
          </button>
        </div>
      </div>
    </header>
  )
}
