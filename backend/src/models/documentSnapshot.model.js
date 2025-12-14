import mongoose from "mongoose"

const documentSnapshotSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    updateBinary: {
      type: Buffer,
      required: true,
    },

    sizeBytes: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

/* Indexes */
documentSnapshotSchema.index({ documentId: 1 })
documentSnapshotSchema.index({ createdAt: -1 })

export default mongoose.model(
  "DocumentSnapshot",
  documentSnapshotSchema
)
