import { Router, type IRouter } from "express";
import { detectPlatform } from "../lib/ytdlp";

const router: IRouter = Router();

const PLATFORMS = [
  // Video Platforms
  { id: "youtube", name: "YouTube", category: "video", color: "#FF0000", domains: ["youtube.com", "youtu.be"], supportsAudio: true, supportsVideo: true },
  { id: "vimeo", name: "Vimeo", category: "video", color: "#1AB7EA", domains: ["vimeo.com"], supportsAudio: true, supportsVideo: true },
  { id: "dailymotion", name: "Dailymotion", category: "video", color: "#0066DC", domains: ["dailymotion.com"], supportsAudio: true, supportsVideo: true },
  { id: "bilibili", name: "Bilibili", category: "video", color: "#00A1D6", domains: ["bilibili.com"], supportsAudio: true, supportsVideo: true },
  { id: "streamable", name: "Streamable", category: "video", color: "#1D262F", domains: ["streamable.com"], supportsAudio: true, supportsVideo: true },
  { id: "rutube", name: "Rutube", category: "video", color: "#1A1A2E", domains: ["rutube.ru"], supportsAudio: true, supportsVideo: true },
  { id: "ted", name: "TED", category: "video", color: "#E62B1E", domains: ["ted.com"], supportsAudio: true, supportsVideo: true },
  // Social Media
  { id: "tiktok", name: "TikTok", category: "social", color: "#010101", domains: ["tiktok.com"], supportsAudio: true, supportsVideo: true },
  { id: "instagram", name: "Instagram", category: "social", color: "#E1306C", domains: ["instagram.com"], supportsAudio: true, supportsVideo: true },
  { id: "twitter", name: "Twitter/X", category: "social", color: "#1DA1F2", domains: ["twitter.com", "x.com"], supportsAudio: true, supportsVideo: true },
  { id: "facebook", name: "Facebook", category: "social", color: "#1877F2", domains: ["facebook.com", "fb.watch"], supportsAudio: true, supportsVideo: true },
  { id: "reddit", name: "Reddit", category: "social", color: "#FF4500", domains: ["reddit.com"], supportsAudio: true, supportsVideo: true },
  { id: "pinterest", name: "Pinterest", category: "social", color: "#E60023", domains: ["pinterest.com"], supportsAudio: false, supportsVideo: true },
  { id: "tumblr", name: "Tumblr", category: "social", color: "#35465C", domains: ["tumblr.com"], supportsAudio: true, supportsVideo: true },
  { id: "snapchat", name: "Snapchat", category: "social", color: "#FFFC00", domains: ["snapchat.com"], supportsAudio: true, supportsVideo: true },
  { id: "threads", name: "Threads", category: "social", color: "#000000", domains: ["threads.net"], supportsAudio: true, supportsVideo: true },
  { id: "vk", name: "VK", category: "social", color: "#4A76A8", domains: ["vk.com"], supportsAudio: true, supportsVideo: true },
  // Music & Audio
  { id: "soundcloud", name: "SoundCloud", category: "music", color: "#FF5500", domains: ["soundcloud.com"], supportsAudio: true, supportsVideo: false },
  { id: "mixcloud", name: "Mixcloud", category: "music", color: "#52AAD8", domains: ["mixcloud.com"], supportsAudio: true, supportsVideo: false },
  { id: "bandcamp", name: "Bandcamp", category: "music", color: "#1DA0C3", domains: ["bandcamp.com"], supportsAudio: true, supportsVideo: false },
  { id: "audiomack", name: "Audiomack", category: "music", color: "#FFA200", domains: ["audiomack.com"], supportsAudio: true, supportsVideo: false },
  // Streaming
  { id: "twitch", name: "Twitch", category: "streaming", color: "#9146FF", domains: ["twitch.tv"], supportsAudio: true, supportsVideo: true },
  { id: "kick", name: "Kick", category: "streaming", color: "#53FC18", domains: ["kick.com"], supportsAudio: true, supportsVideo: true },
];

router.get("/platforms", async (_req, res): Promise<void> => {
  res.json(PLATFORMS);
});

export { PLATFORMS };
export default router;
