import mongoose from "mongoose"

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

/* Indexes */
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
)
workspaceMemberSchema.index({ userId: 1 })
workspaceMemberSchema.index({ workspaceId: 1 })

export default mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
)
