import commentModel from "../models/comment.model.js"
import documentModel from "../models/document.model.js"

const createDocument = async (req, res) => {
    const { workspaceId } = req.params 
    const userId = req.user.id 

    const { title, docType } = req.body 
    if(!title || !docType) {
        return res.status(400).json({
            success: false,
            message: "Title and document type are required"
        })
    }

    try {
        const newDocument = await documentModel.create({
            workspaceId,
            title,
            docType,
            createdBy: userId,
            lastEditedAt: new Date()
        })

        return res.status(201).json({
            success: true,
            message: "Document created successfully",
            document: newDocument
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating document"
        })
    }
}

const deleteDocument = async (req, res) => {
    const { workspaceId, documentId } = req.params

    try {
        console.log("Deleting document:", documentId)
        const document = await documentModel.findOne({ _id: documentId, workspaceId, isDeleted: false })
        if(!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            })
        }

        document.isDeleted = true
        await document.save()
        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting document"
        })
    }
}

const renameDocument = async (req, res) => {
    const { workspaceId, documentId } = req.params
    const { newTitle } = req.body

    if(!newTitle) {
        return res.status(400).json({
            success: false,
            message: "New title is required"
        })
    }

    try {
        const document = await documentModel.findOne({ _id: documentId, workspaceId, isDeleted: false })    
        
        if(!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            })
        }

        document.title = newTitle
        await document.save()   

        return res.status(200).json({
            success: true,
            message: "Document renamed successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error renaming document"
        })
    }
}

const getDocumentDetails = async (req, res) => {
    const { workspaceId, documentId } = req.params

    try {
        const document = await documentModel.findOne({ _id: documentId, workspaceId, isDeleted: false })
        if(!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            })
        }

        return res.status(200).json({
            success: true,
            document
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching document details"
        })
    }
}


const createComment = async (req, res) => {
    const { workspaceId, documentId } = req.params 
    const userId = req.user.id

    try {
        const { text } = req.body
        if(!text) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            })
        }

        await commentModel.create({
            text,
            author: userId,
            documentId,
            workspaceId
        })

        return res.status(201).json({
            success: true,
            message: "Comment added successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error adding comment"
        })
    }
}

const getComments = async (req, res) => {
    const { workspaceId, documentId } = req.params
    try {
        const comments = await commentModel.find({ workspaceId, documentId }).populate("author", "name email")
        return res.status(200).json({
            success: true,
            comments
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching comments"
        })
    }
}

export {
    createDocument,
    deleteDocument,
    renameDocument,
    getDocumentDetails,
    createComment,
    getComments
}