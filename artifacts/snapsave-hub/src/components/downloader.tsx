import { useState, useRef } from "react";
import { useGetMediaInfo, useStartDownload, useGetDownloadStatus, DownloadInputType } from "@workspace/api-client-react";
import { getGetDownloadStatusQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Link as LinkIcon, Loader2, PlaySquare, Music, Film,
  AlertCircle, Clock, User, CheckCircle2, XCircle, RotateCcw, Zap
} from "lucide-react";

const QUALITIES = [
  { label: "360p", sub: "Low" },
  { label: "480p", sub: "SD" },
  { label: "720p", sub: "HD" },
  { label: "1080p", sub: "Full HD" },
  { label: "2K", sub: "Quad HD" },
  { label: "4K", sub: "Ultra" },
  { label: "MAX", sub: "Best" },
];

const MODES = [
  { id: "mp4", label: "Merged MP4", sub: "Video + Audio", icon: PlaySquare, type: DownloadInputType.mp4 },
  { id: "videoonly", label: "Video Only", sub: "No audio stream", icon: Film, type: DownloadInputType.mp4 },
  { id: "mp3", label: "Audio Only", sub: "MP3 format", icon: Music, type: DownloadInputType.mp3 },
];

function formatDuration(s: number | null) {
  if (!s) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  return `${m}:${String(ss).padStart(2,"0")}`;
}

function formatViews(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return `${parseInt(c.slice(0,2),16)}, ${parseInt(c.slice(2,4),16)}, ${parseInt(c.slice(4,6),16)}`;
}

export function Downloader({
  prefillUrl = "",
  platformFilter = null,
  exampleUrl,
  accentColor,
}: {
  prefillUrl?: string;
  platformFilter?: string | null;
  exampleUrl?: string;
  accentColor?: string;
}) {
  const [url, setUrl] = useState(prefillUrl);
  const [jobId, setJobId] = useState<string | null>(null);
  const [modeId, setModeId] = useState("mp4");
  const [qualityIdx, setQualityIdx] = useState(QUALITIES.length - 1);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const color = accentColor ?? "#e53535";
  const rgb = hexToRgb(color);
  // For text: bright colors like Snapchat yellow need dark text; default white
  const isLight = ["#fffc00","#53fc18"].includes(color.toLowerCase());
  const btnTextColor = isLight ? "#000" : "#fff";

  const getMediaInfo = useGetMediaInfo();
  const startDownload = useStartDownload();

  const { data: status } = useGetDownloadStatus(jobId || "", {
    query: {
      enabled: !!jobId,
      refetchInterval: (query) => {
        const s = query.state.data?.status;
        return (s === "completed" || s === "failed") ? false : 1500;
      },
      queryKey: getGetDownloadStatusQueryKey(jobId || ""),
    },
  });

  const handleGetInfo = () => {
    if (!url || getMediaInfo.isPending) return;
    setHasTriedFetch(true);
    getMediaInfo.mutate({ data: { url } });
  };

  const handleDownload = () => {
    if (!url) return;
    const info = getMediaInfo.data;
    const mode = MODES.find((m) => m.id === modeId)!;
    const q = QUALITIES[qualityIdx];
    startDownload.mutate({
      data: {
        url,
        type: mode.type,
        quality: modeId === "mp3" ? null : (q.label === "MAX" ? null : q.label.toLowerCase()),
        title: info?.title ?? null,
        platform: info?.platformId ?? null,
        thumbnail: info?.thumbnail ?? null,
      },
    }, {
      onSuccess: (data) => setJobId(data.jobId),
    });
  };

  const handleReset = () => {
    setUrl(""); setJobId(null); setHasTriedFetch(false);
    getMediaInfo.reset(); startDownload.reset();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const isDownloading = !!jobId && status?.status !== "completed" && status?.status !== "failed";
  const info = getMediaInfo.data;
  const selQ = QUALITIES[qualityIdx];
  const selMode = MODES.find(m => m.id === modeId)!;

  // Inline style helpers
  const accentBg = { background: color };
  const accentText = { color };
  const accentBorder = { borderColor: `rgba(${rgb}, 0.5)` };
  const accentBg10 = { background: `rgba(${rgb}, 0.1)` };
  const accentBg15 = { background: `rgba(${rgb}, 0.15)` };

  return (
    <div className="w-full space-y-5">
      {/* URL row */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            className="pl-10 h-12 text-sm font-mono bg-black/40 border-white/10 focus-visible:ring-1 placeholder:text-muted-foreground/40"
            style={{ "--tw-ring-color": color } as React.CSSProperties}
            placeholder="Paste the video URL here..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (jobId) setJobId(null);
              if (hasTriedFetch) { setHasTriedFetch(false); getMediaInfo.reset(); }
            }}
            disabled={isDownloading}
            onKeyDown={(e) => { if (e.key === "Enter") handleGetInfo(); }}
          />
        </div>
        <button
          onClick={handleGetInfo}
          disabled={!url || getMediaInfo.isPending || isDownloading}
          className="h-12 px-6 rounded-lg font-bold text-sm flex items-center gap-2 shrink-0 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ ...accentBg, color: btnTextColor }}
        >
          {getMediaInfo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" />Get Info</>}
        </button>
      </div>

      {/* Example URL */}
      {exampleUrl && !url && (
        <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5 -mt-1">
          <span>Example:</span>
          <button className="font-mono truncate max-w-xs hover:underline underline-offset-2 transition-colors" style={accentText} onClick={() => setUrl(exampleUrl)}>
            {exampleUrl}
          </button>
        </p>
      )}

      {/* Error */}
      <AnimatePresence>
        {getMediaInfo.isError && hasTriedFetch && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Could not fetch media info</div>
              <div className="text-xs opacity-75 mt-0.5">Make sure the URL is public and from a supported platform.</div>
            </div>
            <button onClick={() => { getMediaInfo.reset(); setHasTriedFetch(false); }}
              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 shrink-0">
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main two-column layout — always show right column, show left when we have info */}
      <div className="grid md:grid-cols-[1fr_1.45fr] gap-5">
        {/* LEFT: thumbnail + meta + format list */}
        <div className="space-y-3">
          {/* Thumbnail / placeholder */}
          <div className="rounded-xl overflow-hidden bg-black/30 border border-white/8 aspect-video relative">
            {info?.thumbnail ? (
              <>
                <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                {info.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                    {formatDuration(info.duration)}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: `rgba(${rgb},0.3)` }}>
                <Film className="w-12 h-12" />
                <span className="text-xs text-muted-foreground/40 text-center px-4">
                  {url ? "Click Get Info to preview\u2026" : "Paste a URL to get started"}
                </span>
              </div>
            )}
          </div>

          {/* Meta */}
          {info && (
            <div>
              <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1.5">{info.title}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {info.uploader && <span className="flex items-center gap-1"><User className="w-3 h-3" />{info.uploader}</span>}
                {info.viewCount && <span>{formatViews(info.viewCount)}</span>}
                {info.uploadDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{info.uploadDate}</span>}
              </div>
            </div>
          )}

          {/* Format list (left column quick-select) */}
          <div className="space-y-2">
            {MODES.map((m) => {
              const active = modeId === m.id;
              return (
                <button key={m.id} onClick={() => setModeId(m.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all text-left"
                  style={active
                    ? { ...accentBg10, ...accentBorder }
                    : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }
                  }>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={active ? accentBg15 : { background: "rgba(255,255,255,0.05)" }}>
                    <m.icon className="w-4 h-4" style={active ? accentText : { color: "#888" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-none mb-0.5" style={active ? accentText : {}}>{m.label}</div>
                    <div className="text-xs text-muted-foreground/60">{m.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: mode cards + quality + download */}
        <div className="space-y-5">
          {/* Mode cards */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Download Mode</div>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => {
                const active = modeId === m.id;
                return (
                  <button key={m.id} onClick={() => setModeId(m.id)}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all"
                    style={active
                      ? { ...accentBg10, ...accentBorder }
                      : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }
                    }>
                    <m.icon className="w-5 h-5" style={active ? accentText : { color: "#666" }} />
                    <div className="text-center">
                      <div className="text-xs font-bold leading-tight" style={active ? accentText : {}}>{m.label}</div>
                      <div className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">{m.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality slider */}
          {modeId !== "mp3" && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Quality</div>
              <div className="relative px-1.5">
                {/* Track */}
                <div className="h-1 bg-white/10 rounded-full relative mb-5">
                  <div className="h-1 rounded-full absolute left-0 top-0 transition-all"
                    style={{ width: `${(qualityIdx / (QUALITIES.length - 1)) * 100}%`, background: color }} />
                  {QUALITIES.map((_, i) => (
                    <button key={i} onClick={() => setQualityIdx(i)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
                      style={{ left: `${(i / (QUALITIES.length - 1)) * 100}%` }}>
                      <div className="w-3 h-3 rounded-full border-2 transition-all"
                        style={i <= qualityIdx
                          ? { background: color, borderColor: color, transform: i === qualityIdx ? "scale(1.3)" : "scale(1)" }
                          : { background: "#0d1117", borderColor: "rgba(255,255,255,0.25)" }
                        } />
                    </button>
                  ))}
                </div>
                {/* Labels */}
                <div className="flex justify-between -mt-2">
                  {QUALITIES.map((q, i) => (
                    <button key={q.label} onClick={() => setQualityIdx(i)}
                      className="flex flex-col items-center transition-colors"
                      style={i === qualityIdx ? accentText : { color: "rgba(255,255,255,0.35)" }}>
                      <span className="text-[11px] font-bold">{q.label}</span>
                      <span className="text-[9px]">{q.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Quality badge */}
              <div className="flex items-center justify-between mt-3 px-3.5 py-2.5 rounded-lg border"
                style={{ background: `rgba(${rgb},0.06)`, borderColor: `rgba(${rgb},0.15)` }}>
                <span className="text-sm font-bold" style={accentText}>
                  {selQ.label}{qualityIdx === QUALITIES.length - 1 ? " — Best" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selQ.sub === "Best" ? "Highest available resolution" : selQ.sub}
                </span>
              </div>
            </div>
          )}

          {/* Progress card */}
          <AnimatePresence>
            {jobId && status && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {status.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                    {status.status === "failed" && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    {(status.status === "pending" || status.status === "processing") && (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" style={accentText} />
                    )}
                    <span className="text-sm font-medium truncate">{status.title || "Downloading…"}</span>
                  </div>
                  <span className="text-sm font-mono font-bold shrink-0" style={accentText}>
                    {status.status === "completed" ? "100%" : `${Math.round(status.progress || 0)}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${status.status === "completed" ? 100 : (status.progress || 0)}%`,
                    background: color,
                  }} />
                </div>
                {status.status === "failed" && <p className="text-xs text-red-400">{status.error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download / Reset / Save buttons */}
          {!jobId ? (
            <button
              onClick={handleDownload}
              disabled={!info || startDownload.isPending}
              className="w-full h-13 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ ...accentBg, color: btnTextColor }}
            >
              {startDownload.isPending
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>
                    <Download className="w-5 h-5" />
                    Download {selMode.label}
                    {modeId !== "mp3" && <span className="opacity-70 ml-1 text-sm">· {selQ.label}</span>}
                  </>
              }
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleReset}
                className="flex-1 h-10 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#aaa" }}>
                <RotateCcw className="w-3.5 h-3.5" /> Download another
              </button>
              {status?.status === "completed" && (
                <a href={`/api/download/${jobId}/file`} download
                  className="flex-1 h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{ background: "#16a34a", color: "#fff" }}>
                  <Download className="w-4 h-4" /> Save File
                </a>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground/40 text-center">
            Click "Get Info" to preview metadata before downloading
          </p>
        </div>
      </div>
    </div>
  );
}
