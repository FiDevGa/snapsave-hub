import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

const YT_DLP_PATHS = [
  "/home/runner/.local/bin/yt-dlp-new",  // latest standalone binary (no Python needed)
  "/home/runner/.local/bin/yt-dlp",
  "/home/runner/.nix-profile/bin/yt-dlp",
  "/root/.nix-profile/bin/yt-dlp",
  "/nix/var/nix/profiles/default/bin/yt-dlp",
  "/usr/local/bin/yt-dlp",
  "/usr/bin/yt-dlp",
];

const FFMPEG_PATHS = [
  "/nix/store/29bwm71lzx4b0my95bm494crhnsakj5x-replit-runtime-path/bin/ffmpeg",
  "/usr/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
];

export function getYtDlpPath(): string {
  for (const p of YT_DLP_PATHS) {
    if (existsSync(p)) return p;
  }
  return "yt-dlp";
}

export function getFfmpegPath(): string | null {
  for (const p of FFMPEG_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export const DOWNLOAD_DIR = "/tmp/snapsave-downloads";

export interface YtDlpFormat {
  formatId: string;
  ext: string;
  quality: string;
  filesize: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
  fps: number | null;
  width: number | null;
  height: number | null;
}

export interface YtDlpInfo {
  url: string;
  platform: string;
  platformId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  uploadDate: string | null;
  viewCount: number | null;
  formats: YtDlpFormat[];
}

export function detectPlatform(url: string): { platform: string; platformId: string } {
  const platformMap: Array<[RegExp, string, string]> = [
    [/youtube\.com|youtu\.be/, "YouTube", "youtube"],
    [/tiktok\.com/, "TikTok", "tiktok"],
    [/instagram\.com/, "Instagram", "instagram"],
    [/twitter\.com|x\.com/, "Twitter/X", "twitter"],
    [/facebook\.com|fb\.watch/, "Facebook", "facebook"],
    [/reddit\.com/, "Reddit", "reddit"],
    [/soundcloud\.com/, "SoundCloud", "soundcloud"],
    [/vimeo\.com/, "Vimeo", "vimeo"],
    [/dailymotion\.com/, "Dailymotion", "dailymotion"],
    [/twitch\.tv/, "Twitch", "twitch"],
    [/kick\.com/, "Kick", "kick"],
    [/bilibili\.com/, "Bilibili", "bilibili"],
    [/pinterest\.com/, "Pinterest", "pinterest"],
    [/tumblr\.com/, "Tumblr", "tumblr"],
    [/mixcloud\.com/, "Mixcloud", "mixcloud"],
    [/bandcamp\.com/, "Bandcamp", "bandcamp"],
    [/audiomack\.com/, "Audiomack", "audiomack"],
    [/streamable\.com/, "Streamable", "streamable"],
    [/vk\.com/, "VK", "vk"],
    [/ted\.com/, "TED", "ted"],
    [/snapchat\.com/, "Snapchat", "snapchat"],
    [/threads\.net/, "Threads", "threads"],
    [/rutube\.ru/, "Rutube", "rutube"],
  ];

  for (const [pattern, name, id] of platformMap) {
    if (pattern.test(url)) return { platform: name, platformId: id };
  }
  return { platform: "Other", platformId: "other" };
}

export async function getMediaInfo(url: string): Promise<YtDlpInfo> {
  const ytDlp = getYtDlpPath();
  const ffmpeg = getFfmpegPath();

  const args = ["--dump-json", "--no-playlist", "--no-warnings"];
  if (ffmpeg) args.push("--ffmpeg-location", ffmpeg);
  args.push(url);

  const { stdout } = await execFileAsync(ytDlp, args, { timeout: 30000 });

  const info = JSON.parse(stdout);
  const { platform, platformId } = detectPlatform(url);

  const formats: YtDlpFormat[] = (info.formats || [])
    .filter((f: any) => f.vcodec !== "none" || f.acodec !== "none")
    .map((f: any) => ({
      formatId: String(f.format_id),
      ext: f.ext || "mp4",
      quality: f.format_note || f.quality || String(f.height || ""),
      filesize: f.filesize || f.filesize_approx || null,
      hasAudio: f.acodec !== "none" && !!f.acodec,
      hasVideo: f.vcodec !== "none" && !!f.vcodec,
      fps: f.fps || null,
      width: f.width || null,
      height: f.height || null,
    }))
    .slice(0, 20);

  return {
    url,
    platform: info.extractor_key || platform,
    platformId,
    title: info.title || "Unknown",
    description: info.description || null,
    thumbnail: info.thumbnail || null,
    duration: info.duration || null,
    uploader: info.uploader || info.channel || null,
    uploadDate: info.upload_date || null,
    viewCount: info.view_count || null,
    formats,
  };
}

// Maps user-selected quality label to max height for yt-dlp format selection
function qualityToHeight(quality: string | null | undefined): number | null {
  switch (quality?.toLowerCase()) {
    case "360p": return 360;
    case "480p": return 480;
    case "720p": return 720;
    case "1080p": return 1080;
    case "2k": return 1440;
    case "4k": return 2160;
    default: return null; // best/max
  }
}

function buildMp4FormatString(quality: string | null | undefined): string {
  const height = qualityToHeight(quality);
  const ffmpeg = getFfmpegPath();

  if (!ffmpeg) {
    // No ffmpeg → can only download pre-merged streams
    if (height) return `best[height<=${height}][ext=mp4]/best[height<=${height}]/best`;
    return "best[ext=mp4]/best";
  }

  if (height) {
    return `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
  }
  return "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";
}

export async function downloadMedia(
  url: string,
  type: "mp4" | "mp3" | "videoonly",
  outputDir: string,
  quality?: string | null,
  formatId?: string | null,
  onProgress?: (progress: number) => void
): Promise<{ filename: string; filepath: string; filesize: number }> {
  const ytDlp = getYtDlpPath();
  const ffmpeg = getFfmpegPath();
  const { mkdirSync } = await import("fs");
  mkdirSync(outputDir, { recursive: true });

  const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");
  const args: string[] = ["--no-playlist", "--no-warnings", "-o", outputTemplate];

  if (ffmpeg) args.push("--ffmpeg-location", ffmpeg);

  if (type === "mp3") {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else if (type === "videoonly") {
    const height = qualityToHeight(quality);
    if (height) {
      args.push("-f", `bestvideo[height<=${height}][ext=mp4]/bestvideo[height<=${height}]/bestvideo`);
    } else {
      args.push("-f", "bestvideo[ext=mp4]/bestvideo");
    }
  } else {
    // mp4 — merged video+audio
    if (formatId) {
      args.push("-f", formatId);
    } else {
      args.push("-f", buildMp4FormatString(quality));
      if (ffmpeg) args.push("--merge-output-format", "mp4");
    }
  }

  args.push("--newline", "--progress", url);

  return new Promise((resolve, reject) => {
    const { spawn } = require("child_process");
    const proc = spawn(ytDlp, args, { stdio: ["ignore", "pipe", "pipe"] });

    let lastFilename = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      const line = data.toString();
      const destMatch = line.match(/\[download\] Destination: (.+)/);
      if (destMatch) lastFilename = destMatch[1].trim();
      const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/);
      if (mergeMatch) lastFilename = mergeMatch[1].trim();
      const alreadyMatch = line.match(/\[download\] (.+) has already been downloaded/);
      if (alreadyMatch) lastFilename = alreadyMatch[1].trim();
      const progressMatch = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
      if (progressMatch && onProgress) {
        onProgress(parseFloat(progressMatch[1]));
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", async (code: number) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed: ${stderr || "unknown error"}`));
        return;
      }

      if (!lastFilename) {
        // Try to find any file in outputDir as fallback
        const { readdirSync } = await import("fs");
        try {
          const files = readdirSync(outputDir).filter(f => !f.endsWith(".part"));
          if (files.length > 0) {
            lastFilename = path.join(outputDir, files[0]);
          } else {
            reject(new Error("Could not determine output filename"));
            return;
          }
        } catch {
          reject(new Error("Could not determine output filename"));
          return;
        }
      }

      const { statSync } = await import("fs");
      try {
        const stat = statSync(lastFilename);
        resolve({
          filename: path.basename(lastFilename),
          filepath: lastFilename,
          filesize: stat.size,
        });
      } catch {
        reject(new Error("Output file not found after download"));
      }
    });

    proc.on("error", (err: Error) => reject(err));
  });
}
