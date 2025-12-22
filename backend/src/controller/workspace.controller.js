import WorkspaceModel from "../models/workspace.model.js"


const createWorkspace = async (req, res) => {
    const { name, description } = req.body 
    
    const ownerId = req.user.id

    if(!name) {
        return res.status(400).json({ message: "Workspace name is required" })
    }

    try {
       
        const newWokspace = new WorkspaceModel({
            name,
            description,
            ownerId
        })

        await newWokspace.save()
        return res.status(201).json({ message: "Workspace created successfully", workspace: newWokspace })
    } catch (error) {
        console.error("Error creating workspace:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getWorkspaces = async (req, res) => {
    const ownerId = req.user.id 

    try {
        const workspaces = await WorkspaceModel.find({ ownerId })
        return res.status(200).json({ workspaces })
    } catch (error) {
        console.error("Error fetching workspaces:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export {
    createWorkspace,
    getWorkspaces
}