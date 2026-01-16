import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Minus,
} from "lucide-react";

export default function MenuBar({ editor }) {
  if (!editor) return null;
  
  const btn = "p-2 rounded-md hover:bg-gray-700/50 text-gray-400 transition-all duration-150 hover:text-gray-200 hover:scale-105 active:scale-95";
  const active = "bg-gray-700 text-white shadow-sm";
  const B = (isActive) => `${btn} ${isActive ? active : ""}`;
  
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-gray-700/50 p-3 bg-gradient-to-b from-[#0f1419] to-[#0a0e13]">
      {/* Headings */}
      <div className="flex gap-1 items-center">
        <button className={B(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph"><Pilcrow size={17} strokeWidth={2} /></button>
      </div>
      
      <div className="w-px h-6 bg-gray-700/50 self-center" />
      
      {/* Text Formatting */}
      <div className="flex gap-1 items-center">
        <button className={B(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><Underline size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("highlight"))} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight"><Highlighter size={17} strokeWidth={2} /></button>
      </div>
      
      <div className="w-px h-6 bg-gray-700/50 self-center" />
      
      {/* Lists */}
      <div className="flex gap-1 items-center">
        <button className={B(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={17} strokeWidth={2} /></button>
      </div>
      
      <div className="w-px h-6 bg-gray-700/50 self-center" />
      
      {/* Blocks */}
      <div className="flex gap-1 items-center">
        <button className={B(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={17} strokeWidth={2} /></button>
        <button className={btn} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={17} strokeWidth={2} /></button>
      </div>
      
      <div className="w-px h-6 bg-gray-700/50 self-center" />
      
      {/* Alignment */}
      <div className="flex gap-1 items-center">
        <button className={B(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left"><AlignLeft size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center"><AlignCenter size={17} strokeWidth={2} /></button>
        <button className={B(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right"><AlignRight size={17} strokeWidth={2} /></button>
      </div>
      
      <div className="w-px h-6 bg-gray-700/50 self-center" />
      
      {/* Actions */}
      <div className="flex gap-1 items-center">
        <button className={btn} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={17} strokeWidth={2} /></button>
        <button className={btn} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={17} strokeWidth={2} /></button>
        <button className={btn} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting"><RemoveFormatting size={17} strokeWidth={2} /></button>
      </div>
    </div>
  );
}