import DocumentPermission from "../models/documentPermission.model.js";

const ROLE_PRIORITY = {
  owner: 3,
  editor: 2,
  viewer: 1,
};


const authorizeDocument = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const documentId = req.params.id || req.params.documentId;

      if (!documentId) {
        return res.status(400).json({
          message: "Document ID missing in request",
        });
      }

      const permission = await DocumentPermission.findOne({
        documentId,
        userId,
      });

      if (!permission) {
        return res.status(403).json({
          message: "You do not have access to this document",
        });
      }

      const userRole = permission.role;

      if (
        ROLE_PRIORITY[userRole] < ROLE_PRIORITY[requiredRole]
      ) {
        return res.status(403).json({
          message: "Insufficient permissions",
        });
      }

      req.documentPermission = permission;

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        message: "Authorization check failed",
      });
    }
  };
};

export default authorizeDocument;
