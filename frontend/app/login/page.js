"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const googleBtnRef = useRef(null);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      await api.post(
        "/auth/google",
        {
          idToken: credentialResponse.credential,
        },
        { withCredentials: true }
      );

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google login failed:", error);
    } finally{
      setLoading(false)
    }
  };

  // Normal email/password login (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      window.location.href = "/dashboard";
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError("Please verify your email before logging in.");
      } else if (status === 400) {
        setError(message || "Missing email or password.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#7de0c6] rounded-2xl flex items-center justify-center mb-4">
            <Layers className="w-9 h-9 text-[#0f1419]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-[#94a3b8] mt-2">Sign in to your workspace</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1f28] border border-[#2d3748] rounded-xl p-8">
          {/* 🔒 Hidden Google Login (logic only) */}
          <div>
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => console.log("Google Login Failed")}
              useOneTap={false}
              ref={googleBtnRef}
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2d3748]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f28] text-[#94a3b8]">OR</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Work email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="text-right mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#7de0c6] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7de0c6] text-[#0f1419] font-semibold rounded-lg hover:bg-[#68c9ad] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {/* Signup Link */}
          <p className="text-center text-sm text-[#94a3b8] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#7de0c6] hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
