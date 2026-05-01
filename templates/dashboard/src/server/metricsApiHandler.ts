import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import fsp from "node:fs/promises";
import { marked } from "marked";
import { createTwoFilesPatch } from "diff";
import {
  listRunSummaries,
  listCuadrillaRunsPage,
  weakEtag,
} from "../../../src/runs.js";
import { DASHBOARD_LIMITS } from "../../../src/dashboardLimits.js";
import { buildSnapshotPayload } from "./cuadrillaSnapshot";

const SEG = /^[a-zA-Z0-9._-]+$/;

function isUnderDir(root: string, candidate: string): boolean {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  return rel === "" || (!rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel));
}

function validSegment(s: string | undefined): s is string {
  return typeof s === "string" && SEG.test(s) && !s.includes("..");
}

function resolveRunDir(repoRoot: string, cuadrilla: string, runId: string): string {
  const base = path.resolve(repoRoot, "cuadrillas", cuadrilla, "output");
  const dir = path.resolve(base, runId);
  if (!isUnderDir(base, dir)) {
    throw new Error("path_traversal");
  }
  return dir;
}

function safeRelPath(rel: string): string[] {
  const norm = path.normalize(rel).replace(/^(\.\.(?:\/|\\|$))+/, "");
  const parts = norm.split(/[/\\]/).filter(Boolean);
  for (const p of parts) {
    if (!validSegment(p)) throw new Error("bad_rel");
  }
  return parts;
}

async function appendAudit(
  repoRoot: string,
  entry: Record<string, unknown>,
): Promise<void> {
  const logDir = path.join(repoRoot, "_nifillos", "logs");
  await fsp.mkdir(logDir, { recursive: true });
  const line =
    JSON.stringify({
      ts: new Date().toISOString(),
      ...entry,
    }) + "\n";
  await fsp.appendFile(path.join(logDir, "dashboard-audit.log"), line, "utf-8");
}

function sendJson(
  res: ServerResponse,
  body: unknown,
  status = 200,
): void {
  const json = JSON.stringify(body);
  const tag = weakEtag(json);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("ETag", tag);
  res.statusCode = status;
  res.end(json);
}

function sendJson304(res: ServerResponse, tag: string): void {
  res.statusCode = 304;
  res.setHeader("ETag", tag);
  res.end();
}

function checkIfNoneMatch(req: IncomingMessage, tag: string): boolean {
  const inm = req.headers["if-none-match"];
  if (!inm) return false;
  const w = inm.split(",").map((s) => s.trim());
  return w.includes(tag) || w.includes("*");
}

const TEXT_EXT = new Set([
  ".txt", ".log", ".md", ".markdown", ".json", ".yaml", ".yml",
  ".csv", ".xml", ".html", ".htm", ".css", ".js", ".ts", ".tsx", ".jsx", ".mjs", ".cjs",
  ".env", ".gitignore", ".mdc",
]);

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".ogg"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a"]);
const PDF_EXT = new Set([".pdf"]);

function extOf(rel: string): string {
  const lower = rel.toLowerCase();
  const i = lower.lastIndexOf(".");
  return i >= 0 ? lower.slice(i) : "";
}

async function walkArtifacts(
  runDir: string,
  limits: typeof DASHBOARD_LIMITS,
): Promise<{ files: string[]; truncated: boolean }> {
  const files: string[] = [];
  let truncated = false;

  async function walk(dir: string, depth: number, relBase: string): Promise<void> {
    if (files.length >= limits.maxArtifacts) {
      truncated = true;
      return;
    }
    if (depth > limits.maxArtifactDepth) {
      truncated = true;
      return;
    }
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (files.length >= limits.maxArtifacts) {
        truncated = true;
        return;
      }
      const rel = relBase ? `${relBase}/${e.name}` : e.name;
      if (e.isDirectory()) {
        await walk(path.join(dir, e.name), depth + 1, rel);
      } else if (e.isFile()) {
        files.push(rel.replace(/\\/g, "/"));
      }
    }
  }

  await walk(runDir, 0, "");
  files.sort();
  return { files, truncated };
}

function htmlShell(inner: string, title: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;line-height:1.45;max-width:900px;margin:1rem auto;padding:0 12px;background:#141422;color:#e8e8f0}
pre{white-space:pre-wrap;word-break:break-word;background:#1a1a2e;padding:12px;border-radius:8px;border:1px solid #2a2a3e}
code{font-family:ui-monospace,Menlo,monospace;font-size:0.9em}
a{color:#7dd3fc}</style></head><body>${inner}</body></html>`;
}

export async function tryHandleMetricsApi(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: { cuadrillasDir: string; repoRoot: string },
): Promise<boolean> {
  const url = new URL(req.url || "/", "http://local");
  if (!url.pathname.startsWith("/__cuadrillas_api")) return false;

  const repoRoot = path.resolve(ctx.repoRoot);
  const limits = DASHBOARD_LIMITS;

  try {
    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/snapshot") {
      const payload = buildSnapshotPayload(ctx.cuadrillasDir);
      const json = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.statusCode = 200;
      res.end(json);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/runs") {
      const data = await listRunSummaries(repoRoot, { limits });
      const json = JSON.stringify(data);
      const tag = weakEtag(json);
      if (checkIfNoneMatch(req, tag)) {
        sendJson304(res, tag);
        return true;
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("ETag", tag);
      res.statusCode = 200;
      res.end(json);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/runs-page") {
      const cuadrilla = url.searchParams.get("cuadrilla") || "";
      const offset = Number(url.searchParams.get("offset") || 0) || 0;
      const limit = Number(url.searchParams.get("limit") || 20) || 20;
      const focusRunId = url.searchParams.get("focusRunId") || "";
      if (!validSegment(cuadrilla)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid_cuadrilla" }));
        return true;
      }
      const focusOpts =
        focusRunId && validSegment(focusRunId) ? { focusRunId } : {};
      const data = await listCuadrillaRunsPage(repoRoot, cuadrilla, offset, limit, focusOpts);
      if ("error" in data && data.error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(data));
        return true;
      }
      const json = JSON.stringify(data);
      const tag = weakEtag(json);
      if (checkIfNoneMatch(req, tag)) {
        sendJson304(res, tag);
        return true;
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("ETag", tag);
      res.statusCode = 200;
      res.end(json);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/limits") {
      const json = JSON.stringify(limits);
      const tag = weakEtag(json);
      if (checkIfNoneMatch(req, tag)) {
        sendJson304(res, tag);
        return true;
      }
      sendJson(res, limits);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/audit") {
      const lines = Math.min(
        Number(url.searchParams.get("lines") || limits.auditTailMaxLines),
        limits.auditTailMaxLines,
      );
      const logPath = path.join(repoRoot, "_nifillos", "logs", "dashboard-audit.log");
      let text = "";
      try {
        const raw = await fsp.readFile(logPath, "utf-8");
        const all = raw.split("\n").filter(Boolean);
        text = all.slice(-lines).join("\n");
      } catch {
        text = "";
      }
      const body = { lines: text.split("\n"), path: logPath };
      const json = JSON.stringify(body);
      const tag = weakEtag(json);
      if (checkIfNoneMatch(req, tag)) {
        sendJson304(res, tag);
        return true;
      }
      sendJson(res, body);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/artifacts") {
      const cuadrilla = url.searchParams.get("cuadrilla") || "";
      const runId = url.searchParams.get("runId") || "";
      if (!validSegment(cuadrilla) || !validSegment(runId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid_params" }));
        return true;
      }
      const runDir = resolveRunDir(repoRoot, cuadrilla, runId);
      try {
        await fsp.access(runDir);
      } catch {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not_found" }));
        return true;
      }
      const { files, truncated } = await walkArtifacts(runDir, limits);
      let manifest: unknown = null;
      try {
        const m = await fsp.readFile(path.join(runDir, "manifest.json"), "utf-8");
        manifest = JSON.parse(m);
      } catch {
        manifest = null;
      }
      const body = {
        cuadrilla,
        runId,
        files,
        truncated,
        manifest,
        runDirAbs: runDir,
        limits,
      };
      const json = JSON.stringify(body);
      const tag = weakEtag(json);
      if (checkIfNoneMatch(req, tag)) {
        sendJson304(res, tag);
        return true;
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("ETag", tag);
      res.statusCode = 200;
      res.end(json);
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/preview") {
      const cuadrilla = url.searchParams.get("cuadrilla") || "";
      const runId = url.searchParams.get("runId") || "";
      const relPath = url.searchParams.get("relPath") || "";
      if (!validSegment(cuadrilla) || !validSegment(runId)) {
        res.statusCode = 400;
        res.end("bad params");
        return true;
      }
      let parts: string[];
      try {
        parts = safeRelPath(relPath);
      } catch {
        res.statusCode = 400;
        res.end("bad relPath");
        return true;
      }
      const runDir = resolveRunDir(repoRoot, cuadrilla, runId);
      const abs = path.join(runDir, ...parts);
      if (!isUnderDir(runDir, abs)) {
        res.statusCode = 400;
        res.end("path");
        return true;
      }
      let st;
      try {
        st = await fsp.stat(abs);
      } catch {
        res.statusCode = 404;
        res.end("not found");
        return true;
      }
      if (!st.isFile()) {
        res.statusCode = 400;
        res.end("not a file");
        return true;
      }
      const ext = extOf(relPath);
      await appendAudit(repoRoot, {
        action: "preview",
        cuadrilla,
        runId,
        relPath,
      });
      if (TEXT_EXT.has(ext)) {
        const max =
          ext === ".md" || ext === ".markdown"
            ? limits.maxPreviewMarkdownBytes
            : limits.maxPreviewTextBytes;
        const buf = await fsp.readFile(abs);
        const slice = buf.subarray(0, max);
        const truncated = buf.length > max;
        const text = slice.toString("utf-8");
        if (ext === ".md" || ext === ".markdown") {
          const raw = await marked.parse(text, { async: true });
          const html = htmlShell(String(raw), path.basename(relPath));
          const tag = weakEtag(html);
          if (checkIfNoneMatch(req, tag)) {
            sendJson304(res, tag);
            return true;
          }
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("ETag", tag);
          res.end(html);
          return true;
        }
        if (ext === ".html" || ext === ".htm") {
          const htmlOut = truncated ? `${text}\n<!-- … [truncated] -->` : text;
          const tag = weakEtag(htmlOut);
          if (checkIfNoneMatch(req, tag)) {
            sendJson304(res, tag);
            return true;
          }
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("ETag", tag);
          res.end(htmlOut);
          return true;
        }
        const tag = weakEtag(text);
        if (checkIfNoneMatch(req, tag)) {
          sendJson304(res, tag);
          return true;
        }
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("ETag", tag);
        res.end(truncated ? text + "\n… [truncated]" : text);
        return true;
      }
      if (IMAGE_EXT.has(ext) || PDF_EXT.has(ext) || VIDEO_EXT.has(ext) || AUDIO_EXT.has(ext)) {
        const buf = await fsp.readFile(abs);
        if (buf.length > limits.maxPreviewBinaryBytes) {
          res.statusCode = 413;
          res.end("too large");
          return true;
        }
        const mime =
          ext === ".png"
            ? "image/png"
            : ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : ext === ".gif"
                ? "image/gif"
                : ext === ".webp"
                  ? "image/webp"
                  : ext === ".svg"
                    ? "image/svg+xml"
                    : ext === ".pdf"
                      ? "application/pdf"
                      : ext === ".mp4"
                        ? "video/mp4"
                        : ext === ".webm"
                          ? "video/webm"
                          : ext === ".mp3"
                            ? "audio/mpeg"
                            : "application/octet-stream";
        const tag = weakEtag(buf.toString("base64"));
        if (checkIfNoneMatch(req, tag)) {
          sendJson304(res, tag);
          return true;
        }
        res.setHeader("Content-Type", mime);
        res.setHeader("ETag", tag);
        res.end(buf);
        return true;
      }
      res.statusCode = 415;
      res.end("unsupported type for preview");
      return true;
    }

    if (req.method === "GET" && url.pathname === "/__cuadrillas_api/download") {
      const cuadrilla = url.searchParams.get("cuadrilla") || "";
      const runId = url.searchParams.get("runId") || "";
      const relPath = url.searchParams.get("relPath") || "";
      if (!validSegment(cuadrilla) || !validSegment(runId)) {
        res.statusCode = 400;
        res.end("bad params");
        return true;
      }
      let parts: string[];
      try {
        parts = safeRelPath(relPath);
      } catch {
        res.statusCode = 400;
        return true;
      }
      const runDir = resolveRunDir(repoRoot, cuadrilla, runId);
      const abs = path.join(runDir, ...parts);
      if (!isUnderDir(runDir, abs)) {
        res.statusCode = 400;
        res.end();
        return true;
      }
      let st;
      try {
        st = await fsp.stat(abs);
      } catch {
        res.statusCode = 404;
        res.end();
        return true;
      }
      if (!st.isFile() || st.size > limits.maxDownloadBytes) {
        res.statusCode = st.isFile() ? 413 : 400;
        res.end();
        return true;
      }
      await appendAudit(repoRoot, {
        action: "download",
        cuadrilla,
        runId,
        relPath,
      });
      const buf = await fsp.readFile(abs);
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(relPath)}"`);
      res.setHeader("Content-Length", String(buf.length));
      res.statusCode = 200;
      res.end(buf);
      return true;
    }

    if (req.method === "POST" && url.pathname === "/__cuadrillas_api/diff") {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        req.on("data", (c) => chunks.push(c as Buffer));
        req.on("end", () => resolve());
        req.on("error", reject);
      });
      let body: { cuadrilla?: string; runId?: string; left?: string; right?: string };
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      } catch {
        res.statusCode = 400;
        res.end("json");
        return true;
      }
      const { cuadrilla, runId, left, right } = body;
      if (
        !validSegment(cuadrilla) ||
        !validSegment(runId) ||
        typeof left !== "string" ||
        typeof right !== "string"
      ) {
        res.statusCode = 400;
        res.end("params");
        return true;
      }
      let pL: string[];
      let pR: string[];
      try {
        pL = safeRelPath(left);
        pR = safeRelPath(right);
      } catch {
        res.statusCode = 400;
        res.end("paths");
        return true;
      }
      const runDir = resolveRunDir(repoRoot, cuadrilla!, runId!);
      const absL = path.join(runDir, ...pL);
      const absR = path.join(runDir, ...pR);
      if (!isUnderDir(runDir, absL) || !isUnderDir(runDir, absR)) {
        res.statusCode = 400;
        res.end();
        return true;
      }
      let tL: string;
      let tR: string;
      try {
        const bL = await fsp.readFile(absL);
        const bR = await fsp.readFile(absR);
        if (bL.length > limits.maxDiffEachBytes || bR.length > limits.maxDiffEachBytes) {
          res.statusCode = 413;
          res.end("too large");
          return true;
        }
        tL = bL.toString("utf-8");
        tR = bR.toString("utf-8");
      } catch {
        res.statusCode = 404;
        res.end();
        return true;
      }
      await appendAudit(repoRoot, {
        action: "diff",
        cuadrilla,
        runId,
        left,
        right,
      });
      const patch = createTwoFilesPatch(left, right, tL, tR);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.statusCode = 200;
      res.end(patch);
      return true;
    }

    if (req.method === "POST" && url.pathname === "/__cuadrillas_api/diff-runs") {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        req.on("data", (c) => chunks.push(c as Buffer));
        req.on("end", () => resolve());
        req.on("error", reject);
      });
      let body: {
        cuadrilla?: string;
        leftRunId?: string;
        rightRunId?: string;
        relPath?: string;
      };
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      } catch {
        res.statusCode = 400;
        res.end();
        return true;
      }
      const cuadrilla = body.cuadrilla;
      const leftRunId = body.leftRunId;
      const rightRunId = body.rightRunId;
      const relPath = body.relPath || "state.json";
      if (
        !validSegment(cuadrilla) ||
        !validSegment(leftRunId) ||
        !validSegment(rightRunId)
      ) {
        res.statusCode = 400;
        res.end();
        return true;
      }
      let p: string[];
      try {
        p = safeRelPath(relPath);
      } catch {
        res.statusCode = 400;
        res.end();
        return true;
      }
      const runDirL = resolveRunDir(repoRoot, cuadrilla!, leftRunId!);
      const runDirR = resolveRunDir(repoRoot, cuadrilla!, rightRunId!);
      const absL = path.join(runDirL, ...p);
      const absR = path.join(runDirR, ...p);
      let tL: string;
      let tR: string;
      try {
        const bL = await fsp.readFile(absL);
        const bR = await fsp.readFile(absR);
        if (bL.length > limits.maxDiffEachBytes || bR.length > limits.maxDiffEachBytes) {
          res.statusCode = 413;
          res.end();
          return true;
        }
        tL = bL.toString("utf-8");
        tR = bR.toString("utf-8");
      } catch {
        res.statusCode = 404;
        res.end();
        return true;
      }
      await appendAudit(repoRoot, {
        action: "diff-runs",
        cuadrilla,
        leftRunId,
        rightRunId,
        relPath,
      });
      const patch = createTwoFilesPatch(
        `${leftRunId}/${relPath}`,
        `${rightRunId}/${relPath}`,
        tL,
        tR,
      );
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.statusCode = 200;
      res.end(patch);
      return true;
    }

    res.statusCode = 404;
    res.end();
    return true;
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
    return true;
  }
}
