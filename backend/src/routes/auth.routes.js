import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser, verifyEmail, resendVerificationEmail, getCurrentUser, googleOAuthCallback } from "../controller/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser)
router.post("/register", registerUser)
router.get("/verify-email", verifyEmail)
router.post("/resend-verification-email", resendVerificationEmail)
router.post("/login", loginUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/logout", logoutUser)
router.post("/google", googleOAuthCallback)

export default router;