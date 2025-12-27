"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, Plus, FileText, Pencil, Users, ChevronLeft } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import Header from "@/components/ui/Header"
import CreateDocumentModal from "@/components/ui/CreateDocumentModal"
import { useAuth } from "@/context/AuthContext"
import SendInviteModal from "@/components/ui/SendInviteModal"

export default function WorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [workspaceDetails, setWorkspaceDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false)
  const { user, loading } = useAuth()

  const fetchWorkspaceData = async () => {
    try {
      const [docRes, detailRes] = await Promise.all([
        api.get(`/workspace/${params.id}/documents`),
        api.get(`/workspace/${params.id}`),
      ])
      setDocuments(docRes.data.documents)
      setWorkspaceDetails(detailRes.data)
    } catch (error) {
      console.error("Fetch workspace data error:", error)
    }
  }


  const createDocument = async (docData) => {
    try {
      const response = await api.post(`/workspace/${params.id}/documents`, docData)
      // Navigate to the new document
      if (docData.docType === "whiteboard") {
        router.push(`/whiteboard/new`)
      } else {
        router.push(`/document/new`)
      }
    } catch (error) {
      console.error("Create document error:", error)
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
              <Link
                key={doc._id}
                href={
                  doc.type === "whiteboard"
                    ? `/whiteboard/${doc._id}`
                    : `/doc/${doc._id}`
                }
                className="flex items-center gap-4 bg-[#1a1f28] border border-[#2d3748] rounded-xl p-4 hover:bg-[#252b36] hover:border-[#7de0c6] transition-all"
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
            ))}

          {documents.length === 0 && (
            <div className="py-12 text-center text-[#94a3b8] border-2 border-dashed border-[#2d3748] rounded-xl">
              No documents found. Create your first one to get started!
            </div>
          )}
        </div>
      </main>

      <CreateDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={createDocument} />
      <SendInviteModal isOpen={isInvitesModalOpen} onClose={() => {setIsInvitesModalOpen(false)}} onSendInvite={handleSendInvite}/>
    </div>
  )
}
