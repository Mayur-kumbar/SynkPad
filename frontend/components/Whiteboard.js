"use client";

import {
  useMutation,
  useStorage,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useRoom,
} from "@liveblocks/react";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { useState, useEffect } from "react";
import Toolbar from "./whiteboard/Toolbar";
import Canvas from "./whiteboard/Canvas";

export default function Whiteboard({ role }) {
  // State
  const layers = useStorage((root) => root.layers);
  const room = useRoom();
  const [activeTool, setActiveTool] = useState("cursor");
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastPoint, setLastPoint] = useState(null);
  const [fill, setFill] = useState("#3b82f6");
  const [draftLayer, setDraftLayer] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [activePencilId, setActivePencilId] = useState(null);
  const [resizing, setResizing] = useState(null);

  // Undo/Redo hooks
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Mutations
  const insertLayer = useMutation(({ storage }, layerData) => {
    const layerId = crypto.randomUUID();

    if (!storage.get("layers")) {
      storage.set("layers", new LiveMap());
    }

    // Add stable seed for roughjs shapes (rectangle, circle, arrow, etc.)
    if (
      layerData.type === "rectangle" ||
      layerData.type === "circle" ||
      layerData.type === "arrow"
    ) {
      layerData.seed = Math.floor(Math.random() * 1_000_000);
    }

    const layer = new LiveObject(layerData);
    storage.get("layers").set(layerId, layer);

    setSelectedLayerId(layerId);

    // Auto-switch tool except for pencil
    if (layerData.type !== "pencil") {
      setActiveTool("cursor");
    }

    return layerId;
  }, []);

  const updateLayerPosition = useMutation(({ storage }, layerId, newPos) => {
    const layer = storage.get("layers").get(layerId);
    if (layer) layer.update(newPos);
  }, []);

  const updatePencilStroke = useMutation(({ storage }, layerId, point) => {
    const layer = storage.get("layers").get(layerId);
    if (layer && layer.get("type") === "pencil") {
      const points = layer.get("points");
      // Only add point if it's far enough from the last point to avoid excessive data
      const last = points[points.length - 1];
      if (
        !last ||
        Math.abs(last[0] - point.x) > 2 ||
        Math.abs(last[1] - point.y) > 2
      ) {
        layer.set("points", [...points, [point.x, point.y]]);
      }
    }
  }, []);

  const deleteLayer = useMutation(
    ({ storage }) => {
      if (selectedLayerId) {
        storage.get("layers").delete(selectedLayerId);
        setSelectedLayerId(null);
      }
    },
    [selectedLayerId]
  );

  const bringToFront = useMutation(({ storage }, layerId) => {
    const layers = storage.get("layers");
    if (!layers || !layers.has(layerId)) return;

    const oldLayer = layers.get(layerId);
    const data = oldLayer.toObject(); // clone plain data

    layers.delete(layerId);
    layers.set(layerId, new LiveObject(data)); // attach fresh object
  }, []);

  // Keyboard listeners for deletion
  useEffect(() => {
    function onKeyDown(e) {
      if (role === "viewer") return;

      const el = document.activeElement;

      // If typing in text, don't delete layer
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        deleteLayer();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteLayer, role]);

  const updateArrow = useMutation(({ storage }, id, point) => {
    const layer = storage.get("layers").get(id);
    if (layer) {
      layer.set("end", point);
    }
  }, []);

  const moveArrow = useMutation(({ storage }, layerId, dx, dy) => {
    const layer = storage.get("layers").get(layerId);
    if (!layer || layer.get("type") !== "arrow") return;

    const start = layer.get("start");
    const end = layer.get("end");

    layer.set("start", {
      x: start.x + dx,
      y: start.y + dy,
    });
    layer.set("end", {
      x: end.x + dx,
      y: end.y + dy,
    });
  }, []);

  // Event Handlers
  const onCanvasPointerDown = (e, point) => {
    if (role === "viewer") return;

    // Pause history for continuous actions (drag/draw)
    if (activeTool !== "cursor") {
      room.history.pause();
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      setStartPoint(point);
      setDraftLayer({
        type: activeTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        fill,
      });
      setIsDragging(true);
      return;
    }

    if (activeTool === "text") {
      const id = insertLayer({
        type: "text",
        x: point.x,
        y: point.y,
        width: 100,
        height: 40,
        text: "",
        fill,
      });
      setSelectedLayerId(id);
      return;
    }

    if (activeTool === "arrow") {
      const id = insertLayer({
        type: "arrow",
        start: point,
        end: point,
        color: fill,
      });
      setIsDragging(true);
      setSelectedLayerId(id);
      setActivePencilId(id); // reuse as active arrow id
      return;
    }

    if (activeTool === "pencil") {
      setIsDragging(true);
      const id = insertLayer({
        type: "pencil",
        x: point.x,
        y: point.y,
        points: [[point.x, point.y]],
        fill,
      });
      setSelectedLayerId(id); // ENSURE IT’S SET
      setActivePencilId(id);
      return;
    }
    const el = document.activeElement;

    // If user is editing text, let blur save first
    if (el && el.isContentEditable) {
      setTimeout(() => {
        setSelectedLayerId(null);
      }, 0);
    } else {
      setSelectedLayerId(null);
    }
  };

  const onLayerPointerDown = (e, layerId, point) => {
    if (role === "viewer") return;

    room.history.pause();

    if (activeTool === "cursor") {
      e.stopPropagation();

      const layer = layers.get(layerId);
      if (layer?.type === "arrow") {
        setDragOffset({ x: point.x, y: point.y });
      } else if (layer) {
        setDragOffset({
          x: point.x - layer.x,
          y: point.y - layer.y,
        });
      }

      setSelectedLayerId(layerId);
      bringToFront(layerId);
      setIsDragging(true);
    }
  };

  const updateLayerText = useMutation(({ storage }, layerId, newText, w, h) => {
    const layer = storage.get("layers").get(layerId);
    if (!layer) return;
    layer.set("text", newText);
    if (w && h) {
      layer.set("width", w);
      layer.set("height", h);
    }
  }, []);

  const onLayerDoubleClick = (e, layerId) => {
    if (role === "viewer") return;
    if (!layers) return;

    const layer = layers.get(layerId);
    // Access property directly as it's a readonly JS object from useStorage
    if (layer && layer.type === "text") {
      e.stopPropagation();
      const newText = window.prompt("Edit Text:", layer.text);
      if (newText !== null) {
        updateLayerText(layerId, newText);
      }
    }
  };

  const onCanvasPointerMove = (e, point) => {
    if (role === "viewer") return;

    // Move arrow
    // Move arrow
    if (activeTool === "cursor" && isDragging && selectedLayerId) {
      const layer = layers.get(selectedLayerId);
      if (layer?.type === "arrow") {
        const dx = point.x - dragOffset.x;
        const dy = point.y - dragOffset.y;

        moveArrow(selectedLayerId, dx, dy);
        setDragOffset({ x: point.x, y: point.y });
        return;
      }
    }

    if (resizing && isDragging) {
      const layer = layers.get(resizing.layerId);
      if (!layer) return;

      let { x, y, width, height, type } = layer;
      const px = point.x;
      const py = point.y;

      const right = x + width;
      const bottom = y + height;

      let newX = x;
      let newY = y;
      let newW = width;
      let newH = height;

      switch (resizing.handle) {
        case "se":
          newW = px - x;
          newH = py - y;
          break;
        case "e":
          newW = px - x;
          break;
        case "s":
          newH = py - y;
          break;
        case "nw":
          newW = right - px;
          newH = bottom - py;
          newX = px;
          newY = py;
          break;
        case "n":
          newH = bottom - py;
          newY = py;
          break;
        case "ne":
          newW = px - x;
          newH = bottom - py;
          newY = py;
          break;
        case "sw":
          newW = right - px;
          newH = py - y;
          newX = px;
          break;
        case "w":
          newW = right - px;
          newX = px;
          break;
      }

      // If circle: force square
      if (type === "circle") {
        const size = Math.max(newW, newH);
        newW = size;
        newH = size;

        // Fix position when resizing from top/left
        if (resizing.handle.includes("w")) {
          newX = right - size;
        }
        if (resizing.handle.includes("n")) {
          newY = bottom - size;
        }
      }

      // Prevent too small
      newW = Math.max(10, newW);
      newH = Math.max(10, newH);

      updateLayerPosition(resizing.layerId, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      });

      return;
    }

    // 1. Handle draft shape drawing (rectangle/circle)
    if (draftLayer && isDragging) {
      const w = point.x - startPoint.x;
      const h = point.y - startPoint.y;

      setDraftLayer((prev) => ({
        ...prev,
        x: w < 0 ? point.x : startPoint.x,
        y: h < 0 ? point.y : startPoint.y,
        width: Math.abs(w),
        height: Math.abs(h),
      }));
      return;
    }

    // 2. Handle pencil drawing
    if (activeTool === "pencil" && isDragging && selectedLayerId) {
      updatePencilStroke(activePencilId, point);
      return;
    }

    if (activeTool === "arrow" && isDragging && activePencilId) {
      updateArrow(activePencilId, point);
      return;
    }

    // 3. Handle moving selected layer
    if (!isDragging || !selectedLayerId || activeTool !== "cursor") return;

    updateLayerPosition(selectedLayerId, {
      x: point.x - dragOffset.x,
      y: point.y - dragOffset.y,
    });
  };

  const onCanvasPointerUp = (e, point) => {
    setIsDragging(false);
    room.history.resume();

    if (!point || role === "viewer") return;

    if (resizing) {
      setResizing(null);
      setIsDragging(false);
      room.history.resume();
      return;
    }

    // 1. Commit draft shape (rectangle / circle)
    if (draftLayer) {
      insertLayer(draftLayer); // draftLayer already has x,y,width,height,fill,type
      setDraftLayer(null);
      setStartPoint(null);
      return;
    }

    // 2. Finish moving
    if (activeTool === "cursor" && selectedLayerId) {
      updateLayerPosition(selectedLayerId, {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      });
      return;
    }

    // 3. Finish pencil stroke
    if (activeTool === "pencil" && activePencilId) {
      updatePencilStroke(activePencilId, point);
      setActivePencilId(null);
    }

    if (activeTool === "arrow" && activePencilId) {
      updateArrow(activePencilId, point);
      setActivePencilId(null);
      return;
    }
  };

  const onResizeStart = (layerId, handle) => {
    room.history.pause();
    setResizing({ layerId, handle });
    setIsDragging(true);
  };

  return (
    <div className="h-full w-full bg-[#0f1419] relative">
      {role !== "viewer" && (
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onDelete={deleteLayer}
          fill={fill}
          setFill={setFill}
        />
      )}

      <Canvas
        role={role}
        activeTool={activeTool}
        onCanvasPointerDown={onCanvasPointerDown}
        onCanvasPointerMove={onCanvasPointerMove}
        onCanvasPointerUp={onCanvasPointerUp}
        onLayerPointerDown={onLayerPointerDown}
        onLayerDoubleClick={onLayerDoubleClick}
        selectedLayerId={selectedLayerId}
        draftLayer={draftLayer} // ADD THIS
        onResizeStart={onResizeStart}
        onTextChange={updateLayerText}
      />
    </div>
  );
}
