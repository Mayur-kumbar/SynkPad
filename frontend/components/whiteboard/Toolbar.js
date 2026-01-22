"use client";

import {
  Pointer,
  Square,
  Circle as CircleIcon,
  Type,
  Pencil,
  Undo,
  Redo,
  Trash2,
  ArrowUpRight,
} from "lucide-react";

export default function Toolbar({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDelete,
  fill,
  setFill,
}) {
  const tools = [
    { id: "cursor", icon: Pointer, label: "Select" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "text", icon: Type, label: "Text" },
    { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
  ];

  const colors = [
    "#ffffff", // White
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Yellow
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1f2937]/90 backdrop-blur-md border border-[#374151] rounded-lg shadow-xl p-1.5 flex gap-1 items-center z-10">
      <div className="flex gap-1 pr-2 border-r border-[#374151]">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-2 rounded hover:bg-[#374151] transition-colors ${
              activeTool === tool.id
                ? "bg-[#374151] text-white"
                : "text-gray-400"
            }`}
            title={tool.label}
          >
            <tool.icon size={20} />
          </button>
        ))}
      </div>

      <div className="flex gap-1 px-2 border-r border-[#374151]">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setFill(c)}
            className={`w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-110 ${
              fill === c
                ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1f2937]"
                : ""
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      <div className="flex gap-1 pl-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-[#374151] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-[#374151] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded hover:bg-[#374151] hover:text-red-400 text-gray-400 transition-colors"
          title="Delete Selected"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
