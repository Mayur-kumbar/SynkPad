import mongoose from "mongoose"

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

/* Indexes */
workspaceSchema.index({ ownerId: 1 })

export default mongoose.model("Workspace", workspaceSchema)
