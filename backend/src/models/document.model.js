import mongoose from "mongoose"

const documentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    docType: {
      type: String,
      enum: ["document", "whiteboard", "combined"],
      required: true,
      default: "document",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastEditedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

/* Indexes */
documentSchema.index({ workspaceId: 1 })
documentSchema.index({ createdBy: 1 })

export default mongoose.model("Document", documentSchema)
