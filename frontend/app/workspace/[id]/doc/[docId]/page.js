"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DocumentHeader from "@/components/DocumentHeader";
import DocumentSidebar from "@/components/DocumentSidebar";
import CommentsPanel from "@/components/CommentsPanel";
import Editor from "@/components/Editor";
import Whiteboard from "@/components/Whiteboard";
import { RoomProvider } from "@liveblocks/react";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { Layers, FileText } from "lucide-react";

export default function DocumentPage() {
  const { id, docId } = useParams();
  const { user, loading } = useAuth();
  const [documentDetails, setDocumentDetails] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("document"); // For 'combined' type

  const fetchDocumentDetails = async () => {
    try {
      const res = await api.get(`/workspace/${id}/document/${docId}`);
      setDocumentDetails(res.data.document);
      setUserRole(res.data.role);
      // Set initial tab based on type
      if (res.data.document.docType === "whiteboard") setActiveTab("whiteboard");
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    if (!id || !docId) return;
    fetchDocumentDetails();
  }, [id, docId]);

  if (loading || !user || !documentDetails || !userRole) return null;

  const isCombined = documentDetails.docType === "combined";
  const showEditor =
    documentDetails.docType === "document" ||
    (isCombined && activeTab === "document");
  const showWhiteboard =
    documentDetails.docType === "whiteboard" ||
    (isCombined && activeTab === "whiteboard");

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f1419]">
      <DocumentHeader documentDetails={documentDetails} />
      <div className="flex flex-1 overflow-hidden">
        {/* <DocumentSidebar /> */}
        
        <RoomProvider
          id={`doc-${docId}`}
          initialStorage={{
            layers: new LiveMap(), // Use LiveMap for better performance than LiveObject for lists of items
          }}
        >
          <div className="flex-1 flex flex-col min-w-0 bg-[#0f1419] relative">
            {/* View Toggle for Combined Mode */}
            {isCombined && (
              <div className="absolute top-4 right-4 z-50 bg-[#1f2937] border border-[#374151] rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setActiveTab("document")}
                  className={`p-2 rounded transition-colors ${
                    activeTab === "document"
                      ? "bg-[#374151] text-[#7de0c6]"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Document View"
                >
                  <FileText size={18} />
                </button>
                <div className="w-px bg-[#374151] my-1" />
                <button
                  onClick={() => setActiveTab("whiteboard")}
                  className={`p-2 rounded transition-colors ${
                    activeTab === "whiteboard"
                      ? "bg-[#374151] text-[#60a5fa]"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Whiteboard View"
                >
                  <Layers size={18} />
                </button>
              </div>
            )}

            {/* Content Area */}
            {showEditor && <Editor docId={docId} role={userRole} />}
            {showWhiteboard && <Whiteboard role={userRole} />}
          </div>
        </RoomProvider>

        <CommentsPanel documentDetails={documentDetails} />
      </div>
    </div>
  );
}
