"use client"

import { useState } from "react"
import { X, Folder, Lightbulb } from "lucide-react"

export default function CreateWorkspaceModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [privacy, setPrivacy] = useState("team")

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({ name, description, privacy })
    setName("")
    setDescription("")
    setPrivacy("team")
    onClose()
  }

  if (!isOpen) return null

  const baseRadioClass = "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all"
  const selectedClass = baseRadioClass + " bg-[#252b36] border-[#7de0c6]"
  const unselectedClass = baseRadioClass + " bg-[#0f1419] border-[#2d3748] hover:border-[#3d4758]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-[#1a1f28] border border-[#2d3748] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-bold text-white">Create New Workspace</h2>
          <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Team, Product Development"
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent"
            />
            <p className="mt-1.5 text-xs text-[#64748b]">Choose a name that describes your team or project</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
              rows={3}
              className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Workspace Icon</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#7de0c6] rounded-xl flex items-center justify-center">
                <Folder className="w-7 h-7 text-[#0f1419]" />
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#252b36] text-white text-sm font-medium rounded-lg hover:bg-[#2d3748] transition-colors"
              >
                Choose Icon
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-3">Privacy</label>
            <div className="space-y-2">
              <label className={privacy === "private" ? selectedClass : unselectedClass}>
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacy === "private"}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="mt-0.5 w-4 h-4 accent-[#7de0c6]"
                />
                <div>
                  <span className="block text-white font-medium">Private</span>
                  <span className="text-sm text-[#64748b]">Only invited members can access this workspace</span>
                </div>
              </label>
              <label className={privacy === "team" ? selectedClass : unselectedClass}>
                <input
                  type="radio"
                  name="privacy"
                  value="team"
                  checked={privacy === "team"}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="mt-0.5 w-4 h-4 accent-[#7de0c6]"
                />
                <div>
                  <span className="block text-white font-medium">Team</span>
                  <span className="text-sm text-[#64748b]">Anyone in your organization can join</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#0f1419] border border-[#2d3748] rounded-lg mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-[#7de0c6]" />
            </div>
            <div>
              <span className="block text-white font-medium text-sm">Pro Tip</span>
              <span className="text-xs text-[#64748b]">
                You can invite team members after creating the workspace. Start with a clear name and description to
                help others understand its purpose.
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
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
