"use client";

import api from "@/lib/api";
import getLastActiveTime from "@/lib/getLastActiveTime";
import { X, Send } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function CommentsPanel({ documentDetails }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!documentDetails?._id || !documentDetails?.workspaceId) return;

    try {
      const response = await api.get(
        `/workspace/${documentDetails.workspaceId}/document/${documentDetails._id}/comments`
      );
      setComments(response.data.comments);
      console.log(response.data);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  }, [documentDetails]);

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(
        `/workspace/${documentDetails.workspaceId}/document/${documentDetails._id}/comment`,
        { text: newComment.trim() }
      );

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Post comment error:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (!documentDetails) return null;

  return (
    <>
      {isPanelOpen ? (
        <aside className="w-80 bg-[#1a1f28] border-l border-[#2d3748] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2d3748] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Comments</h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-[#94a3b8] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {comments.length === 0 && (
              <div className="py-12 text-center text-[#94a3b8] border-2 border-dashed border-[#2d3748] rounded-xl">
                No comments yet. Be the first to comment.
              </div>
            )}

            {comments.map((comment) => (
              
              <div key={comment._id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 bg-green-800  rounded-full flex items-center justify-center text-xs font-medium text-[#0f1419]`}
                >
                   {comment.author.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      {getLastActiveTime(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-[#e2e8f0] leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-[#2d3748]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
                className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8]"
              />
              <button
                onClick={postComment}
                disabled={!newComment.trim()}
                className="w-10 h-10 flex items-center justify-center bg-[#7de0c6] text-[#0f1419] rounded-lg hover:bg-[#68c9ad] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      ) : (
        <div className="fixed right-0 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-2 py-8 bg-[#252b36] border-l border-t border-b border-[#2d3748] text-white rounded-l-lg hover:bg-[#2d3748]"
          >
            <span className="text-xl">‹</span>
          </button>
        </div>
      )}
    </>
  );
}
