"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [docId, setDocId] = useState("");

  const openDoc = () => {
    if (!docId) return;
    router.push(`/doc/${docId}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>SynkPad</h1>
      <p>Realtime collaborative editor (PoC)</p>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Enter document id (e.g. test)"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
        <button
          onClick={openDoc}
          style={{ marginLeft: 10, padding: 8, fontSize: 16 }}
        >
          Open Document
        </button>
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h3>Quick Test Links</h3>
      <ul>
        <li>
          <a href="/doc/test">/doc/test</a>
        </li>
        <li>
          <a href="/doc/demo">/doc/demo</a>
        </li>
      </ul>
    </div>
  );
}
