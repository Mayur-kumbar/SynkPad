"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Folder } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import CreateWorkspaceModal from "@/components/ui/CreateWorkspaceModal"
import Header from "@/components/ui/Header"

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get("/api/workspaces")
      setWorkspaces(response.data)
    } catch (error) {
      console.error("Fetch workspaces error:", error)
    }
  }

  const createWorkspace = async (workspaceData) => {
    try {
      await axios.post("/api/workspaces", workspaceData)
      fetchWorkspaces()
    } catch (error) {
      console.error("Create workspace error:", error)
    }
  }

  const mockWorkspaces = [
    {
      id: 1,
      name: "Mayur's Design Team",
      docCount: 4,
      lastActive: "2 hours ago",
      members: ["MK", "AR", "LP"],
      extraMembers: 2,
    },
    {
      id: 2,
      name: "Product Development",
      docCount: 12,
      lastActive: "1 day ago",
      members: ["JD", "SK"],
      extraMembers: 5,
    },
    {
      id: 3,
      name: "Marketing Campaign",
      docCount: 8,
      lastActive: "3 days ago",
      members: ["MR", "TK"],
      extraMembers: 3,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Workspaces</h1>
            <p className="text-[#94a3b8]">Manage and access all your collaborative spaces</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search workspaces and documents..."
            className="w-full pl-12 pr-4 py-3 bg-[#1a1f28] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWorkspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspace/${workspace.id}`}
              className="bg-[#1a1f28] border border-[#2d3748] rounded-xl p-6 hover:bg-[#252b36] hover:border-[#7de0c6] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#252b36] rounded-lg flex items-center justify-center shrink-0">
                  <Folder className="w-6 h-6 text-[#7de0c6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{workspace.name}</h3>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    {workspace.docCount} docs • last active {workspace.lastActive}
                  </p>
                  <div className="flex items-center gap-1">
                    {workspace.members.map((member, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          idx === 0
                            ? "bg-[#7de0c6] text-[#0f1419]"
                            : idx === 1
                              ? "bg-[#fbbf24] text-[#0f1419]"
                              : "bg-[#60a5fa] text-white"
                        }`}
                      >
                        {member}
                      </div>
                    ))}
                    {workspace.extraMembers > 0 && (
                      <div className="w-7 h-7 rounded-full bg-[#252b36] flex items-center justify-center text-xs text-[#94a3b8]">
                        +{workspace.extraMembers}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={createWorkspace} />
    </div>
  )
}
