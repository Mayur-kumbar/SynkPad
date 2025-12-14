import mongoose from "mongoose"

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  userAgent: String,
  ipAddress: String,
  isRevoked: { type: Boolean, default: false },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: Date,
}, { timestamps: true })

refreshTokenSchema.index({ userId: 1 })
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true })
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("RefreshToken", refreshTokenSchema)
