"use client"

import { useState } from "react"
import { X, FileText, Pencil, Layers, FileStack, Zap, ChevronDown } from "lucide-react"

export default function CreateDocumentModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("")
  const [docType, setDocType] = useState("document")
  const [template, setTemplate] = useState("blank")
  const [sharing, setSharing] = useState("private")

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({ name, docType, template, sharing })
    setName("")
    setDocType("document")
    setTemplate("blank")
    setSharing("private")
    onClose()
  }

  if (!isOpen) return null

  const baseTypeClass = "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
  const selectedTypeClass = baseTypeClass + " bg-[#252b36] border-[#7de0c6]"
  const unselectedTypeClass = baseTypeClass + " bg-[#0f1419] border-[#2d3748] hover:border-[#3d4758]"

  const baseSharingClass = "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all"
  const selectedSharingClass = baseSharingClass + " bg-[#252b36] border-[#7de0c6]"
  const unselectedSharingClass = baseSharingClass + " bg-[#0f1419] border-[#2d3748] hover:border-[#3d4758]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-[#1a1f28] border border-[#2d3748] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-bold text-white">Create New Document</h2>
          <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mb-5">
            <label className="block text-sm font-medium text-white mb-2">Document Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Roadmap, Meeting Notes"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent"
            />
            <p className="mt-1.5 text-xs text-[#64748b]">Give your document a descriptive name</p>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-white mb-3">Document Type</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={docType === "document" ? selectedTypeClass : unselectedTypeClass}>
                <input
                  type="radio"
                  name="docType"
                  value="document"
                  checked={docType === "document"}
                  onChange={(e) => setDocType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={
                    docType === "document"
                      ? "w-6 h-6 rounded flex items-center justify-center bg-[#7de0c6]"
                      : "w-6 h-6 rounded flex items-center justify-center bg-[#252b36]"
                  }
                >
                  <FileText
                    className={docType === "document" ? "w-3.5 h-3.5 text-[#0f1419]" : "w-3.5 h-3.5 text-[#7de0c6]"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-white text-sm font-medium">Document</span>
                  <span className="text-xs text-[#64748b]">Rich text editor with blocks</span>
                </div>
              </label>

              <label className={docType === "whiteboard" ? selectedTypeClass : unselectedTypeClass}>
                <input
                  type="radio"
                  name="docType"
                  value="whiteboard"
                  checked={docType === "whiteboard"}
                  onChange={(e) => setDocType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={
                    docType === "whiteboard"
                      ? "w-6 h-6 rounded flex items-center justify-center bg-[#60a5fa]"
                      : "w-6 h-6 rounded flex items-center justify-center bg-[#252b36]"
                  }
                >
                  <Pencil
                    className={docType === "whiteboard" ? "w-3.5 h-3.5 text-[#0f1419]" : "w-3.5 h-3.5 text-[#60a5fa]"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-white text-sm font-medium">Whiteboard</span>
                  <span className="text-xs text-[#64748b]">Visual canvas for diagrams</span>
                </div>
              </label>

              <label className={docType === "combined" ? selectedTypeClass : unselectedTypeClass}>
                <input
                  type="radio"
                  name="docType"
                  value="combined"
                  checked={docType === "combined"}
                  onChange={(e) => setDocType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={
                    docType === "combined"
                      ? "w-6 h-6 rounded flex items-center justify-center bg-[#7de0c6]"
                      : "w-6 h-6 rounded flex items-center justify-center bg-[#252b36]"
                  }
                >
                  <Layers
                    className={docType === "combined" ? "w-3.5 h-3.5 text-[#0f1419]" : "w-3.5 h-3.5 text-[#7de0c6]"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-white text-sm font-medium">Combined</span>
                  <span className="text-xs text-[#64748b]">Document + Whiteboard</span>
                </div>
              </label>

              <label className={docType === "template" ? selectedTypeClass : unselectedTypeClass}>
                <input
                  type="radio"
                  name="docType"
                  value="template"
                  checked={docType === "template"}
                  onChange={(e) => setDocType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={
                    docType === "template"
                      ? "w-6 h-6 rounded flex items-center justify-center bg-[#f97316]"
                      : "w-6 h-6 rounded flex items-center justify-center bg-[#252b36]"
                  }
                >
                  <FileStack
                    className={docType === "template" ? "w-3.5 h-3.5 text-[#0f1419]" : "w-3.5 h-3.5 text-[#f97316]"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-white text-sm font-medium">From Template</span>
                  <span className="text-xs text-[#64748b]">Start with a template</span>
                </div>
              </label>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-white mb-2">Template (optional)</label>
            <div className="relative">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent"
              >
                <option value="blank">Blank Document</option>
                <option value="meeting">Meeting Notes</option>
                <option value="roadmap">Product Roadmap</option>
                <option value="spec">Technical Spec</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-white mb-3">Sharing</label>
            <div className="space-y-2">
              <label className={sharing === "private" ? selectedSharingClass : unselectedSharingClass}>
                <input
                  type="radio"
                  name="sharing"
                  value="private"
                  checked={sharing === "private"}
                  onChange={(e) => setSharing(e.target.value)}
                  className="mt-0.5 w-4 h-4 accent-[#7de0c6]"
                />
                <div>
                  <span className="block text-white font-medium">Private to me</span>
                  <span className="text-sm text-[#64748b]">Only you can access this document</span>
                </div>
              </label>
              <label className={sharing === "workspace" ? selectedSharingClass : unselectedSharingClass}>
                <input
                  type="radio"
                  name="sharing"
                  value="workspace"
                  checked={sharing === "workspace"}
                  onChange={(e) => setSharing(e.target.value)}
                  className="mt-0.5 w-4 h-4 accent-[#7de0c6]"
                />
                <div>
                  <span className="block text-white font-medium">Workspace members</span>
                  <span className="text-sm text-[#64748b]">All workspace members can view and edit</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#0f1419] border border-[#2d3748] rounded-lg mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#7de0c6]" />
            </div>
            <div>
              <span className="block text-white font-medium text-sm">Quick Start</span>
              <span className="text-xs text-[#64748b]">
                You can always change the document type, sharing settings, and add collaborators later. Start creating
                and invite your team when ready.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-white font-medium hover:bg-[#252b36] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
