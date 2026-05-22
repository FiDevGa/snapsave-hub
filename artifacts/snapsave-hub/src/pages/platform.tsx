import { useParams } from "wouter";
import { Downloader } from "@/components/downloader";
import { useListPlatforms } from "@workspace/api-client-react";
import {
  SiYoutube, SiTiktok, SiInstagram, SiX, SiSoundcloud, SiReddit,
  SiFacebook, SiVimeo, SiDailymotion, SiTwitch, SiKick, SiBilibili,
  SiPinterest, SiTumblr, SiSnapchat, SiThreads, SiVk, SiMixcloud,
  SiBandcamp, SiAudiomack, SiTed
} from "react-icons/si";
import { Download, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

function getPlatformIcon(id: string, className = "w-9 h-9") {
  const cls = `${className} text-white`;
  switch (id) {
    case "youtube": return <SiYoutube className={cls} />;
    case "tiktok": return <SiTiktok className={cls} />;
    case "instagram": return <SiInstagram className={cls} />;
    case "twitter": return <SiX className={cls} />;
    case "soundcloud": return <SiSoundcloud className={cls} />;
    case "reddit": return <SiReddit className={cls} />;
    case "facebook": return <SiFacebook className={cls} />;
    case "vimeo": return <SiVimeo className={cls} />;
    case "dailymotion": return <SiDailymotion className={cls} />;
    case "twitch": return <SiTwitch className={cls} />;
    case "kick": return <SiKick className={cls} />;
    case "bilibili": return <SiBilibili className={cls} />;
    case "pinterest": return <SiPinterest className={cls} />;
    case "tumblr": return <SiTumblr className={cls} />;
    case "snapchat": return <SiSnapchat className={`${className} text-black`} />;
    case "threads": return <SiThreads className={cls} />;
    case "vk": return <SiVk className={cls} />;
    case "mixcloud": return <SiMixcloud className={cls} />;
    case "bandcamp": return <SiBandcamp className={cls} />;
    case "audiomack": return <SiAudiomack className={cls} />;
    case "ted": return <SiTed className={cls} />;
    default: return <Download className={cls} />;
  }
}

// Per-platform gradient & secondary color overrides
const PLATFORM_META: Record<string, {
  gradient: string;
  secondaryColor: string;
  textColor: string;
  features: string[];
  example?: string;
  tagline: string;
}> = {
  youtube: {
    gradient: "linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #0d1117 100%)",
    secondaryColor: "#cc0000",
    textColor: "#ff4444",
    tagline: "Download YouTube videos in up to 8K quality as merged MP4",
    features: ["4K / 8K quality", "Shorts & Playlists", "Age-restricted (when logged in)"],
    example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  tiktok: {
    gradient: "linear-gradient(135deg, #000000 0%, #1a0010 40%, #0d1117 100%)",
    secondaryColor: "#fe2c55",
    textColor: "#fe2c55",
    tagline: "Download TikTok videos without watermark in HD",
    features: ["No watermark", "HD quality", "Music & sounds extraction"],
    example: "https://www.tiktok.com/@user/video/123",
  },
  instagram: {
    gradient: "linear-gradient(135deg, #1a0020 0%, #2d0040 30%, #1a0015 60%, #0d1117 100%)",
    secondaryColor: "#c13584",
    textColor: "#e1306c",
    tagline: "Download Instagram Reels, Stories and Posts in HD",
    features: ["Reels & Stories", "HD quality", "Carousel posts"],
    example: "https://www.instagram.com/reel/ABC123/",
  },
  twitter: {
    gradient: "linear-gradient(135deg, #001a2d 0%, #002d4a 40%, #0d1117 100%)",
    secondaryColor: "#1565c0",
    textColor: "#1d9bf0",
    tagline: "Download Twitter/X videos and GIFs in high quality",
    features: ["Videos & GIFs", "HD quality", "Thread videos"],
    example: "https://x.com/user/status/123456",
  },
  facebook: {
    gradient: "linear-gradient(135deg, #001030 0%, #001a50 40%, #0d1117 100%)",
    secondaryColor: "#1565c0",
    textColor: "#1877f2",
    tagline: "Download Facebook videos and Reels in HD",
    features: ["Videos & Reels", "HD quality", "Public pages & groups"],
    example: "https://www.facebook.com/video/123",
  },
  reddit: {
    gradient: "linear-gradient(135deg, #1a0800 0%, #2d1000 40%, #0d1117 100%)",
    secondaryColor: "#cc3700",
    textColor: "#ff4500",
    tagline: "Download Reddit videos and GIFs with audio",
    features: ["Videos & GIFs", "Audio merged", "Cross-posts"],
    example: "https://www.reddit.com/r/videos/comments/abc/",
  },
  soundcloud: {
    gradient: "linear-gradient(135deg, #1a0b00 0%, #2d1400 40%, #0d1117 100%)",
    secondaryColor: "#cc4400",
    textColor: "#ff5500",
    tagline: "Download SoundCloud tracks as high-quality MP3",
    features: ["MP3 extraction", "192kbps quality", "Playlists supported"],
    example: "https://soundcloud.com/artist/track",
  },
  twitch: {
    gradient: "linear-gradient(135deg, #0d0020 0%, #1a0040 40%, #0d1117 100%)",
    secondaryColor: "#6c30d4",
    textColor: "#9146ff",
    tagline: "Download Twitch VODs and clips in full quality",
    features: ["VODs & Clips", "HD quality", "Fast download"],
    example: "https://www.twitch.tv/videos/123456",
  },
  kick: {
    gradient: "linear-gradient(135deg, #001a00 0%, #002d00 40%, #0d1117 100%)",
    secondaryColor: "#3ab810",
    textColor: "#53fc18",
    tagline: "Download Kick streams and clips in HD",
    features: ["VODs & Clips", "HD quality", "Fast processing"],
    example: "https://kick.com/user/clip/123",
  },
  vimeo: {
    gradient: "linear-gradient(135deg, #001a20 0%, #002d38 40%, #0d1117 100%)",
    secondaryColor: "#1295a8",
    textColor: "#1ab7ea",
    tagline: "Download Vimeo videos in up to 4K quality",
    features: ["Up to 4K", "Private links", "All formats"],
    example: "https://vimeo.com/123456789",
  },
  bilibili: {
    gradient: "linear-gradient(135deg, #001a25 0%, #002d40 40%, #0d1117 100%)",
    secondaryColor: "#0080b0",
    textColor: "#00a1d6",
    tagline: "Download Bilibili videos in high quality",
    features: ["HD quality", "Subtitles support", "Multi-part videos"],
    example: "https://www.bilibili.com/video/BV1xx411c7mD",
  },
  pinterest: {
    gradient: "linear-gradient(135deg, #1a0000 0%, #2d0000 40%, #0d1117 100%)",
    secondaryColor: "#b00018",
    textColor: "#e60023",
    tagline: "Download Pinterest videos and GIFs",
    features: ["Videos & GIFs", "HD quality", "Pin collections"],
    example: "https://www.pinterest.com/pin/123456",
  },
  snapchat: {
    gradient: "linear-gradient(135deg, #1a1a00 0%, #2a2a00 40%, #0d1117 100%)",
    secondaryColor: "#ccca00",
    textColor: "#fffc00",
    tagline: "Download Snapchat stories and spotlights",
    features: ["Stories & Spotlights", "HD quality", "Public content"],
    example: "https://www.snapchat.com/spotlight/123",
  },
  default: {
    gradient: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
    secondaryColor: "#555",
    textColor: "#888",
    tagline: "Download videos and audio in high quality",
    features: ["HD quality", "Fast download", "Free forever"],
  },
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function PlatformPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const { data: platforms = [] } = useListPlatforms();
  const platform = platforms.find((p) => p.id === platformId);

  if (!platform) {
    return (
      <div className="flex items-center justify-center min-h-64 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  const meta = PLATFORM_META[platform.id] ?? PLATFORM_META.default;
  const accentRgb = hexToRgb(platform.color);

  return (
    <div className="space-y-5 pb-16 max-w-[1300px] mx-auto">
      {/* Back */}
      <Link href="/">
        <div
          className="inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer mb-1"
          style={{ color: meta.textColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          All platforms
        </div>
      </Link>

      {/* Platform hero banner */}
      <div
        className="relative rounded-2xl overflow-hidden border p-7 md:p-10"
        style={{
          background: meta.gradient,
          borderColor: `rgba(${accentRgb}, 0.25)`,
        }}
      >
        {/* Glow top-left */}
        <div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: platform.color }}
        />
        {/* Glow bottom-right */}
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-15 pointer-events-none"
          style={{ background: meta.secondaryColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: icon + title */}
          <div className="flex items-center gap-5">
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-xl shrink-0 p-4"
              style={{
                background: platform.id === "snapchat" ? "#fffc00" : platform.color,
                boxShadow: `0 0 40px rgba(${accentRgb}, 0.5)`,
              }}
            >
              {getPlatformIcon(platform.id, "w-10 h-10")}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {platform.name}{" "}
                <span style={{ color: meta.textColor }}>Downloader</span>
              </h1>
              <p className="text-sm text-white/60 mt-1.5 max-w-md">{meta.tagline}</p>
            </div>
          </div>

          {/* Right: features */}
          <div className="flex flex-col gap-2 shrink-0">
            {meta.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: meta.textColor }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Downloader */}
      <div
        className="rounded-2xl border p-5 md:p-7"
        style={{
          background: `rgba(${accentRgb}, 0.03)`,
          borderColor: `rgba(${accentRgb}, 0.15)`,
        }}
      >
        <Downloader
          platformFilter={platform.id}
          exampleUrl={meta.example}
          accentColor={platform.color}
        />
      </div>
    </div>
  );
}
