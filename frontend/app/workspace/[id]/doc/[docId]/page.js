"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DocumentHeader from "@/components/DocumentHeader";
import DocumentSidebar from "@/components/DocumentSidebar";
import DocumentEditor from "@/components/DocumentEditor";
import CommentsPanel from "@/components/CommentsPanel";

export default function DocumentPage() {
  const { id, docId } = useParams();
  const { user, loading } = useAuth();
  const [documentDetails, setDocumentDetails] = useState(null);

  const fetchDocumentDetails = async () => {
    try {
      const res = await api.get(`/workspace/${id}/document/${docId}`);
      setDocumentDetails(res.data.document);
      console.log("Document details:", res.data.document);
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    if (!id || !docId) return;
    fetchDocumentDetails();
  }, [id, docId]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f1419]">
      <DocumentHeader documentDetails= {documentDetails} />
      <div className="flex flex-1 overflow-hidden">
        <DocumentSidebar />
        <DocumentEditor document={documentDetails} />
        <CommentsPanel documentDetails={documentDetails}/>
      </div>
    </div>
  );
}
