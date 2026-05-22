import { Router, type IRouter } from "express";
import { readdirSync, readFileSync, statSync, createReadStream } from "fs";
import path from "path";
import { createRequire } from "module";
import { validTokens } from "./auth";

const _require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ZipArchive } = _require("archiver") as { ZipArchive: new (opts?: any) => any };

const router: IRouter = Router();

const WORKSPACE_ROOT = "/home/runner/workspace";

const IGNORED = new Set([
  "node_modules", ".git", "dist", ".cache", ".turbo",
  "pnpm-lock.yaml", ".env", ".env.local",
]);

const TEXT_EXTS = new Set([
  "ts","tsx","js","jsx","json","yaml","yml","md","css","html",
  "toml","mjs","cjs","sh","txt","prisma","sql","graphql","env.example",
]);

function isText(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXTS.has(ext);
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

function buildTree(dir: string, relBase: string, depth = 0): TreeNode[] {
  if (depth > 6) return [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return []; }

  const dirs: TreeNode[] = [];
  const files: TreeNode[] = [];

  for (const name of entries) {
    if (IGNORED.has(name) || name.startsWith(".")) continue;
    const abs = path.join(dir, name);
    const rel = relBase ? `${relBase}/${name}` : name;
    let stat;
    try { stat = statSync(abs); } catch { continue; }

    if (stat.isDirectory()) {
      dirs.push({
        name, path: rel, type: "dir",
        children: buildTree(abs, rel, depth + 1),
      });
    } else if (stat.isFile() && isText(name)) {
      files.push({ name, path: rel, type: "file", size: stat.size });
    }
  }

  return [
    ...dirs.sort((a, b) => a.name.localeCompare(b.name)),
    ...files.sort((a, b) => a.name.localeCompare(b.name)),
  ];
}

function requireToken(req: any, res: any): boolean {
  const auth = (req.headers["authorization"] as string) ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// Collect all absolute file paths under a directory (recursively)
function collectFiles(dir: string): { abs: string; rel: string }[] {
  const results: { abs: string; rel: string }[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (IGNORED.has(name) || name.startsWith(".")) continue;
    const abs = path.join(dir, name);
    let stat;
    try { stat = statSync(abs); } catch { continue; }
    if (stat.isDirectory()) {
      const sub = collectFiles(abs);
      // prepend folder name to relative paths
      sub.forEach(f => results.push({ abs: f.abs, rel: `${name}/${f.rel}` }));
    } else if (stat.isFile() && isText(name)) {
      results.push({ abs, rel: name });
    }
  }
  return results;
}

// GET /api/source/tree
router.get("/source/tree", (req, res): void => {
  if (!requireToken(req, res)) return;
  const tree = buildTree(WORKSPACE_ROOT, "");
  res.json({ tree });
});

// GET /api/source/file?path=...
router.get("/source/file", (req, res): void => {
  if (!requireToken(req, res)) return;
  const filePath = req.query.path as string;
  if (!filePath) { res.status(400).json({ error: "Missing path" }); return; }

  const abs = path.resolve(WORKSPACE_ROOT, filePath);
  if (!abs.startsWith(WORKSPACE_ROOT)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  try {
    const content = readFileSync(abs, "utf-8");
    res.json({ content, path: filePath });
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

// GET /api/source/zip?path=...  (omit path or pass "" for the entire workspace)
router.get("/source/zip", (req, res): void => {
  if (!requireToken(req, res)) return;

  const reqPath = (req.query.path as string) ?? "";

  // Resolve target directory
  const targetAbs = reqPath
    ? path.resolve(WORKSPACE_ROOT, reqPath)
    : WORKSPACE_ROOT;

  if (!targetAbs.startsWith(WORKSPACE_ROOT)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  let stat;
  try { stat = statSync(targetAbs); } catch {
    res.status(404).json({ error: "Not found" }); return;
  }

  const zipName = reqPath
    ? `${path.basename(targetAbs)}.zip`
    : "snapsave-hub.zip";

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.pipe(res);

  if (stat.isDirectory()) {
    const files = collectFiles(targetAbs);
    const prefix = reqPath ? path.basename(targetAbs) + "/" : "";
    for (const { abs, rel } of files) {
      try {
        archive.append(createReadStream(abs), { name: prefix + rel });
      } catch { /* skip unreadable files */ }
    }
  } else if (stat.isFile()) {
    archive.append(createReadStream(targetAbs), { name: path.basename(targetAbs) });
  }

  archive.finalize().catch((err: Error) => {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });
});

export default router;
