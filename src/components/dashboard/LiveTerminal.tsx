"use client";

import { useEffect, useState, useRef } from "react";
import type { CatalogItem, PromptItem } from "@/types";

interface LiveTerminalProps {
  items: CatalogItem[];
  prompts: PromptItem[];
  totals: {
    skills: number;
    mcps: number;
    agents: number;
    prompts?: number;
    all: number;
  };
}

interface LogLine {
  id: string;
  type: "cmd" | "ok" | "dim" | "info" | "skill" | "mcp" | "agent" | "prompt" | "success";
  text: string;
}

export function LiveTerminal({ items, prompts, totals }: LiveTerminalProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Combine and shuffle the data to stream
  const [streamPool, setStreamPool] = useState<Array<{ name: string; type: string }>>([]);

  useEffect(() => {
    const pool: Array<{ name: string; type: string }> = [];
    items.forEach(item => {
      pool.push({ name: item.name, type: item.type });
    });
    prompts.forEach(p => {
      pool.push({ name: p.title, type: "prompt" });
    });
    // Shuffle the pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setStreamPool(shuffled);
  }, [items, prompts]);

  // Cursor blinking
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom of terminal container only (fixes page scrolling bug)
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs, currentInput]);

  // Terminal animation orchestration
  useEffect(() => {
    if (streamPool.length === 0) return;

    let isCancelled = false;
    
    // Typewriter effect helper
    const typeCommand = async (cmdText: string) => {
      setCurrentInput("");
      for (let i = 0; i <= cmdText.length; i++) {
        if (isCancelled) return;
        setCurrentInput(cmdText.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    const runScript = async () => {
      // 1. Initial Load Message
      setLogs([
        { id: "init-1", type: "dim", text: "Initializing stimulate terminal..." },
        { id: "init-2", type: "ok", text: "✓ Connected to local database" },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 800));

      while (!isCancelled) {
        // Command A: Search and Index
        await typeCommand("stimulate search \"mcp server\"");
        if (isCancelled) return;
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, type: "cmd", text: "stimulate search \"mcp server\"" }
        ]);
        setCurrentInput("");
        setLogs(prev => [
          ...prev,
          { id: `res-${Date.now()}`, type: "ok", text: `✓ ${totals.mcps.toLocaleString()} MCP servers indexed` },
          { id: `dim-${Date.now()}`, type: "dim", text: "filesystem · postgres · github · slack · sqlite · docker · aws" }
        ]);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Command B: List type skill
        await typeCommand("stimulate list --type skill");
        if (isCancelled) return;
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, type: "cmd", text: "stimulate list --type skill" }
        ]);
        setCurrentInput("");
        setLogs(prev => [
          ...prev,
          { id: `res-${Date.now()}`, type: "ok", text: `✓ ${totals.skills.toLocaleString()} skills ready` },
          { id: `dim-${Date.now()}`, type: "dim", text: "frontend-design · code-review · seo · devops · documentation" }
        ]);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Command C: Real-time stream
        await typeCommand("stimulate stream --realtime");
        if (isCancelled) return;
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, type: "cmd", text: "stimulate stream --realtime" }
        ]);
        setCurrentInput("");
        setLogs(prev => [
          ...prev,
          { id: `res-${Date.now()}`, type: "info", text: "Connecting to real-time agent ecosystem stream..." },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Stream pool items
        let poolIndex = 0;
        for (let count = 0; count < 40; count++) {
          if (isCancelled) return;
          const item = streamPool[poolIndex % streamPool.length];
          poolIndex++;
          
          setLogs(prev => {
            const nextLogs = [
              ...prev,
              {
                id: `stream-${Date.now()}-${count}`,
                type: item.type as any,
                text: `${item.name}`
              }
            ];
            // Cap history to prevent performance issues
            if (nextLogs.length > 25) {
              return nextLogs.slice(nextLogs.length - 25);
            }
            return nextLogs;
          });
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Command D: Print summary stats
        await typeCommand("stimulate stats --summary");
        if (isCancelled) return;
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, type: "cmd", text: "stimulate stats --summary" }
        ]);
        setCurrentInput("");
        setLogs(prev => [
          ...prev,
          { id: `stat-header-${Date.now()}`, type: "success", text: "┌────────────────────────────────────────┐" },
          { id: `stat-skills-${Date.now()}`, type: "success", text: `│  Skills          : ${totals.skills.toLocaleString().padEnd(20)} │` },
          { id: `stat-mcps-${Date.now()}`, type: "success", text: `│  MCP Servers     : ${totals.mcps.toLocaleString().padEnd(20)} │` },
          { id: `stat-agents-${Date.now()}`, type: "success", text: `│  Agents          : ${totals.agents.toLocaleString().padEnd(20)} │` },
          { id: `stat-prompts-${Date.now()}`, type: "success", text: `│  Prompt Vault    : ${(totals.prompts ?? 0).toLocaleString().padEnd(20)} │` },
          { id: `stat-all-${Date.now()}`, type: "success", text: `│  Total Index     : ${totals.all.toLocaleString().padEnd(20)} │` },
          { id: `stat-footer-${Date.now()}`, type: "success", text: "└────────────────────────────────────────┘" },
        ]);

        await new Promise((resolve) => setTimeout(resolve, 4000));
        setLogs([]);
      }
    };

    runScript();

    return () => {
      isCancelled = true;
    };
  }, [streamPool, totals]);

  return (
    <div className="terminal" style={{ display: "flex", flexDirection: "column", height: "380px" }}>
      <div className="terminal-head">
        <i className="tl-r" />
        <i className="tl-y" />
        <i className="tl-g" />
        <span>stimulate — realtime catalog stream</span>
      </div>
      <div className="terminal-body" ref={terminalBodyRef} style={{ flex: 1, overflowY: "auto", fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.4" }}>
        {logs.map((log) => {
          if (log.type === "cmd") {
            return (
              <div key={log.id} className="cmd" style={{ margin: "0.2rem 0" }}>
                stimulate {log.text.replace("stimulate ", "")}
              </div>
            );
          }
          if (log.type === "ok") {
            return (
              <div key={log.id} className="ok" style={{ color: "#10b981", margin: "0.1rem 0" }}>
                {log.text}
              </div>
            );
          }
          if (log.type === "dim") {
            return (
              <div key={log.id} className="dim" style={{ color: "#71717a", margin: "0.1rem 0" }}>
                {log.text}
              </div>
            );
          }
          if (log.type === "info") {
            return (
              <div key={log.id} className="info" style={{ color: "#3b82f6", margin: "0.1rem 0" }}>
                ℹ {log.text}
              </div>
            );
          }
          if (log.type === "success") {
            return (
              <div key={log.id} className="success" style={{ color: "#10b981", fontWeight: "bold", margin: "0.05rem 0" }}>
                {log.text}
              </div>
            );
          }
          
          // Resource tags styling
          let typeColor = "#6366f1";
          let typeLabel = log.type.toUpperCase();
          if (log.type === "skill") typeColor = "#10b981";
          if (log.type === "mcp") typeColor = "#f59e0b";
          if (log.type === "agent") typeColor = "#ec4899";
          if (log.type === "prompt") typeColor = "#06b6d4";

          return (
            <div key={log.id} style={{ display: "flex", gap: "0.5rem", margin: "0.15rem 0", color: "#e4e4e7" }}>
              <span style={{ color: typeColor, fontWeight: "bold" }}>[{typeLabel}]</span>
              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{log.text}</span>
            </div>
          );
        })}
        {currentInput && (
          <div className="cmd" style={{ margin: "0.2rem 0" }}>
            stimulate {currentInput.replace("stimulate ", "")}
            {showCursor && <span style={{ fontWeight: "bold" }}>_</span>}
          </div>
        )}
        {!currentInput && logs.length > 0 && (
          <div style={{ color: "#71717a", marginTop: "0.2rem" }}>
            $ {showCursor && <span style={{ fontWeight: "bold" }}>_</span>}
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
