import mongoose from "mongoose"

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

/* Indexes */
workspaceSchema.index({ ownerId: 1 })

export default mongoose.model("Workspace", workspaceSchema)
