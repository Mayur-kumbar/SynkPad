"use client";

import { useSelf, useStorage } from "@liveblocks/react";
import { useState, useRef, useEffect } from "react";
import LayerComponent from "./LayerComponent";

export default function Canvas({
  role,
  activeTool,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onLayerPointerDown,
  onLayerDoubleClick,
  selectedLayerId,
  draftLayer,
  onResizeStart,
  onTextChange,
}) {
  // Infinite query for layers
  const layers = useStorage((root) => root.layers);

  // Camera state (Pan & Zoom)
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
  const svgRef = useRef(null);

  // Handle Wheel (Zoom & Pan)
  const onWheel = (e) => {
    // Zoom logic on Ctrl + Wheel / Pinch
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newZoom = Math.min(
        Math.max(camera.z - e.deltaY * zoomSensitivity, 0.1),
        5
      );

      setCamera((prev) => ({ ...prev, z: newZoom }));
      return;
    }

    // Pan logic
    setCamera((prev) => ({
      ...prev,
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }));
  };

  // Helper: Convert screen coordinates to canvas coordinates
  const getCanvasPoint = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - camera.x) / camera.z,
      y: (e.clientY - rect.top - camera.y) / camera.z,
    };
  };

  if (!layers) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0f1419] text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0f1419] relative overflow-hidden touch-none">
      <svg
        ref={svgRef}
        className="h-full w-full"
        onWheel={onWheel}
        onPointerDown={(e) => {
          const point = getCanvasPoint(e);
          onCanvasPointerDown(e, point);
        }}
        onPointerMove={(e) => {
          const point = getCanvasPoint(e);
          onCanvasPointerMove(e, point);
        }}
        onPointerUp={(e) => {
          const point = getCanvasPoint(e);
          onCanvasPointerUp(e, point);
        }}
        onPointerLeave={(e) => {
          const point = getCanvasPoint(e);
          onCanvasPointerUp(e, point);
        }}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
          }}
        >
          {/* Grid Background */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1f2937"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width="10000%"
            height="10000%"
            x="-5000%"
            y="-5000%"
            fill="url(#grid)"
          />

          {draftLayer && (
            <LayerComponent
              id="draft"
              layer={draftLayer}
              isSelected={false}
              onPointerDown={() => {}}
              onDoubleClick={() => {}}
              onResizeStart={() => {}}  
              onTextChange={() => {}}  
            />
          )}

          {Array.from(layers.entries()).map(([layerId, layer]) => (
            <LayerComponent
              key={layerId}
              id={layerId}
              layer={layer}
              isSelected={selectedLayerId === layerId}
              onPointerDown={(e, id) =>
                onLayerPointerDown(e, id, getCanvasPoint(e))
              }
              onDoubleClick={onLayerDoubleClick}
              onResizeStart={onResizeStart}
              onTextChange={onTextChange}
            />
          ))}
        </g>
      </svg>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none">
        {Math.round(camera.z * 100)}%
      </div>
    </div>
  );
}
