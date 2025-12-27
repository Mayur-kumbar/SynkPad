import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { acceptWorspaceInvite, createWorkspace, deleteWorkspace, getMyWorkspaceInvites, getWorkspaces, inviteToWorkspace } from "../controller/workspace.controller.js";
import requireWorkspaceRole from "../middleware/requireWorkspaceRole.middleware.js";

const router = Router()

router.post("/", authenticate, createWorkspace)
router.get("/", authenticate, getWorkspaces)
router.delete("/:workspaceId", authenticate, requireWorkspaceRole("owner"), deleteWorkspace)
router.post("/:workspaceId/invite", authenticate, requireWorkspaceRole("owner"), inviteToWorkspace)
router.get("/invites", authenticate, getMyWorkspaceInvites)
router.post("/invites/accept/:inviteId", authenticate, acceptWorspaceInvite)

export default router