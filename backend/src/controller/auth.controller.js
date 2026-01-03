import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import EmailToken from "../models/emailToken.model.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* -------------------- CONSTANTS -------------------- */

// IMPORTANT: jwt expects seconds, cookies expect ms
const ACCESS_TOKEN_TTL_SEC = 15 * 60; // 15 min
const ACCESS_TOKEN_MAX_AGE = ACCESS_TOKEN_TTL_SEC * 1000;

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/* -------------------- HELPERS -------------------- */

const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SEC } // ✅ FIXED
  );

const generateRefreshToken = () =>
  crypto.randomBytes(32).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

/* -------------------- ISSUE TOKENS -------------------- */

const issueTokens = async (res, user, message = "Authenticated") => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  return res.json({
    message,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

/* -------------------- REGISTER -------------------- */

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "User already exists." });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "local",
    });

    const token = crypto.randomBytes(32).toString("hex");

    await EmailToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "Registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/* -------------------- LOGIN (LOCAL) -------------------- */

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "Invalid credentials." });

    if (!user.isEmailVerified)
      return res.status(403).json({ message: "Email not verified." });

    if (!(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid credentials." });

    // single-session login
    await RefreshToken.deleteMany({ userId: user._id });

    user.lastLoginAt = new Date();
    await user.save();

    await issueTokens(res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/* -------------------- GOOGLE LOGIN -------------------- */

const googleOAuthCallback = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken)
    return res.status(400).json({ message: "ID token required." });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || payload.aud !== process.env.GOOGLE_CLIENT_ID)
      return res.status(401).json({ message: "Invalid Google token." });

    const { sub: googleId, email, email_verified, name } = payload;

    if (!email_verified)
      return res.status(403).json({ message: "Google email not verified." });

    let user = await User.findOne({ email });

    const existingGoogleUser = await User.findOne({ googleId });
    if (
      existingGoogleUser &&
      (!user || !existingGoogleUser._id.equals(user._id))
    ) {
      return res.status(409).json({
        message: "Google account already linked to another user.",
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
    }

    await RefreshToken.deleteMany({ userId: user._id });

    user.lastLoginAt = new Date();
    await user.save();

    await issueTokens(res, user, "Login successful via Google");
  } catch (err) {
    console.error(err);
    clearAuthCookies(res);
    res.status(401).json({ message: "Invalid Google ID token." });
  }
};

/* -------------------- REFRESH TOKEN -------------------- */

const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Refresh token missing." });
  }

  try {
    const tokenHash = hashToken(token);

    const stored = await RefreshToken.findOneAndUpdate(
      {
        tokenHash,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
      }
    );

    if (!stored) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const user = await User.findById(stored.userId);
    if (!user || !user.isEmailVerified) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Unauthorized." });
    }

    await issueTokens(res, user, "Token refreshed");
  } catch (err) {
    console.error(err);
    clearAuthCookies(res);
    res.status(500).json({ message: "Server error." });
  }
};

/* -------------------- LOGOUT -------------------- */

const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(token) },
      { isRevoked: true }
    );
  }

  clearAuthCookies(res);
  res.json({ message: "Logged out successfully." });
};

/* -------------------- CURRENT USER -------------------- */

const getCurrentUser = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: "Not authenticated." });

  res.json({ user: req.user });
};

/* -------------------- EMAIL VERIFY -------------------- */

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token)
    return res.status(400).json({ message: "Token missing." });

  const record = await EmailToken.findOne({ token });
  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ message: "Token invalid or expired." });

  await User.findByIdAndUpdate(record.userId, { isEmailVerified: true });
  await EmailToken.deleteOne({ _id: record._id });

  res.json({ message: "Email verified successfully." });
};

/* -------------------- RESEND EMAIL -------------------- */

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const genericMessage =
    "If an account with that email exists, a verification email has been sent.";

  if (!email)
    return res.status(200).json({ message: genericMessage });

  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified)
    return res.status(200).json({ message: genericMessage });

  await EmailToken.deleteMany({ userId: user._id });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await EmailToken.create({
    userId: user._id,
    token: verifyToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(email, verifyToken);

  res.status(200).json({ message: genericMessage });
};

const getWSAuthToken = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  res.json({ token });
};

/* -------------------- EXPORTS -------------------- */

export {
  registerUser,
  loginUser,
  googleOAuthCallback,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  getCurrentUser,
  resendVerificationEmail,
  getWSAuthToken,
};
