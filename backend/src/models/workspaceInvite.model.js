import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
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
      enum: ["editor", "viewer"],
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

/* Indexes */
workspaceInviteSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);
workspaceInviteSchema.index({ userId: 1 });
workspaceInviteSchema.index({ status: 1 });

export default mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema
);
