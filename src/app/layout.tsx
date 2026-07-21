import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stimulate — AI Agent Skills & MCP Servers Directory",
  description:
    "Discover the best AI agent skills, MCP servers, agents, and repositories. A curated directory for Claude Code, Codex, Cursor, Gemini CLI, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
