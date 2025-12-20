"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const googleBtnRef = useRef(null);

  // ✅ Google signup success handler (ID TOKEN)
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/google",
        {
          idToken: credentialResponse.credential,
        },
        { withCredentials: true }
      );

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google signup failed:", error);
    }
  };

  // Normal email/password signup (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", res.data);

    } catch (error) {
      console.error("Registration error:", error);
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
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-[#94a3b8] mt-2">Start collaborating in minutes</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1f28] border border-[#2d3748] rounded-xl p-8">
          <div>
            <GoogleLogin
              onSuccess={handleGoogleSignupSuccess}
              onError={() => console.log("Google Signup Failed")}
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
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

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
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <p className="text-xs text-[#94a3b8] mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#7de0c6] text-[#0f1419] font-semibold rounded-lg hover:bg-[#68c9ad]"
              >
                Create account
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#94a3b8] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7de0c6] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
