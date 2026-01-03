"use client";

import { X, Mail, UserPlus, Shield, Eye, Edit3 } from "lucide-react";
import { useState } from "react";

export default function SendInviteModal({ isOpen, onClose, workspaceName, onSendInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Call parent function to send invite
      await onSendInvite({ email, role });
      
      // Reset form and close
      setEmail("");
      setRole("viewer");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("viewer");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1a1f28] to-[#161b24] border border-[#2d3748] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7de0c6]/20 to-[#7de0c6]/5 flex items-center justify-center border border-[#7de0c6]/30">
              <UserPlus className="w-5 h-5 text-[#7de0c6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Invite to Workspace
              </h2>
              <p className="text-sm text-[#94a3b8] mt-0.5">
                {workspaceName}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[#252b36] transition-colors"
          >
            <X className="w-5 h-5 text-[#94a3b8]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Role
            </label>
            <div className="space-y-3">
              {/* Editor Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  role === "editor"
                    ? "bg-[#7de0c6]/10 border-[#7de0c6] shadow-lg shadow-[#7de0c6]/10"
                    : "bg-[#0f1419] border-[#2d3748] hover:border-[#7de0c6]/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={role === "editor"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-0.5 w-4 h-4 text-[#7de0c6] bg-[#0f1419] border-[#2d3748] focus:ring-[#7de0c6] focus:ring-offset-0"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="w-4 h-4 text-[#7de0c6]" />
                    <span className="font-semibold text-white">Editor</span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">
                    Can create, edit, and delete documents
                  </p>
                </div>
              </label>

              {/* Viewer Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  role === "viewer"
                    ? "bg-[#7de0c6]/10 border-[#7de0c6] shadow-lg shadow-[#7de0c6]/10"
                    : "bg-[#0f1419] border-[#2d3748] hover:border-[#7de0c6]/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={role === "viewer"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-0.5 w-4 h-4 text-[#7de0c6] bg-[#0f1419] border-[#2d3748] focus:ring-[#7de0c6] focus:ring-offset-0"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-[#7de0c6]" />
                    <span className="font-semibold text-white">Viewer</span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">
                    Can only view and comment on documents
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-[#252b36] text-[#94a3b8] font-medium rounded-lg hover:bg-[#2a3140] hover:text-white border border-[#2d3748] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0f1419] border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="px-6 pb-6">
          <div className="p-3 bg-[#7de0c6]/5 border border-[#7de0c6]/20 rounded-lg">
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              <Shield className="w-3 h-3 inline mr-1 text-[#7de0c6]" />
              The user will receive an email invitation to join this workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}