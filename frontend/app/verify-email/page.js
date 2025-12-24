"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const verifyEmail = async () => {
    if (!token.trim()) {
      setError("Please enter the verification token.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      await api.get("/auth/verify-email", {
        params: { token },
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || "Verification failed.");
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      await api.post("/auth/resend-verification-email", { email });
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to resend verification email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[#7de0c6] rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Layers className="w-9 h-9 text-[#0f1419]" />
        </div>

        <div className="bg-[#1a1f28] border border-[#2d3748] rounded-xl p-8">
          {/* TOKEN INPUT */}
          {status !== "success" && (
            <>
              <input
                type="text"
                placeholder="Paste verification token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 mb-4 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
              />

              {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

              <button
                onClick={verifyEmail}
                className="w-full px-6 py-3 bg-[#7de0c6] text-[#0f1419] font-semibold rounded-lg hover:bg-[#68c9ad]"
              >
                Verify Email
              </button>
            </>
          )}

          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-[#7de0c6] mx-auto my-4 animate-spin" />
              <p className="text-[#94a3b8]">Verifying your email…</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-[#7de0c6] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Email verified!
              </h1>
              <p className="text-[#94a3b8] mb-6">
                Your email has been successfully verified.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[#7de0c6] text-[#0f1419] font-semibold rounded-lg hover:bg-[#68c9ad]"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-[#94a3b8] mb-4">
                Verification failed. The token may be invalid or expired.
              </p>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 mb-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
              />

              <button
                onClick={resendVerification}
                className="w-full px-6 py-3 bg-[#7de0c6] text-[#0f1419] font-semibold rounded-lg hover:bg-[#68c9ad] mb-3"
              >
                Resend Verification Email
              </button>
              {message && (
                <p className="text-sm text-[#94a3b8] mt-2">{message}</p>
              )}

              <Link href="/login" className="text-[#7de0c6] hover:underline">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
