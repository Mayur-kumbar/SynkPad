import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser, verifyEmail, resendVerificationEmail } from "../controller/auth.controller.js";

const router = Router();

router.post("/register", registerUser)
router.get("/verify-email", verifyEmail)
router.post("/resend-verification-email", resendVerificationEmail)
router.post("/login", loginUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/logout", logoutUser)

export default router;