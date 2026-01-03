"use client";

import api from "@/lib/api";
import { X, Mail, Check, XCircle, Clock, User, Folder } from "lucide-react";

export default function InvitesModal({ isOpen, onClose, invites, onInviteAccepted }) {
  if (!isOpen) return null;

  const getTimeAgo = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-[#7de0c6]/20 text-[#7de0c6] border-[#7de0c6]/30";
      case "editor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "viewer":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-[#252b36] text-[#94a3b8] border-[#2d3748]";
    }
  };

  const handleInviteAccept = async (inviteId) => {
    try {
        const res = await api.post(`/workspace/invites/accept/${inviteId}`)
        console.log("Invite accepted:", res.data)
        onClose();
        onInviteAccepted();
    } catch (error) {
        console.error("Accept invite error:", error)    
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a1f28] to-[#161b24] border border-[#2d3748] rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7de0c6]/20 to-[#7de0c6]/5 flex items-center justify-center border border-[#7de0c6]/30">
              <Mail className="w-5 h-5 text-[#7de0c6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Workspace Invitations
              </h2>
              <p className="text-sm text-[#94a3b8] mt-0.5">
                {invites?.length || 0} pending invitation
                {invites?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#252b36] transition-colors"
          >
            <X className="w-5 h-5 text-[#94a3b8]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!invites || invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#252b36] to-[#1f242e] flex items-center justify-center mb-4 border border-[#2d3748]">
                <Mail className="w-8 h-8 text-[#7de0c6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No pending invitations
              </h3>
              <p className="text-sm text-[#94a3b8] max-w-sm">
                You don&apos;t have any workspace invitations at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite._id}
                  className="group relative bg-gradient-to-br from-[#1f242e] to-[#1a1f28] border border-[#2d3748] rounded-xl p-5 hover:border-[#7de0c6]/50 transition-all duration-300"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7de0c6]/0 to-[#7de0c6]/0 group-hover:from-[#7de0c6]/5 group-hover:to-transparent transition-all duration-300 rounded-xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Invite Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#252b36] to-[#1f242e] flex items-center justify-center shrink-0 border border-[#2d3748]/50">
                          <Folder className="w-6 h-6 text-[#7de0c6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-white mb-1 truncate">
                            {invite.workspaceId.name}
                          </h4>
                          <p className="text-sm text-[#94a3b8] mb-2">
                            Invited by{" "}
                            <span className="text-[#7de0c6] font-medium">
                              {invite.invitedBy.name}
                            </span>
                          </p>
                          {invite.workspaceId.description && (
                            <p className="text-sm text-[#94a3b8] border-l-2 border-[#2d3748] pl-3 py-1">
                              {invite.workspaceId.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Time badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252b36]/50 text-xs text-[#94a3b8] shrink-0 ml-3">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(invite.createdAt)}</span>
                      </div>
                    </div>

                    {/* Invite Details */}
                    <div className="flex items-center gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252b36]/50 text-[#94a3b8]">
                        <User className="w-3 h-3" />
                        <span>{invite.invitedBy.email}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getRoleBadgeColor(invite.role)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="capitalize font-medium">{invite.role}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>handleInviteAccept(invite._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7de0c6] text-[#0f1419] font-medium rounded-lg hover:bg-[#68c9ad] transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          // Reject invite logic
                          console.log("Reject invite:", invite._id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#252b36] text-[#94a3b8] font-medium rounded-lg hover:bg-[#2a3140] hover:text-white border border-[#2d3748] transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {invites && invites.length > 0 && (
          <div className="p-6 border-t border-[#2d3748] bg-[#1a1f28]/50">
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#94a3b8]">
                Review your invitations carefully before accepting
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-[#7de0c6] font-medium hover:text-[#68c9ad] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}