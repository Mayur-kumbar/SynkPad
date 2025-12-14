import mongoose from "mongoose"

const documentPermissionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
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
  },
  { timestamps: true }
)

/* Indexes */
documentPermissionSchema.index(
  { documentId: 1, userId: 1 },
  { unique: true }
)
documentPermissionSchema.index({ userId: 1 })

export default mongoose.model(
  "DocumentPermission",
  documentPermissionSchema
)
