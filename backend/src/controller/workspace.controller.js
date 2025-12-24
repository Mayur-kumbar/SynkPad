import mongoose from "mongoose";
import workspaceModel from "../models/workspace.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import workspaceMembersModel from "../models/workspaceMembers.model.js";
import documentModel from "../models/document.model.js";
import documentSnapshotModel from "../models/documentSnapshot.model.js";
import UserModel from "../models/user.model.js";
import workspaceInviteModel from "../models/workspaceInvite.model.js";

const createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Workspace name is required" });
  }

  try {
    const workspace = await WorkspaceModel.create({
      name,
      description,
      ownerId: userId,
    });

    await workspaceMembersModel.create({
      workspaceId: workspace._id,
      userId,
      role: "owner",
    });

    return res
      .status(201)
      .json({ message: "Workspace created successfully", workspace });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getWorkspaces = async (req, res) => {
  const userId = req.user.id;

  try {
    const memberships = await workspaceMembersModel
      .find({ userId })
      .populate("workspaceId");

    const workspaces = memberships.map((m) => m.workspaceId).filter(Boolean);

    return res.status(200).json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  console.log("Deleting workspace:", workspaceId);

  if (!workspaceId) {
    return res.status(400).json({
      message: "Workspace ID is required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Ensure workspace exists
    const workspace = await workspaceModel
      .findById(workspaceId)
      .session(session);

    if (!workspace) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // 2️⃣ Fetch all documents (needed for snapshot cleanup)
    const documents = await documentModel
      .find({
        workspaceId,
      })
      .session(session);

    const documentIds = documents.map((doc) => doc._id);

    // 3️⃣ Delete document snapshots
    if (documentIds.length > 0) {
      await documentSnapshotModel
        .deleteMany({
          documentId: { $in: documentIds },
        })
        .session(session);
    }

    // 4️⃣ Delete documents
    await documentModel
      .deleteMany({
        workspaceId,
      })
      .session(session);

    // 5️⃣ Delete workspace members (permissions)
    await workspaceMembersModel
      .deleteMany({
        workspaceId,
      })
      .session(session);

    // 6️⃣ Delete workspace itself
    await workspaceModel
      .deleteOne({
        _id: workspaceId,
      })
      .session(session);

    // 7️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error deleting workspace:", error);
    return res.status(500).json({
      message: "Failed to delete workspace",
    });
  }
};

const inviteToWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const { email, role } = req.body;
  const invitedBy = req.user.id;

  if (!email || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Email and role are required" });
  }

  if (!["editor", "viewer"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role.",
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with the provided email does not exist.",
      });
    }

    const existingMember = await workspaceMembersModel.findOne({
      workspaceId,
      userId: existingUser._id,
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the workspace.",
      });
    }

    const existingInvite = await workspaceInviteModel.findOne({
      workspaceId,
      userId: existingUser._id,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "User already has a pending invite.",
      });
    }

    const invite = await workspaceInviteModel.create({
      workspaceId,
      userId: existingUser._id, 
      role,
      invitedBy,
    });

    return res.status(200).json({
      success: true,
      message: "Workspace invite created successfully.",
      inviteId: invite._id,
    });
  } catch (error) {
    console.error("Error inviting to workspace:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createWorkspace, getWorkspaces, deleteWorkspace, inviteToWorkspace };
