import WorkspaceMember from "../models/workspaceMembers.model.js"

const ROLE_PRIORITY = {
  viewer: 1,
  editor: 2,
  owner: 3,
}

const requireWorkspaceRole = (minimumRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id
      const workspaceId =
        req.params.workspaceId || req.body.workspaceId

      if (!workspaceId) {
        return res.status(400).json({
          message: "Workspace ID is required for authorization",
        })
      }

      const membership = await WorkspaceMember.findOne({
        workspaceId,
        userId,
      })

      if (!membership) {
        return res.status(403).json({
          message: "You do not have access to this workspace",
        })
      }

      const userRole = membership.role

      if (
        ROLE_PRIORITY[userRole] <
        ROLE_PRIORITY[minimumRole]
      ) {
        return res.status(403).json({
          message: "Insufficient permissions",
        })
      }

      req.workspaceRole = userRole
      req.workspaceMembership = membership

      next()
    } catch (error) {
      console.error("Permission middleware error:", error)
      return res.status(500).json({
        message: "Authorization failed",
      })
    }
  }
}

export default requireWorkspaceRole
