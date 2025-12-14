"use client"

import { useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror"

export default function DocEditor({ docId }) {
  // Keep Yjs objects stable
  const ydocRef = useRef(null)
  const providerRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: false,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] outline-none p-4",
      },
    },
    autofocus: true,

    onCreate({ editor }) {
      
      const ydoc = new Y.Doc()
      ydocRef.current = ydoc

      
      const provider = new WebsocketProvider(
        "ws://localhost:5001",
        `doc-${docId}`,
        ydoc
      )
      providerRef.current = provider

      
      const yXmlFragment = ydoc.getXmlFragment("prosemirror")

      // 4️⃣ Register Yjs plugins
      editor.registerPlugin(ySyncPlugin(yXmlFragment))
      editor.registerPlugin(yUndoPlugin())
      editor.registerPlugin(yCursorPlugin(provider.awareness))

      // 5️⃣ Optional: set user info (presence)
      provider.awareness.setLocalStateField("user", {
        name: "Anonymous",
        color: "#ff6424",
      })

      // 6️⃣ Cleanup
      editor.on("destroy", () => {
        provider.destroy()
        ydoc.destroy()
      })
    },
  })

  if (!editor) return null

  return (
    <div className="h-full w-full bg-zinc-900 text-white">
      <EditorContent editor={editor} />
    </div>
  )
}
