import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import EmailToken from "../models/emailToken.model.js"
import sendVerificationEmail from "../utils/sendVerificationEmail.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      isEmailVerified: false,
      authProvider: "local",
    });

    // 👉 Generate email verification token (example)
    const verifyToken = crypto.randomBytes(32).toString("hex");

    new EmailToken({
      userId: newUser._id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
    }).save();

    sendVerificationEmail(email, verifyToken)

    return res.status(201).json({
      message: "Registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing." });
  }

  try {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified.",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken) },
      { isRevoked: true }
    );
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully." });
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token missing." });
    }

    const emailToken = await EmailToken.findOne({ token });

    if (!emailToken) {
      return res.status(400).json({ message: "Token invalid or expired." });
    }

    if (emailToken.expiresAt < new Date()) {
      await EmailToken.deleteOne({ _id: emailToken._id });
      return res.status(400).json({ message: "Token expired." });
    }

    const user = await User.findById(emailToken.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.isEmailVerified = true;
    await user.save();

    await EmailToken.deleteOne({ _id: emailToken._id });

    return res.json({
      message: "Email verified successfully. You can now log in."
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const resendVerificationEmail = async (req, res) => {

  try{
    const { email} = req.body

    let genericResponseMessage = "If an account with that email exists, a verification email has been sent."

    if(!email){
      return res.status(400).json({message: genericResponseMessage})
    }
    const user = await User.findOne({email})
    if(!user){
      return res.status(200).json({message: genericResponseMessage})
    } 
    if(user.isEmailVerified){
      return res.status(200).json({message: genericResponseMessage})
    }
    await EmailToken.deleteMany({userId: user._id})

    const verifyToken = crypto.randomBytes(32).toString("hex"); 
    await new EmailToken({
      userId: user._id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + 24*60*60*1000)
    }).save();
    await sendVerificationEmail(email, verifyToken)

    return res.status(200).json({message: genericResponseMessage})
  } catch (error){
    console.error("Resend verification email error:", error)
    return res.status(500).json({message: "Server error."})
  }
  

}


export { registerUser, loginUser, refreshAccessToken, logoutUser, verifyEmail, resendVerificationEmail };
