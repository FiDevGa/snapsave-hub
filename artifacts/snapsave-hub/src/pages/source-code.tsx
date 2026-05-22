import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticateSourceCode } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import {
  Lock, FileCode, Folder, FolderOpen, ChevronRight, ChevronDown,
  FileJson, FileText, File, Copy, Check, Search, RefreshCw,
  Download, X, Archive, FolderDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("jsx", javascript);

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    json: "json", css: "css", yaml: "yaml", yml: "yaml",
    html: "xml", xml: "xml", md: "plaintext", toml: "plaintext",
    sh: "bash", mjs: "javascript", cjs: "javascript",
  };
  return map[ext] ?? "plaintext";
}

function highlight(code: string, filename: string): string {
  const lang = getLang(filename);
  try { return hljs.highlight(code, { language: lang }).value; }
  catch { return hljs.highlightAuto(code).value; }
}

function FileIcon({ name, className = "w-3.5 h-3.5" }: { name: string; className?: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (name === "package.json" || ext === "json") return <FileJson className={`${className} text-yellow-400`} />;
  if (ext === "ts" || ext === "tsx") return <FileCode className={`${className} text-blue-400`} />;
  if (ext === "js" || ext === "jsx" || ext === "mjs") return <FileCode className={`${className} text-yellow-300`} />;
  if (ext === "css") return <File className={`${className} text-pink-400`} />;
  if (ext === "md") return <FileText className={`${className} text-gray-300`} />;
  if (ext === "yaml" || ext === "yml" || ext === "toml") return <FileText className={`${className} text-green-400`} />;
  if (ext === "sh") return <FileText className={`${className} text-green-300`} />;
  return <File className={`${className} text-gray-400`} />;
}

// Download a ZIP from the API
function downloadZip(token: string, folderPath: string, filename: string) {
  const url = `/api/source/zip?path=${encodeURIComponent(folderPath)}`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(async (r) => {
      if (!r.ok) throw new Error("Failed");
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => alert("Failed to download ZIP. Please try again."));
}

function TreeItem({
  node, depth, selectedPath, onSelect, token, filter,
}: {
  node: TreeNode; depth: number; selectedPath: string | null;
  onSelect: (node: TreeNode) => void; token: string; filter: string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const [zipping, setZipping] = useState(false);
  const lc = filter.toLowerCase();
  const matches = !filter || node.name.toLowerCase().includes(lc) ||
    (node.type === "dir" && node.children?.some(c => c.name.toLowerCase().includes(lc)));

  if (!matches && node.type === "file") return null;

  const handleZip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZipping(true);
    const url = `/api/source/zip?path=${encodeURIComponent(node.path)}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed");
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${node.name}.zip`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => alert("Failed to download ZIP."))
      .finally(() => setZipping(false));
  };

  if (node.type === "dir") {
    return (
      <div className="group/dir">
        <div
          className="flex items-center hover:bg-[#2a2d2e] rounded transition-colors"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <button
            className="flex-1 flex items-center gap-1.5 py-0.5 text-[#ccc] text-[13px] text-left min-w-0"
            onClick={() => setOpen(o => !o)}
          >
            {open
              ? <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
              : <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />}
            {open
              ? <FolderOpen className="w-3.5 h-3.5 text-[#dcb862] shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-[#dcb862] shrink-0" />}
            <span className="truncate leading-5">{node.name}</span>
          </button>
          {/* folder zip button — shows on hover */}
          <button
            onClick={handleZip}
            title={`Download ${node.name} as ZIP`}
            className="opacity-0 group-hover/dir:opacity-100 mr-1.5 p-0.5 rounded text-[#888] hover:text-[#dcb862] transition-all shrink-0"
          >
            {zipping
              ? <RefreshCw className="w-3 h-3 animate-spin" />
              : <Archive className="w-3 h-3" />}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="overflow-hidden"
            >
              {node.children.map(child => (
                <TreeItem key={child.path} node={child} depth={depth + 1}
                  selectedPath={selectedPath} onSelect={onSelect} token={token} filter={filter} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const active = selectedPath === node.path;
  return (
    <button
      className={`w-full flex items-center gap-1.5 py-0.5 rounded text-[13px] text-left transition-colors leading-5 ${
        active ? "bg-[#37373d] text-white" : "text-[#ccc] hover:bg-[#2a2d2e]"
      }`}
      style={{ paddingLeft: `${8 + depth * 14 + 14}px` }}
      onClick={() => onSelect(node)}
    >
      <FileIcon name={node.name} />
      <span className="truncate flex-1">{node.name}</span>
      {node.size !== undefined && (
        <span className="text-[10px] text-[#555] mr-1.5 shrink-0">{(node.size / 1024).toFixed(1)}k</span>
      )}
    </button>
  );
}

function CodeViewer({ content, filename }: { content: string; filename: string }) {
  const lines = content.split("\n");
  const html = highlight(content, filename);
  const highlightedLines = html.split("\n");

  return (
    <div className="flex text-[13px] leading-5 min-h-full">
      <div className="select-none text-right text-[#444] pr-4 pl-4 pt-4 pb-4 shrink-0"
        style={{ minWidth: `${String(lines.length).length * 8 + 24}px`, borderRight: "1px solid #2a2a2a", fontFamily: "monospace" }}>
        {lines.map((_, i) => <div key={i} className="leading-5">{i + 1}</div>)}
      </div>
      <pre
        className="flex-1 p-4 overflow-x-auto whitespace-pre text-[#d4d4d4]"
        style={{ fontFamily: "monospace", margin: 0 }}
        dangerouslySetInnerHTML={{ __html: highlightedLines.join("\n") }}
      />
    </div>
  );
}

export function SourceCode() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("sc_token"));
  const [password, setPassword] = useState("");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("");
  const [openTabs, setOpenTabs] = useState<TreeNode[]>([]);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const auth = useAuthenticateSourceCode();

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("sc_token");
    setToken(null); setTree([]); setSelected(null); setContent(""); setOpenTabs([]);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    auth.mutate({ data: { password } }, {
      onSuccess: (data) => {
        sessionStorage.setItem("sc_token", data.token);
        setToken(data.token);
      },
    });
  };

  const loadTree = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const r = await fetch("/api/source/tree", { headers: { Authorization: `Bearer ${tok}` } });
      if (r.status === 401) { handleLogout(); return; }
      const data = await r.json() as { tree: TreeNode[] };
      setTree(data.tree ?? []);
    } catch { setTree([]); }
    finally { setLoading(false); }
  }, [handleLogout]);

  useEffect(() => { if (token) loadTree(token); }, [token, loadTree]);

  const handleSelect = async (node: TreeNode) => {
    if (node.type !== "file" || !token) return;
    setSelected(node);
    setOpenTabs(prev => prev.find(t => t.path === node.path) ? prev : [...prev, node]);
    setFileLoading(true);
    try {
      const r = await fetch(`/api/source/file?path=${encodeURIComponent(node.path)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 401) { handleLogout(); return; }
      const data = await r.json() as { content: string };
      setContent(data.content ?? "");
    } catch { setContent("// Error loading file"); }
    finally { setFileLoading(false); }
  };

  const closeTab = (tabPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openTabs.filter(t => t.path !== tabPath);
    setOpenTabs(next);
    if (selected?.path === tabPath) {
      const last = next[next.length - 1];
      if (last) handleSelect(last); else { setSelected(null); setContent(""); }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!selected) return;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = selected.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleDownloadAll = () => {
    if (!token) return;
    setDownloadingAll(true);
    downloadZip(token, "", "snapsave-hub.zip");
    setTimeout(() => setDownloadingAll(false), 3000);
  };

  // ─── Auth gate ────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-red-900/30 to-transparent p-8 text-center border-b border-white/8">
              <div className="mx-auto w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-red-500/30">
                <Lock className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-bold mb-1">Source Code Access</h2>
              <p className="text-sm text-muted-foreground">
                Enter the developer password to browse the full project source
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleAuth} className="space-y-3">
                <Input
                  ref={passwordRef}
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-center tracking-widest bg-black/30 border-white/10 h-11 focus-visible:border-red-500/60 focus-visible:ring-red-500/20"
                  autoFocus
                />
                <button type="submit" disabled={auth.isPending || !password}
                  className="w-full h-11 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {auth.isPending ? "Authenticating..." : "Unlock Source Code"}
                </button>
                {auth.isError && (
                  <p className="text-red-400 text-sm text-center">Incorrect password. Please try again.</p>
                )}
              </form>
              <p className="text-xs text-muted-foreground/50 text-center mt-4">
                Hint: the password was set by the project owner
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const fileCount = (function count(nodes: TreeNode[]): number {
    return nodes.reduce((acc, n) => acc + (n.type === "file" ? 1 : count(n.children ?? [])), 0);
  })(tree);

  const ext = selected?.name.split(".").pop()?.toUpperCase() ?? "";

  // ─── VS Code explorer ─────────────────────────────────────────
  return (
    <>
      <style>{`
        .hljs-keyword,.hljs-selector-tag,.hljs-title,.hljs-section,.hljs-doctag,.hljs-name,.hljs-strong{color:#569cd6}
        .hljs-string,.hljs-title.class_,.hljs-symbol,.hljs-bullet,.hljs-addition{color:#ce9178}
        .hljs-comment,.hljs-quote{color:#6a9955;font-style:italic}
        .hljs-number,.hljs-literal,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr{color:#b5cea8}
        .hljs-type,.hljs-class .hljs-title{color:#4ec9b0}
        .hljs-attr,.hljs-attribute,.hljs-selector-class,.hljs-selector-id{color:#9cdcfe}
        .hljs-built_in,.hljs-tag,.hljs-regexp,.hljs-deletion{color:#d16969}
        .hljs-params{color:#9cdcfe}
        .hljs-function{color:#dcdcaa}
        .hljs-title.function_,.hljs-title.function_.invoke__{color:#dcdcaa}
        .hljs-property{color:#9cdcfe}
        .hljs-operator,.hljs-punctuation{color:#d4d4d4}
        .hljs-meta{color:#9b9b9b}
      `}</style>

      <div className="h-[calc(100vh-100px)] flex flex-col rounded-2xl border border-white/8 overflow-hidden bg-[#1e1e1e] font-mono text-sm shadow-2xl">
        {/* Title bar */}
        <div className="h-9 bg-[#323233] border-b border-[#111] flex items-center px-4 justify-between shrink-0 select-none">
          <div className="flex gap-1.5">
            <button onClick={handleLogout} title="Logout / lock"
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="text-[#999] text-[11px] font-sans">SnapSave Hub — Source Explorer</div>
          <div className="flex items-center gap-3">
            {/* Download entire project as ZIP */}
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              title="Download entire project as ZIP"
              className="flex items-center gap-1.5 text-[11px] font-sans text-[#999] hover:text-white transition-colors disabled:opacity-50 border border-[#444] hover:border-[#666] rounded px-2 py-0.5"
            >
              {downloadingAll
                ? <RefreshCw className="w-3 h-3 animate-spin" />
                : <FolderDown className="w-3 h-3" />}
              <span>Download all</span>
            </button>
            <button onClick={() => loadTree(token!)} title="Refresh"
              className="text-[#777] hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar ── */}
          <div className="w-60 bg-[#252526] border-r border-[#1a1a1a] flex flex-col shrink-0">
            {/* Search */}
            <div className="px-2.5 py-2 border-b border-[#1a1a1a]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666]" />
                <input
                  className="w-full bg-[#3c3c3c] text-[#ccc] text-[12px] rounded pl-7 pr-2 py-1.5 outline-none border border-transparent focus:border-[#0078d4]/60 placeholder:text-[#555]"
                  placeholder="Filter files..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Explorer header with root download */}
            <div className="px-3 py-1 flex items-center justify-between border-b border-[#1a1a1a]">
              <span className="text-[10px] font-bold text-[#bbb] uppercase tracking-[0.12em] font-sans">
                Explorer · {fileCount} files
              </span>
              <button
                onClick={handleDownloadAll}
                title="Download all as ZIP"
                className="text-[#555] hover:text-[#dcb862] transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-1">
              {loading ? (
                <div className="flex items-center justify-center h-20 text-[#666] text-xs font-sans gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…
                </div>
              ) : tree.length === 0 ? (
                <div className="text-[#555] text-xs text-center py-8 font-sans">No files found</div>
              ) : (
                tree.map(node => (
                  <TreeItem key={node.path} node={node} depth={0}
                    selectedPath={selected?.path ?? null} onSelect={handleSelect}
                    token={token!} filter={filter} />
                ))
              )}
            </div>
          </div>

          {/* ── Editor ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
            {/* Tabs */}
            {openTabs.length > 0 && (
              <div className="flex bg-[#2d2d2d] border-b border-[#1a1a1a] overflow-x-auto shrink-0 scrollbar-none">
                {openTabs.map(tab => {
                  const active = selected?.path === tab.path;
                  return (
                    <button key={tab.path} onClick={() => handleSelect(tab)}
                      className={`group flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] border-r border-[#1a1a1a] shrink-0 transition-colors ${
                        active ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#0078d4]" : "text-[#888] hover:bg-[#252526] hover:text-[#ccc]"
                      }`}
                    >
                      <FileIcon name={tab.name} />
                      {tab.name}
                      <span onClick={(e) => closeTab(tab.path, e)}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 text-[#666] hover:text-white transition-opacity">
                        <X className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Breadcrumb + actions */}
            {selected && (
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#1e1e1e] border-b border-[#222] text-[#858585] text-[11px] font-sans shrink-0">
                <span className="truncate">{selected.path}</span>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <button onClick={handleDownloadFile}
                    className="hover:text-[#ccc] transition-colors flex items-center gap-1" title="Download file">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button onClick={handleCopy}
                    className="hover:text-[#ccc] transition-colors flex items-center gap-1" title="Copy all">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Code view */}
            <div className="flex-1 overflow-auto">
              {!selected ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#555] font-sans select-none">
                  <FileCode className="w-14 h-14 opacity-15" />
                  <div className="text-center space-y-1">
                    <p className="text-sm">Select a file to view its source</p>
                    <p className="text-xs opacity-60">{fileCount} files available</p>
                  </div>
                  {/* Quick download whole project */}
                  <button
                    onClick={handleDownloadAll}
                    disabled={downloadingAll}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg border border-[#444] hover:border-[#0078d4] text-[#888] hover:text-white text-xs transition-all disabled:opacity-40"
                  >
                    {downloadingAll
                      ? <RefreshCw className="w-4 h-4 animate-spin" />
                      : <FolderDown className="w-4 h-4" />}
                    Download entire project as ZIP
                  </button>
                </div>
              ) : fileLoading ? (
                <div className="flex items-center justify-center h-full gap-2 text-[#555] font-sans text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : (
                <CodeViewer content={content} filename={selected.name} />
              )}
            </div>

            {/* Status bar */}
            <div className="h-6 bg-[#0078d4] flex items-center px-4 gap-4 text-[11px] text-white font-sans shrink-0 select-none">
              {selected ? (
                <>
                  <span>{ext || "TXT"}</span>
                  <span>Ln {content.split("\n").length}</span>
                  <span>{(content.length / 1024).toFixed(1)} KB</span>
                  <span className="text-white/60 truncate">{selected.path}</span>
                </>
              ) : (
                <span>SnapSave Hub · {fileCount} files ready</span>
              )}
              <span className="ml-auto opacity-70">UTF-8</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
