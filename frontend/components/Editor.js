"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useRoom } from "@liveblocks/react";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useAuth } from "@/context/AuthContext";
import MenuBar from "./MenuBar";

// Basic editor styles
import "../app/globals.css";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import { Eye } from "lucide-react";

export default function Editor({ docId, role }) {
  const room = useRoom();
  const [doc, setDoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    console.log("ed role: ", role)

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  const editor = useEditor(
    {
      editable: role !== "viewer",
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        // Basic styling extensions
        // You can add Highlight, TextAlign, etc. here if they were in the codebase before
        ...(doc && provider
          ? [
              Collaboration.configure({
                document: doc,
              }),
              // CollaborationCursor.configure({
              //   provider: provider,
              //   user: user
              //     ? {
              //         name: user.name,
              //         color: user.color,
              //       }
              //     : {
              //         name: "Anonymous",
              //         color: "#f87171",
              //       },
              // }),
              Highlight,
              Underline,
              TextAlign.configure({ types: ["heading", "paragraph"] }),
              Blockquote,

            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class:
            "prose prose-invert max-w-none focus:outline-none min-h-[400px] outline-none",
        },
      },
      immediatelyRender: false,
    },
    [doc, provider, user]
  );

  if (!editor || !doc || !provider) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0e13]">
      {role !== "viewer" ? (
        <MenuBar editor={editor} />
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-950/30 to-blue-900/20 border-b border-blue-800/30">
          <div className="flex items-center gap-2 text-blue-300">
            <Eye size={16} strokeWidth={2} />
            <span className="text-sm font-medium">Viewing Mode</span>
          </div>
          <span className="text-xs text-blue-400/60">You have read-only access to this document</span>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none
          prose-headings:text-gray-100 
          prose-p:text-gray-300 
          prose-a:text-blue-400
          prose-strong:text-gray-200
          prose-code:text-blue-300
          prose-pre:bg-gray-900
          selection:bg-blue-500/30"
      />
    </div>
  );
}
