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
  const [fill, setFill] = useState("#ffffff");
  const [draftLayer, setDraftLayer] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [activePencilId, setActivePencilId] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [activeArrowId, setActiveArrowId] = useState(null);
  const [draftArrow, setDraftArrow] = useState(null);

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
    if (layerData.type !== "pencil" && layerData.type !== "arrow") {
      setActiveTool("cursor");
    }

    return layerId;
  }, []);

  const updateLayerPosition = useMutation(({ storage }, layerId, newPos) => {
    const layers = storage.get("layers");
    const layer = layers.get(layerId);
    if (!layer) return;

    layer.update(newPos);

    const width = layer.get("width");
    const height = layer.get("height");

  }, []);

  const deleteLayer = useMutation(
    ({ storage }) => {
      if (selectedLayerId) {
        storage.get("layers").delete(selectedLayerId);
        setSelectedLayerId(null);
      }
    },
    [selectedLayerId],
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
    layer.set("startBinding", null);
    layer.set("endBinding", null);
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
      room.history.pause();
      setDraftArrow({
        start: point,
        end: point,
        color: fill,
      });
      setIsDragging(true);
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
        setDragOffset({ x: point.x, y: point.y }); // store last mouse pos
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
  const insertArrowWithBinding = useMutation(({ storage }, draftArrow) => {
    const layers = storage.get("layers");
    if (!layers) return null;

    const findBinding = (point) => {
      for (const [id, layer] of layers) {
        const type = layer.get("type");
        if (type !== "rectangle" && type !== "circle") continue;

        const x = layer.get("x");
        const y = layer.get("y");
        const w = layer.get("width");
        const h = layer.get("height");

        const cx = x + w / 2;
        const cy = y + h / 2;

        if (Math.hypot(point.x - cx, point.y - cy) < 30) {
          return {
            layerId: id,
            offset: {
              x: point.x - cx,
              y: point.y - cy,
            },
          };
        }
      }
      return null;
    };

    const startBinding = findBinding(draftArrow.start);
    const endBinding = findBinding(draftArrow.end);

    const id = crypto.randomUUID();
    layers.set(
      id,
      new LiveObject({
        type: "arrow",
        start: draftArrow.start,
        end: draftArrow.end,
        startBinding,
        endBinding,
        color: draftArrow.color,
        seed: Math.floor(Math.random() * 1_000_000),
      }),
    );

    return id;
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

    if (activeTool === "arrow" && isDragging && draftArrow) {
      setDraftArrow((prev) => ({
        ...prev,
        end: point,
      }));
      return;
    }

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

    if (activeTool === "arrow" && draftArrow) {
      const id = insertArrowWithBinding(draftArrow);

      setSelectedLayerId(id);
      setDraftArrow(null);
      setActiveTool("cursor");
      room.history.resume();
      return;
    }

    if (resizing) {
      setResizing(null);
      return;
    }

    // 1. Commit draft shape (rectangle / circle)
    if (draftLayer) {
      insertLayer(draftLayer);
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
        draftArrow={draftArrow}
      />
    </div>
  );
}
