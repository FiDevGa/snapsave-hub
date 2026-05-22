import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { getMediaInfo, downloadMedia, DOWNLOAD_DIR, detectPlatform } from "../lib/ytdlp";
import { GetDownloadStatusParams, StartDownloadBody } from "@workspace/api-zod";
import { db, downloadsTable } from "@workspace/db";

const router: IRouter = Router();

interface Job {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  url: string;
  type: "mp4" | "mp3";
  title: string | null;
  platform: string | null;
  thumbnail: string | null;
  progress: number | null;
  error: string | null;
  filename: string | null;
  filesize: number | null;
  filepath: string | null;
  createdAt: string;
}

const jobs = new Map<string, Job>();

router.post("/download/info", async (req, res): Promise<void> => {
  const { url } = req.body as { url: string };
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  try {
    const info = await getMediaInfo(url);
    res.json(info);
  } catch (err: any) {
    req.log.error({ err }, "Failed to get media info");
    res.status(422).json({ error: err?.message || "Failed to extract media info. Check the URL and try again." });
  }
});

router.post("/download/start", async (req, res): Promise<void> => {
  const parsed = StartDownloadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, type, formatId, quality, title, platform, thumbnail } = parsed.data;
  const jobId = randomUUID();
  const jobDir = path.join(DOWNLOAD_DIR, jobId);

  const job: Job = {
    jobId,
    status: "pending",
    url,
    type,
    title: title ?? null,
    platform: platform ?? detectPlatform(url).platform,
    thumbnail: thumbnail ?? null,
    progress: 0,
    error: null,
    filename: null,
    filesize: null,
    filepath: null,
    createdAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);

  // kick off async
  setImmediate(async () => {
    job.status = "processing";
    try {
      const result = await downloadMedia(url, type, jobDir, quality ?? null, formatId ?? null, (progress) => {
        job.progress = progress;
      });
      job.status = "completed";
      job.filename = result.filename;
      job.filepath = result.filepath;
      job.filesize = result.filesize;
      job.progress = 100;

      // Save to history
      await db.insert(downloadsTable).values({
        url,
        type,
        platform: job.platform ?? "unknown",
        title: job.title ?? result.filename,
        thumbnail: thumbnail ?? null,
        filesize: result.filesize,
        favorited: false,
      });
    } catch (err: any) {
      job.status = "failed";
      job.error = err?.message || "Download failed";
    }
  });

  res.status(202).json(toJobResponse(job));
});

router.get("/download/:jobId/status", async (req, res): Promise<void> => {
  const params = GetDownloadStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  const job = jobs.get(params.data.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(toJobResponse(job));
});

router.get("/download/:jobId/file", async (req, res): Promise<void> => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const job = jobs.get(jobId);

  if (!job || job.status !== "completed" || !job.filepath) {
    res.status(404).json({ error: "File not ready or not found" });
    return;
  }

  if (!fs.existsSync(job.filepath)) {
    res.status(404).json({ error: "File no longer available" });
    return;
  }

  res.download(job.filepath, job.filename ?? "download", (err) => {
    if (err) req.log.error({ err }, "Error sending file");
  });
});

function toJobResponse(job: Job) {
  return {
    jobId: job.jobId,
    status: job.status,
    url: job.url,
    type: job.type,
    title: job.title,
    platform: job.platform,
    thumbnail: job.thumbnail,
    progress: job.progress,
    error: job.error,
    filename: job.filename,
    filesize: job.filesize,
    createdAt: job.createdAt,
  };
}

export default router;
