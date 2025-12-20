import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (decoded.isEmailVerified !== true) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email to access this resource.",
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      isEmailVerified: decoded.isEmailVerified,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Access token expired"
          : "Invalid access token",
    });
  }
};

export default authenticate;
