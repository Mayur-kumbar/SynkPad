import http from "http";
import {WebSocketServer} from "ws";
import jwt from "jsonwebtoken";
import * as Y from "yjs";

import documentPermissionModel from "../../backend/src/models/documentPermission.model.js";

const server = http.createServer();
const wss = new WebSocketServer({ server });

const docs = new Map();


function getYDoc(docId) {
  if (!docs.has(docId)) {
    const ydoc = new Y.Doc();

    // Cleanup when empty
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

    const permission = await documentPermissionModel.findOne({
      documentId,
      userId,
    });

    if (!permission) {
      ws.close(1008, "No document access");
      return;
    }

    const ydoc = getYDoc(documentId);

    const stateUpdate = Y.encodeStateAsUpdate(ydoc);
    ws.send(stateUpdate);

    ws.on("message", (message) => {
      if (permission.role === "viewer") {
        ws.close(1008, "Read-only access");
        return;
      }

      const update = new Uint8Array(message);
      Y.applyUpdate(ydoc, update);

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(update);
        }
      });
    });
  } catch (err) {
    console.error("WS error:", err);
    ws.close(1011, "Server error");
  }
});

server.listen(5001, () => {
  console.log("🔐 Custom Yjs WebSocket server running on ws://localhost:5001");
});
