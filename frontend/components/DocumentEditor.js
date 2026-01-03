"use client";

import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import "../app/globals.css";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Highlighter, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered
} from "lucide-react";


const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = "px-2.5 py-1.5 rounded hover:bg-[#374151] transition-colors flex items-center justify-center min-w-[36px] text-[#9ca3af]";
  const activeClass = "bg-[#374151] text-white";

  return (
    <div className="bg-[#1f2937] border-b border-[#374151] px-4 py-2">
      <div className="flex items-center gap-1">
        {/* Text Style Group */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`${buttonClass} ${
              editor.isActive("heading", { level: 1 }) ? activeClass : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`${buttonClass} ${
              editor.isActive("heading", { level: 2 }) ? activeClass : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`${buttonClass} ${
              editor.isActive("heading", { level: 3 }) ? activeClass : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${buttonClass} ${
              editor.isActive("paragraph") ? activeClass : ""
            }`}
            title="Paragraph"
          >
            <Pilcrow className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-[#374151] mx-2"></div>

        {/* Formatting Group */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${buttonClass} ${
              editor.isActive("bold") ? activeClass : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${buttonClass} ${
              editor.isActive("italic") ? activeClass : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${buttonClass} ${
              editor.isActive("strike") ? activeClass : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`${buttonClass} ${
              editor.isActive("highlight") ? activeClass : ""
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-[#374151] mx-2"></div>

        {/* Alignment Group */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`${buttonClass} ${
              editor.isActive({ textAlign: "left" }) ? activeClass : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`${buttonClass} ${
              editor.isActive({ textAlign: "center" }) ? activeClass : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`${buttonClass} ${
              editor.isActive({ textAlign: "right" }) ? activeClass : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`${buttonClass} ${
              editor.isActive({ textAlign: "justify" }) ? activeClass : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
            <button
    onClick={() => editor.chain().focus().toggleBulletList().run()}
    className={`${buttonClass} ${
      editor.isActive("bulletList") ? activeClass : ""
    }`}
    title="Bullet List"
  >
    <List className="w-4 h-4" />
  </button>

  <button
    onClick={() => editor.chain().focus().toggleOrderedList().run()}
    className={`${buttonClass} ${
      editor.isActive("orderedList") ? activeClass : ""
    }`}
    title="Numbered List"
  >
    <ListOrdered className="w-4 h-4" />
  </button>

        </div>
      </div>
    </div>
  );
};

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      BulletList,
      ListItem,
      OrderedList
    ],
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px]",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
  <div className="flex flex-col h-full w-full bg-[#0f1419]">
    {/* Menu Bar */}
    <div className="sticky top-0 z-10 border-b border-[#2d3748] bg-[#0f1419]">
      <MenuBar editor={editor} />
    </div>

    {/* Editor Area */}
    <div className="flex-1 overflow-y-auto p-4">
      <EditorContent editor={editor} className="prose prose-invert max-w-none" />
    </div>
  </div>
);
}
