import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  googleId: {
    type: String,
    default: null
  },
  
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  lastLoginAt: Date,
}, { timestamps: true })

userSchema.index({ email: 1 }, { unique: true })

export default mongoose.model("User", userSchema)
