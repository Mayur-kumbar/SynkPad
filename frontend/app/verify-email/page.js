"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); 
  // loading | success | error
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // 🔐 Verify email on page load
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/auth/verify-email?token=${token}`
        );

        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed."
        );
      }
    };

    verifyEmail();
  }, [token]);

  // 🔁 Resend verification email
  const handleResendMail = async () => {
    setResendLoading(true);
    try {
      await axios.post(
        "http://localhost:4000/api/auth/resend-verification-email",
        {
          // backend expects email
          email: searchParams.get("email") || ""
        }
      );

      alert(
        "If your account exists and is unverified, a verification email has been sent."
      );
    } catch (err) {
      alert("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>Email Verification</h1>

      {status === "loading" && <p>Verifying your email...</p>}

      {status === "success" && (
        <>
          <p style={{ color: "green" }}>{message}</p>
          <button onClick={goToLogin}>Go to Login</button>
        </>
      )}

      {status === "error" && (
        <>
          <p style={{ color: "red" }}>{message}</p>

          <button
            onClick={handleResendMail}
            disabled={resendLoading}
            style={{ marginTop: 10 }}
          >
            {resendLoading
              ? "Sending..."
              : "Resend Verification Email"}
          </button>
        </>
      )}
    </div>
  );
}
