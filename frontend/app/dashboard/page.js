"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Folder,
  Crown,
  Users,
  MoreVertical,
  Edit2,
  Share2,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import CreateWorkspaceModal from "@/components/ui/CreateWorkspaceModal";
import Header from "@/components/ui/Header";
import { useAuth } from "@/context/AuthContext";
import InvitesModal from "@/components/ui/InvitesModal";

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const { user, loading } = useAuth();

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get("/workspace");
      setWorkspaces(response.data.workspaces);
    } catch (error) {
      console.error("Fetch workspaces error:", error);
    }
  };

  const createWorkspace = async (workspaceData) => {
    try {
      const res = await api.post("/workspace", {
        name: workspaceData.name,
        description: workspaceData.description,
      });
      setWorkspaces((prev) => [...prev, res.data.workspace]);
      // fetchWorkspaces();
    } catch (error) {
      console.error("Create workspace error:", error);
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await api.delete(`/workspace/${workspaceId}`);
      setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
      setOpenDropdown(null);
    } catch (error) {
      console.error("Delete workspace error:", error);
    }
  };

  const getLastActiveTime = (updatedAt) => {
    const diff = Date.now() - new Date(updatedAt).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getOwnerOrMembers = (ownerId) => {
    const isOwner = user && user.id === ownerId;

    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center ${
            isOwner
              ? "bg-[#7de0c6]/15 text-[#7de0c6]"
              : "bg-[#252b36] text-[#94a3b8] border border-[#2d3748]"
          }`}
        >
          {isOwner ? (
            <Crown className="w-4 h-4" />
          ) : (
            <Users className="w-4 h-4" />
          )}
        </div>
        <span
          className={`text-xs font-medium uppercase ${
            isOwner ? "text-[#7de0c6]" : "text-[#94a3b8]"
          }`}
        >
          {isOwner ? "Owner (You)" : "Member"}
        </span>
      </div>
    );
  };

  const handleInvites = async () => {
    try {
      const res = await api.get("/workspace/invites");
      setInvites(res.data.invites);
      console.log("Invites fetched:", res.data.invites);
      setIsInvitesModalOpen(true);
    } catch (error) {
      console.error("Fetch invites error:", error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  if (loading) return null; // or spinner

  if (!user) {
    return null; // AuthContext will redirect
  }
  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Workspaces
            </h1>
            <p className="text-[#94a3b8]">
              Manage and access all your collaborative spaces
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleInvites}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1f28] border border-[#2d3748] text-white font-medium rounded-lg hover:bg-[#252b36] transition-colors"
            >
              <Users className="w-5 h-5" />
              My Invites
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Workspace
            </button>
          </div>
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

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#252b36] to-[#1f242e] flex items-center justify-center mb-6 border border-[#2d3748]">
              <Folder className="w-8 h-8 text-[#7de0c6]" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              No workspaces yet
            </h2>

            <p className="text-[#94a3b8] max-w-sm mb-6">
              Create your first workspace to start collaborating and organizing
              your documents.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces
              .filter((workspace) =>
                workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((workspace) => (
              <Link
                key={workspace._id}
                href={`/workspace/${workspace._id}`}
                className="group relative bg-gradient-to-br from-[#1a1f28] to-[#161b24] 
                   border border-[#2d3748] rounded-2xl p-6
                   hover:border-[#7de0c6] hover:shadow-lg hover:shadow-[#7de0c6]/10
                   transition-all duration-300 ease-out
                   hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7de0c6]/0 to-[#7de0c6]/0 group-hover:from-[#7de0c6]/5 group-hover:to-transparent transition-all duration-300 rounded-2xl pointer-events-none" />

                {/* Content wrapper */}
                <div className="relative z-10">
                  {/* Top metadata row */}
                  <div className="mb-4 flex items-center justify-between">
                    {getOwnerOrMembers(workspace.ownerId)}

                    {/* Three dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenDropdown(
                            openDropdown === workspace._id
                              ? null
                              : workspace._id
                          );
                        }}
                        className="p-2 rounded-lg hover:bg-[#252b36] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4 text-[#94a3b8]" />
                      </button>

                      {openDropdown === workspace._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-48 bg-[#1a1f28] border border-[#2d3748] rounded-lg shadow-xl z-20"
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Rename workspace:", workspace._id);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#252b36] hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Rename</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Share workspace:", workspace._id);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#252b36] hover:text-white transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>

                          <div className="border-t border-[#2d3748] my-1" />

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Delete "${workspace.name}"? This action cannot be undone.`
                                )
                              ) {
                                deleteWorkspace(workspace._id);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex items-start gap-4">
                    {/* Icon with enhanced styling */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#252b36] to-[#1f242e] flex items-center justify-center group-hover:from-[#2a3140] group-hover:to-[#252b36] group-hover:scale-105 transition-all duration-300 shrink-0 shadow-inner border border-[#2d3748]/50">
                      <Folder className="w-7 h-7 text-[#7de0c6] group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate mb-2 group-hover:text-[#7de0c6] transition-colors duration-200">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-[#94a3b8] line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                        {workspace.description || "No description provided."}
                      </p>

                      {/* Footer meta with enhanced styling */}
                      <div className="flex items-center gap-4 text-xs text-[#64748b] font-medium">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252b36]/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7de0c6]" />
                          <span>
                            {workspace.docCount}{" "}
                            {workspace.docCount === 1 ? "doc" : "docs"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="opacity-60">Updated</span>
                          <span className="text-[#94a3b8]">
                            {getLastActiveTime(workspace.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createWorkspace}
      />

      <InvitesModal
        isOpen={isInvitesModalOpen}
        onClose={() => {
          setIsInvitesModalOpen(false);
        }}
        invites={invites}
        onInviteAccepted={fetchWorkspaces}
      />
    </div>
  );
}
