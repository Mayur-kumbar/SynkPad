import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { createWorkspace, getWorkspaces } from "../controller/workspace.controller.js";


const router = Router()

router.post("/", authenticate, createWorkspace)
router.get("/", authenticate, getWorkspaces)

export default router