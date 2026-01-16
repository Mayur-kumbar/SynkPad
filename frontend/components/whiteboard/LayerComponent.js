"use client";

import { getStroke } from "perfect-freehand";
import rough from "roughjs/bundled/rough.esm";

// Helper to convert stroke points to SVG path
function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

function getHandleX(h, l) {
  if (h.includes("w")) return -4;
  if (h.includes("e")) return l.width - 4;
  return l.width / 2 - 4;
}
function getHandleY(h, l) {
  if (h.includes("n")) return -4;
  if (h.includes("s")) return l.height - 4;
  return l.height / 2 - 4;
}

export default function LayerComponent({
  id,
  layer,
  isSelected,
  onPointerDown,
  onDoubleClick,
  onResizeStart,
  onTextChange,
}) {
  let generator = null;
  if (typeof window !== "undefined") {
    generator = rough.generator();
  }

  if (!layer) return null;

  const style = {
    // Only translate for non-path layers (paths have absolute coordinates)
    transform:
      layer.type === "pencil"
        ? undefined
        : `translate(${layer.x}px, ${layer.y}px)`,
    fill: layer.fill,
    stroke: isSelected ? "#60a5fa" : "transparent",
    strokeWidth: isSelected ? 2 : 0,
    cursor: "move",
  };

  switch (layer.type) {
    case "rectangle":
      return (
        <g transform={`translate(${layer.x}, ${layer.y})`}>
          {/* Main shape */}
          <g
            onPointerDown={(e) => onPointerDown(e, id)}
            onDoubleClick={(e) => onDoubleClick(e, id)}
            className="cursor-move"
          >
            {generator &&
              (() => {
                const drawable = generator.rectangle(
                  0,
                  0,
                  layer.width,
                  layer.height,
                  {
                    stroke: layer.fill || "#000",
                    strokeWidth: 2,
                    fill: "transparent",
                    roughness: 1.2,
                    bowing: 0.8,
                    fillStyle: "hachure",
                    hachureGap: 8,
                    hachureAngle: 60,
                    seed: layer.seed,
                  }
                );

                return generator
                  .toPaths(drawable)
                  .map((p, i) => (
                    <path
                      key={i}
                      d={p.d}
                      fill="none"
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                    />
                  ));
              })()}
          </g>

          {/* Resize handles */}
          {isSelected && (
            <g>
              {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((h) => (
                <rect
                  key={h}
                  width={8}
                  height={8}
                  x={getHandleX(h, layer)}
                  y={getHandleY(h, layer)}
                  fill="#60a5fa"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(id, h);
                  }}
                />
              ))}
            </g>
          )}
        </g>
      );

    case "circle":
      return (
        <g transform={`translate(${layer.x}, ${layer.y})`}>
          {/* Main rough circle */}
          <g
            onPointerDown={(e) => onPointerDown(e, id)}
            onDoubleClick={(e) => onDoubleClick(e, id)}
            className="cursor-move"
          >
            {generator &&
              (() => {
                const drawable = generator.circle(
                  layer.width / 2,
                  layer.height / 2,
                  layer.width,
                  {
                    stroke: layer.fill || "#000",
                    strokeWidth: 2,
                    fill: "transparent",
                    roughness: 1.2,
                    bowing: 0.8,
                    seed: layer.seed,
                  }
                );
                return generator
                  .toPaths(drawable)
                  .map((p, i) => (
                    <path
                      key={i}
                      d={p.d}
                      fill="none"
                      stroke={p.stroke}
                      strokeWidth={p.strokeWidth}
                    />
                  ));
              })()}
          </g>

          {/* Resize handles */}
          {isSelected && (
            <g>
              {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((h) => (
                <rect
                  key={h}
                  width={8}
                  height={8}
                  x={getHandleX(h, layer)}
                  y={getHandleY(h, layer)}
                  fill="#60a5fa"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(id, h);
                  }}
                />
              ))}
            </g>
          )}
        </g>
      );

    case "pencil":
      const stroke = getStroke(layer.points, {
        size: 6,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      const pathData = getSvgPathFromStroke(stroke);

      return (
        <path
          d={pathData}
          fill={layer.fill || "#3b82f6"}
          onPointerDown={(e) => onPointerDown(e, id)}
          onDoubleClick={(e) => onDoubleClick(e, id)}
          stroke={isSelected ? "#60a5fa" : "transparent"}
          strokeWidth={isSelected ? 2 : 0}
        />
      );

    case "text":
      return (
        <g transform={`translate(${layer.x}, ${layer.y})`}>
          {/* Click to select / move */}
          <g
            onPointerDown={(e) => onPointerDown(e, id)}
            className="cursor-move"
          >
            <foreignObject width={layer.width} height={layer.height}>
              <div
                contentEditable={isSelected}
                suppressContentEditableWarning
                data-placeholder="Type here"
                ref={(el) => {
                  if (!el) return;
                  const isFocused = document.activeElement === el;

                  if (!isFocused) {
                    el.innerText = layer.text || "";
                  }
                }}
                style={{
                  fontSize: "24px",
                  outline: isSelected ? "2px solid #60a5fa" : "none",
                  padding: "4px",
                  minWidth: "40px",
                  minHeight: "30px",
                  cursor: isSelected ? "text" : "move",
                  whiteSpace: "pre-wrap",
                  color: layer.text ? layer.fill || "#fff" : "#888",
                }}
                onPointerDown={(e) => {
                  if (isSelected) e.stopPropagation();
                }}
                onBlur={(e) => {
                  const el = e.currentTarget;
                  let newText = el.innerText.trim();
                  if (newText === "Type here") newText = "";

                  onTextChange(
                    id,
                    newText,
                    Math.max(40, el.scrollWidth + 10),
                    Math.max(30, el.scrollHeight + 10)
                  );
                }}
              >
                {layer.text || ""}
              </div>
            </foreignObject>
          </g>

          {/* Resize handles */}
          {isSelected && (
            <g>
              {["se", "e", "s", "nw", "n", "ne", "sw", "w"].map((h) => (
                <rect
                  key={h}
                  width={8}
                  height={8}
                  x={getHandleX(h, layer)}
                  y={getHandleY(h, layer)}
                  fill="#60a5fa"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(id, h);
                  }}
                />
              ))}
            </g>
          )}
        </g>
      );

    case "arrow": {
      const { start, end, color } = layer;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);

      const headLen = 12;
      const hx1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
      const hy1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
      const hx2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
      const hy2 = end.y - headLen * Math.sin(angle + Math.PI / 6);

      return (
        <g  onPointerDown={(e) => onPointerDown(e, id)}>
          {/* Rough main line */}
          {generator &&
            (() => {
              const drawable = generator.line(start.x, start.y, end.x, end.y, {
                stroke: color || "#000",
                strokeWidth: 2,
                roughness: 1.2,
                bowing: 0.8,
                seed: layer.seed,
              });
              return generator
                .toPaths(drawable)
                .map((p, i) => (
                  <path
                    key={i}
                    d={p.d}
                    fill="none"
                    stroke={p.stroke}
                    strokeWidth={p.strokeWidth}
                  />
                ));
            })()}

          {/* Arrow head */}
          <polygon
            points={`${end.x},${end.y} ${hx1},${hy1} ${hx2},${hy2}`}
            fill={color || "#000"}
          />
        </g>
      );
    }

    default:
      console.warn("Unknown layer type:", layer.type);
      return null;
  }
}
