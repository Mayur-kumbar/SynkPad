import http from "http";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import * as Y from "yjs";
import mongoose from "mongoose";
import debounce from "lodash/debounce.js";
import dotenv from "dotenv";
import workspaceMembersModel from "../../backend/src/models/workspaceMembers.model.js";
import documentSnapshotModel from "../../backend/src/models/documentSnapshot.model.js";

dotenv.config();

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/synkpad")
  .then(() => console.log("Connected to MongoDB for Real-time Service"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const server = http.createServer();
const wss = new WebSocketServer({ server });

const docs = new Map();

// Persistence Logic
async function loadDocumentFromDB(documentId, ydoc) {
  try {
    const snapshot = await documentSnapshotModel.findOne({ documentId }).sort({ createdAt: -1 });
    if (snapshot && snapshot.updateBinary) {
      Y.applyUpdate(ydoc, snapshot.updateBinary);
      console.log(`Loaded document ${documentId} from DB`);
    }
  } catch (err) {
    console.error(`Error loading document ${documentId}:`, err);
  }
}

const saveToDB = debounce(async (documentId, update) => {
  try {
    // In a real production app, you might want to merge updates or save less frequently.
    // For now, we save the entire state as a snapshot.
    const ydoc = docs.get(documentId);
    if (!ydoc) return;

    const stateAsUpdate = Y.encodeStateAsUpdate(ydoc);
    
    await documentSnapshotModel.findOneAndUpdate(
      { documentId },
      { 
        updateBinary: Buffer.from(stateAsUpdate),
        sizeBytes: stateAsUpdate.byteLength
      },
      { upsert: true, new: true }
    );
    console.log(`Saved snapshot for document ${documentId}`);
  } catch (err) {
    console.error(`Error saving document ${documentId}:`, err);
  }
}, 2000);

async function getYDoc(docId) {
  if (!docs.has(docId)) {
    const ydoc = new Y.Doc();
    
    // Load initial state
    await loadDocumentFromDB(docId, ydoc);

    ydoc.on("update", (update) => {
      saveToDB(docId, update);
    });

    // Cleanup when empty (optional - for now keep in memory while server is up)
    ydoc.on("destroy", () => {
      docs.delete(docId);
    });

    docs.set(docId, ydoc);
  }
  return docs.get(docId);
}

wss.on("connection", async (ws, req) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");
    const documentId = url.searchParams.get("docId");

    if (!token || !documentId) {
      ws.close(1008, "Missing auth params");
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    const userId = decoded.sub;

    const permission = await workspaceMembersModel.findOne({
      workspaceId: decoded.workspaceId,
      userId,
    });

    if (!permission) {
      ws.close(1008, "No document access");
      return;
    }

    const ydoc = await getYDoc(documentId);

    // Send initial state to client
    const stateUpdate = Y.encodeStateAsUpdate(ydoc);
    ws.send(stateUpdate);

    ws.on("message", (message) => {
      // Basic check for valid Uint8Array
      if (!(message instanceof Buffer) && !(message instanceof Uint8Array)) {
        return;
      }

      if (permission.role === "viewer") {
        return; // Silently ignore or send error
      }

      const update = new Uint8Array(message);
      
      try {
        Y.applyUpdate(ydoc, update);

        // Broadcast to other clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1 /* OPEN */) {
            client.send(update);
          }
        });
      } catch (e) {
        console.error("Failed to apply update:", e);
      }
    });

    ws.on("close", () => {
        // Handle client disconnection if needed
    });

  } catch (err) {
    console.error("WS error:", err);
    ws.close(1011, "Server error");
  }
});

server.listen(5001, () => {
  console.log("🔐 Custom Yjs WebSocket server running on ws://localhost:5001");
});
