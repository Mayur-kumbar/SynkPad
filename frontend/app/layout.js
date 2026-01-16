"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { LiveblocksProvider } from "@liveblocks/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          >
            <LiveblocksProvider publicApiKey="pk_dev_5tFbQozonAKkSvcyIafhk-eHuklG43WxY1iaQY1UrXQBE6X6yMMuECUekMHlRclE">
              {children}
            </LiveblocksProvider>
          </GoogleOAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
