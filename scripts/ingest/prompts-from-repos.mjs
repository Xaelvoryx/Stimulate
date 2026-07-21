import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const TMP = path.join(ROOT, ".tmp-prompts");
const OUT = path.join(ROOT, "data", "prompts.json");

const REPOS = [
  ["dair-ai", "Prompt-Engineering-Guide", "Tier 1"],
  ["promptslab", "Awesome-Prompt-Engineering", "Tier 1"],
  ["f", "awesome-chatgpt-prompts", "Tier 1"],
  ["trigaten", "Learn_Prompting", "Tier 1"],
  ["openai", "openai-cookbook", "Tier 1"],
  ["anthropics", "anthropic-cookbook", "Tier 1"],
  ["google-gemini", "cookbook", "Tier 1"],
  ["mistralai", "cookbook", "Tier 1"],
  ["cohere-ai", "cohere-toolkit", "Tier 1"],
  ["NirDiamant", "Prompt_Engineering", "Tier 1"],
  ["dontriskit", "awesome-ai-system-prompts", "Tier 2"],
  ["x1xhlol", "system-prompts-and-models-of-ai-tools", "Tier 2"],
  ["jujumilk3", "leaked-system-prompts", "Tier 2"],
  ["elder-plinius", "L1B3RT4S", "Tier 2"],
  ["0xeb", "TheBigPromptLibrary", "Tier 2"],
  ["mustvlad", "ChatGPT-System-Prompts", "Tier 2"],
  ["ai-boost", "awesome-prompts", "Tier 2"],
  ["microsoft", "ai-agents-for-beginners", "Tier 3"],
  ["microsoft", "generative-ai-for-beginners", "Tier 3"],
  ["langchain-ai", "langchain", "Tier 3"],
  ["langchain-ai", "langgraph", "Tier 3"],
  ["crewAIInc", "crewAI", "Tier 3"],
  ["microsoft", "autogen", "Tier 4"],
  ["pydantic", "pydantic-ai", "Tier 3"],
  ["camel-ai", "camel", "Tier 4"],
  ["OpenBMB", "AgentVerse", "Tier 4"],
  ["OpenBMB", "XAgent", "Tier 4"],
  ["FoundationAgents", "OpenManus", "Tier 4"],
  ["OpenDevin", "OpenDevin", "Tier 4"],
  ["All-Hands-AI", "OpenHands", "Tier 4"],
  ["geekan", "MetaGPT", "Tier 4"],
  ["modelcontextprotocol", "servers", "Tier 6"],
  ["modelcontextprotocol", "python-sdk", "Tier 6"],
  ["modelcontextprotocol", "typescript-sdk", "Tier 6"],
  ["punkpeye", "awesome-mcp-servers", "Tier 6"],
  ["github", "github-mcp-server", "Tier 6"],
  ["firecrawl", "firecrawl-mcp-server", "Tier 6"],
  ["browserbase", "mcp-server-browserbase", "Tier 6"],
  ["upstash", "context7", "Tier 6"],
  ["Shubhamsaboo", "awesome-llm-apps", "Tier 7"],
  ["kaushikb11", "awesome-llm-agents", "Tier 7"],
  ["caramaschiHG", "awesome-ai-agents-2026", "Tier 7"],
  ["bradAGI", "awesome-cli-coding-agents", "Tier 7"],
];

const TEXT_EXT = new Set([
  ".md", ".mdx", ".txt", ".prompt", ".json", ".jsonl", ".yaml", ".yml", ".toml", ".ini", ".cfg",
]);

const PATH_HINT = /(prompt|prompts|system|instruction|persona|role|agent|mcp|template|playbook)/i;
const HEADING_HINT = /(prompt|system|instruction|persona|role|agent|mcp|template)/i;
const KEY_HINT = /"?(system_prompt|developer_prompt|user_prompt|prompt|instruction|template|role|persona|goal|task)"?\s*[:=-]\s*/i;

function run(command, args, cwd = ROOT, timeoutMs = 0) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    timeout: timeoutMs || undefined,
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cloneRepo(owner, repo) {
  ensureDir(TMP);
  const target = path.join(TMP, `${owner}__${repo}`);
  if (fs.existsSync(target)) {
    return { ok: true, target, skipped: true };
  }

  const url = `https://github.com/${owner}/${repo}.git`;
  const result = run(
    "git",
    ["clone", "--depth", "1", "--filter=blob:limit=200k", url, target],
    ROOT,
    120000,
  );
  if (result.status !== 0) {
    return { ok: false, error: (result.stderr || result.stdout || "clone failed").trim() };
  }
  return { ok: true, target, skipped: false };
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, out);
      continue;
    }
    out.push(abs);
  }
  return out;
}

function toSummary(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 170);
}

function hasUsefulTitle(title) {
  const value = title.trim();
  if (!value) return false;
  if (/^__[^_]+__$/.test(value)) return false;
  if (/^[\p{P}\p{S}\s_]+$/u.test(value)) return false;
  if (value.length < 4) return false;
  return true;
}

function normalizeHashText(text) {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarkdownSections(content) {
  const sections = [];
  const lines = content.split(/\r?\n/);
  let currentTitle = "";
  let buf = [];

  function flush() {
    const text = buf.join("\n").trim();
    if (!currentTitle || !text) return;
    if (!HEADING_HINT.test(currentTitle) && !KEY_HINT.test(text) && text.length < 180) return;
    if (text.length < 120) return;
    sections.push({ title: currentTitle, text: text.slice(0, 5000) });
  }

  for (const line of lines) {
    const m = line.match(/^#{1,6}\s+(.+)$/);
    if (m) {
      flush();
      currentTitle = m[1].trim();
      buf = [];
      continue;
    }
    buf.push(line);
  }
  flush();

  const codeBlocks = [...content.matchAll(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g)]
    .map((m) => m[1].trim())
    .filter((t) => t.length >= 180 && t.length <= 5000 && KEY_HINT.test(t));

  for (const [i, block] of codeBlocks.entries()) {
    sections.push({ title: `Prompt Block ${i + 1}`, text: block });
  }

  return sections;
}

function parseKeyValueChunks(content) {
  const chunks = [];
  const matches = [...content.matchAll(/(?:system_prompt|developer_prompt|user_prompt|prompt|instruction|template|role)\s*[:=]\s*([\s\S]{60,1400}?)(?:\n\n|$)/gi)];
  for (const [idx, m] of matches.entries()) {
    chunks.push({ title: `Prompt Snippet ${idx + 1}`, text: m[1].trim() });
  }
  return chunks;
}

function extractPromptsFromFile(fullPath, repoRoot) {
  const rel = path.relative(repoRoot, fullPath).replace(/\\/g, "/");
  const ext = path.extname(rel).toLowerCase();
  const filename = path.basename(rel);

  if (!TEXT_EXT.has(ext)) return [];
  if (!PATH_HINT.test(rel) && !PATH_HINT.test(filename)) return [];

  let text = "";
  try {
    text = fs.readFileSync(fullPath, "utf8");
  } catch {
    return [];
  }

  if (!text || text.length < 120) return [];

  let chunks = [];
  if (ext === ".md" || ext === ".mdx") {
    chunks = parseMarkdownSections(text);
  }

  if (chunks.length === 0) {
    chunks = parseKeyValueChunks(text);
  }

  if (chunks.length === 0 && text.length >= 240) {
    const trimmed = text.slice(0, 3500).trim();
    if (KEY_HINT.test(trimmed) || HEADING_HINT.test(rel)) {
      chunks = [{ title: filename.replace(ext, ""), text: trimmed }];
    }
  }

  return chunks.map((chunk) => ({
    path: rel,
    title: chunk.title,
    prompt: chunk.text,
  })).filter((item) => hasUsefulTitle(item.title));
}

function main() {
  ensureDir(path.join(ROOT, "data"));

  const reports = [];
  const rawItems = [];

  for (const [owner, repo, tier] of REPOS) {
    console.log(`Cloning ${owner}/${repo} (${tier}) ...`);
    const clone = cloneRepo(owner, repo);
    const repoName = `${owner}/${repo}`;

    if (!clone.ok) {
      console.log(`  × failed: ${clone.error}`);
      reports.push({ repo: repoName, tier, ok: false, error: clone.error, filesScanned: 0, extracted: 0 });
      continue;
    }

    const files = walk(clone.target);
    let extracted = 0;

    for (const filePath of files) {
      const prompts = extractPromptsFromFile(filePath, clone.target);
      for (const p of prompts) {
        extracted += 1;
        rawItems.push({
          repo: repoName,
          repoUrl: `https://github.com/${owner}/${repo}`,
          tier,
          path: p.path,
          title: p.title,
          prompt: p.prompt,
        });
      }
    }

    console.log(`  ✓ scanned ${files.length} files, extracted ${extracted}`);

    reports.push({ repo: repoName, tier, ok: true, filesScanned: files.length, extracted });
  }

  const dedup = new Map();

  for (const item of rawItems) {
    const clean = item.prompt.replace(/\s+/g, " ").trim();
    if (clean.length < 120) continue;
    if (!hasUsefulTitle(item.title)) continue;

    const hashBase = normalizeHashText(clean).slice(0, 1200);
    if (!hashBase) continue;
    const hash = crypto.createHash("sha256").update(hashBase).digest("hex").slice(0, 16);

    if (dedup.has(hash)) continue;

    dedup.set(hash, {
      id: `prompt-${dedup.size + 1}`,
      title: item.title.replace(/\s+/g, " ").trim().slice(0, 100),
      summary: toSummary(clean),
      prompt: item.prompt.trim().slice(0, 6000),
      repo: item.repo,
      repoUrl: item.repoUrl,
      sourcePath: item.path,
      tier: item.tier,
      tags: [item.tier, item.repo.split("/")[0]],
    });
  }

  const items = [...dedup.values()].sort((a, b) => a.title.localeCompare(b.title));

  const payload = {
    generatedAt: new Date().toISOString(),
    totalRepos: REPOS.length,
    extractedRaw: rawItems.length,
    totalPrompts: items.length,
    sourceReports: reports,
    items,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

  console.log(JSON.stringify({
    repos: REPOS.length,
    extractedRaw: rawItems.length,
    totalPrompts: items.length,
    failedRepos: reports.filter((r) => !r.ok).length,
  }, null, 2));
  console.log(`Saved ${OUT}`);
}

main();
