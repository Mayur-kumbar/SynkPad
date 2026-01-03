import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  acceptWorspaceInvite,
  createWorkspace,
  deleteWorkspace,
  getMyWorkspaceInvites,
  getWorkspaces,
  inviteToWorkspace,
  getWorkspaceDetails,
  getDocumentsToWorkspace,
} from "../controller/workspace.controller.js";
import requireWorkspaceRole from "../middleware/requireWorkspaceRole.middleware.js";
import { createComment, createDocument, deleteDocument, getComments, getDocumentDetails, renameDocument } from "../controller/document.controller.js";

const router = Router();

router.post("/", authenticate, createWorkspace);
router.get("/", authenticate, getWorkspaces);
router.get("/invites", authenticate, getMyWorkspaceInvites);
router.post("/invites/accept/:inviteId", authenticate, acceptWorspaceInvite);

// Workspace specific routes
router.get("/:workspaceId", authenticate, requireWorkspaceRole("viewer"), getWorkspaceDetails);
router.get("/:workspaceId/documents", authenticate, requireWorkspaceRole("viewer"), getDocumentsToWorkspace);
router.delete("/:workspaceId", authenticate, requireWorkspaceRole("owner"), deleteWorkspace);
router.post("/:workspaceId/invite", authenticate, requireWorkspaceRole("owner"), inviteToWorkspace);

// Document specific routes
router.post("/:workspaceId/document", authenticate, requireWorkspaceRole("editor"), createDocument)
router.delete("/:workspaceId/document/:documentId", authenticate, requireWorkspaceRole("editor"), deleteDocument)
router.patch("/:workspaceId/document/:documentId", authenticate, requireWorkspaceRole("editor"), renameDocument)
router.get("/:workspaceId/document/:documentId", authenticate, requireWorkspaceRole("viewer"), getDocumentDetails)

// comment specific routes can be added here
router.post("/:workspaceId/document/:documentId/comment", authenticate, requireWorkspaceRole("viewer"), createComment)
router.get("/:workspaceId/document/:documentId/comments", authenticate, requireWorkspaceRole("viewer"), getComments)

export default router;