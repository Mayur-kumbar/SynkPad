"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, Plus, FileText, Pencil, Users, ChevronLeft, MoreVertical, Edit2, Copy, Download, Trash2, X } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import Header from "@/components/ui/Header"
import { useAuth } from "@/context/AuthContext"
import SendInviteModal from "@/components/SendInviteModal"
import CreateDocumentModal from "@/components/CreateDocumentModal"

export default function WorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [workspaceDetails, setWorkspaceDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [documentToRename, setDocumentToRename] = useState(null)
  const [newTitle, setNewTitle] = useState("")
  const [renameError, setRenameError] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const { user, loading } = useAuth()

  const fetchWorkspaceData = async () => {
    try {
      const [docRes, detailRes] = await Promise.all([
        api.get(`/workspace/${params.id}/documents`),
        api.get(`/workspace/${params.id}`),
      ])
      setDocuments(docRes.data.documents)
      console.log(docRes.data.documents)
      setWorkspaceDetails(detailRes.data)
      console.log(detailRes.data)
    } catch (error) {
      console.error("Fetch workspace data error:", error)
    }
  }

  const createDocument = async (docData) => {
    try {
      const response = await api.post(`/workspace/${params.id}/document`, docData)
      setDocuments((prevDocs) => [response.data.document, ...prevDocs])
    } catch (error) {
      console.error("Create document error:", error)
    }
  }

  const deleteDocument = async (documentId) => {
    try {
      console.log("Deleting document:", documentId)
      await api.delete(`/workspace/${params.id}/document/${documentId}`)
      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId))
      setOpenDropdown(null)
    } catch (error) {
      console.error("Delete document error:", error)
    }
  }

  const duplicateDocument = async (doc) => {
    try {
      const response = await api.post(`/workspace/${params.id}/document`, {
        title: `${doc.title} (Copy)`,
        type: doc.type,
      })
      setDocuments((prev) => [response.data.document, ...prev])
      setOpenDropdown(null)
    } catch (error) {
      console.error("Duplicate document error:", error)
    }
  }

  const openRenameModal = (doc) => {
    setDocumentToRename(doc)
    setNewTitle(doc.title)
    setIsRenameModalOpen(true)
    setOpenDropdown(null)
  }

  const closeRenameModal = () => {
    setIsRenameModalOpen(false)
    setDocumentToRename(null)
    setNewTitle("")
    setRenameError("")
  }

  const handleDocumentRename = async (e) => {
    e.preventDefault()
    setRenameError("")

    if (!newTitle.trim()) {
      setRenameError("Document title is required")
      return
    }

    if (newTitle.trim() === documentToRename.title) {
      closeRenameModal()
      return
    }

    setIsRenaming(true)

    try {
      await api.patch(`/workspace/${params.id}/document/${documentToRename._id}`, {
        newTitle: newTitle.trim()
      })
      setDocuments((prev) => prev.map(doc => doc._id === documentToRename._id ? { ...doc, title: newTitle.trim() } : doc))
      closeRenameModal()
    } catch (error) {
      console.error("Rename document error:", error)
      setRenameError(error.response?.data?.message || "Failed to rename document")
    } finally {
      setIsRenaming(false)
    }
  }

  const handleSendInvite = async(inviteData) => {
    try {
      await api.post(`/workspace/${params.id}/invite`, {
        email: inviteData.email,
        role: inviteData.role,
      })
      console.log("Invite sent successfully")
    } catch (error) {
      console.error("Send invite error:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWorkspaceData()
    }
  }, [user])

  if(loading){
    return null;
  }

  if(!user){
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Workspaces
        </Link>

        {/* Workspace Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7de0c6] rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#0f1419]" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {workspaceDetails?.workspace?.name || "Loading..."}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 mr-2">
              {workspaceDetails?.members?.slice(0, 3).map((member, idx) => (
                <div
                  key={member.id}
                  title={member.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 border-[#1a1f28] ${
                    idx === 0
                      ? "bg-[#7de0c6] text-[#0f1419]"
                      : idx === 1
                      ? "bg-[#fbbf24] text-[#0f1419]"
                      : "bg-[#60a5fa] text-white"
                  }`}
                >
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {workspaceDetails?.members?.length > 3 && (
                <div className="w-8 h-8 bg-[#252b36] rounded-full flex items-center justify-center text-xs font-medium text-[#94a3b8] border-2 border-[#1a1f28]">
                  +{workspaceDetails.members.length - 3}
                </div>
              )}
            </div>
            <button onClick={() => setIsInvitesModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1f28] border border-[#2d3748] text-white font-medium rounded-lg hover:bg-[#252b36] transition-colors">
              <Users className="w-5 h-5" />
              Invite
            </button>
          </div>
        </div>

        {/* Documents Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Documents</h2>
            <p className="text-[#94a3b8]">
              {documents.length} {documents.length === 1 ? "document" : "documents"} in this workspace
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Document
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-12 pr-4 py-3 bg-[#1a1f28] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {documents
            .filter((doc) =>
              doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((doc) => (
              <div
                key={doc._id}
                className="group relative flex items-center gap-4 bg-[#1a1f28] border border-[#2d3748] rounded-xl p-4 hover:bg-[#252b36] hover:border-[#7de0c6] transition-all"
              >
                <Link
                  href={
                    doc.type === "whiteboard"
                      ? `/whiteboard/${doc._id}`
                      : `/workspace/${params.id}/doc/${doc._id}`
                  }
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      doc.type === "document" ? "bg-[#7de0c6]" : "bg-[#60a5fa]"
                    }`}
                  >
                    {doc.type === "document" ? (
                      <FileText className="w-5 h-5 text-[#0f1419]" />
                    ) : (
                      <Pencil className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-[#94a3b8]">
                      Last edited {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>

                {/* Three dot menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === doc._id ? null : doc._id
                      );
                    }}
                    className="p-2 rounded-lg hover:bg-[#2a3140] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4 text-[#94a3b8]" />
                  </button>

                  {openDropdown === doc._id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-1 w-48 bg-[#1a1f28] border border-[#2d3748] rounded-lg shadow-xl z-20"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openRenameModal(doc);
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
                          duplicateDocument(doc);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#252b36] hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Download document:", doc._id);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#252b36] hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>

                      <div className="border-t border-[#2d3748] my-1" />

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete "${doc.title}"? This action cannot be undone.`
                            )
                          ) {
                            deleteDocument(doc._id);
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
            ))}

          {documents.length === 0 && (
            <div className="py-12 text-center text-[#94a3b8] border-2 border-dashed border-[#2d3748] rounded-xl">
              No documents found. Create your first one to get started!
            </div>
          )}
        </div>
      </main>

      <CreateDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={createDocument} />
      <SendInviteModal isOpen={isInvitesModalOpen} onClose={() => {setIsInvitesModalOpen(false)}} onSendInvite={handleSendInvite} workspaceName={workspaceDetails?.workspace?.name}/>
      
      {/* Rename Document Modal */}
      {isRenameModalOpen && documentToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeRenameModal} />
          <div className="relative w-full max-w-md bg-gradient-to-br from-[#1a1f28] to-[#161b24] border border-[#2d3748] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7de0c6]/20 to-[#7de0c6]/5 flex items-center justify-center border border-[#7de0c6]/30">
                  <Edit2 className="w-5 h-5 text-[#7de0c6]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Rename Document</h2>
                  <p className="text-sm text-[#94a3b8] mt-0.5">Update the document title</p>
                </div>
              </div>
              <button onClick={closeRenameModal} className="p-2 rounded-lg hover:bg-[#252b36] transition-colors">
                <X className="w-5 h-5 text-[#94a3b8]" />
              </button>
            </div>
            <form onSubmit={handleDocumentRename} className="p-6 space-y-5">
              <div className="p-3 bg-[#0f1419] border border-[#2d3748] rounded-lg">
                <p className="text-xs text-[#94a3b8] mb-1">Current title:</p>
                <p className="text-sm text-white font-medium truncate">{documentToRename.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Title</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter new document title"
                    className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent transition-all"
                    disabled={isRenaming}
                    autoFocus
                  />
                </div>
              </div>
              {renameError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{renameError}</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRenameModal}
                  className="flex-1 px-4 py-2.5 bg-[#252b36] text-[#94a3b8] font-medium rounded-lg hover:bg-[#2a3140] hover:text-white border border-[#2d3748] transition-colors"
                  disabled={isRenaming}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRenaming}
                >
                  {isRenaming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0f1419] border-t-transparent rounded-full animate-spin" />
                      Renaming...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}