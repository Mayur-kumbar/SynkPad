"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"

export default function EditorCore({ ydoc }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: ydoc }),
    //   CollaborationCursor.configure({
    //     provider,
    //     user: {
    //       name: user?.name || "User",
    //       color: user?.color || "#7de0c6",
    //     },
    //   }),
    ],
     content: '<p>Hello World! 🌎️</p>',
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none",
      },
    },
    immediatelyRender: false
  })

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      <EditorContent editor={editor} />
    </div>
  )
}
