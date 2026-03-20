import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CosmoLearn 宇宙学堂 | AI Math & Physics Tutor",
  description:
    "AI-powered interactive tutoring for high school math and physics. Multi-agent classroom with personalized learning paths and gamification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-cosmic-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
