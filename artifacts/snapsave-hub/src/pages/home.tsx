import { Downloader } from "@/components/downloader";
import { useGetStats, useListPlatforms } from "@workspace/api-client-react";
import { Download, Layers, Clock, Shield, Zap, Star, Music } from "lucide-react";
import { Link } from "wouter";
import {
  SiYoutube, SiTiktok, SiInstagram, SiX, SiSoundcloud, SiReddit,
  SiFacebook, SiVimeo, SiTwitch
} from "react-icons/si";

const FEATURE_BADGES = [
  { label: "Fast & Free", icon: Zap },
  { label: "No Sign-up", icon: Shield },
  { label: "Audio+Video Merged", icon: Music },
  { label: "Best quality", icon: Star },
  { label: "Instant stats", icon: Clock },
];

const WHAT_YOU_GET = [
  "Merged MP4 with audio + video",
  "Quality picker and fallback",
  "360p to 4K resolution",
  "MP3 audio extraction",
  "Title-based filenames",
];

const FEATURED_PLATFORMS = [
  { id: "youtube", name: "YouTube", color: "#ff0000", Icon: SiYoutube },
  { id: "tiktok", name: "TikTok", color: "#010101", Icon: SiTiktok },
  { id: "instagram", name: "Instagram", color: "#e1306c", Icon: SiInstagram },
  { id: "twitter", name: "Twitter / X", color: "#1d9bf0", Icon: SiX },
  { id: "facebook", name: "Facebook", color: "#1877f2", Icon: SiFacebook },
  { id: "reddit", name: "Reddit", color: "#ff4500", Icon: SiReddit },
  { id: "soundcloud", name: "SoundCloud", color: "#ff5500", Icon: SiSoundcloud },
  { id: "vimeo", name: "Vimeo", color: "#1ab7ea", Icon: SiVimeo },
  { id: "twitch", name: "Twitch", color: "#9146ff", Icon: SiTwitch },
];

export function Home() {
  const { data: stats } = useGetStats();
  const { data: platforms = [] } = useListPlatforms();

  return (
    <div className="space-y-10 pb-16">
      {/* Hero */}
      <section className="grid md:grid-cols-[1.4fr_1fr] gap-5 pt-6 md:pt-10">
        {/* Left hero card */}
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-[#0d1421] to-[#0a0e16] p-7 space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary">
            <Zap className="w-3.5 h-3.5" /> Best quality &bull; Audio+Video Merged
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-3">
              Download <span className="text-primary">Everything.</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              The fastest way to save videos from YouTube, TikTok, Instagram, and {platforms.length > 9 ? platforms.length - 9 : "9"}+ more platforms — always as a single merged MP4.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Layers, label: `${platforms.length || "20"}+ platforms` },
              { icon: Zap, label: "Up to 4K" },
              { icon: Clock, label: "Fast processing" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/4 rounded-xl border border-white/8 p-3 text-sm font-medium flex flex-col gap-1.5">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right "what you get" card */}
        <div className="rounded-2xl border border-white/8 bg-[#0a0e16] p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[11px]">What you get</span>
            <span className="text-xs bg-primary/15 text-primary border border-primary/25 rounded-full px-2.5 py-0.5 font-bold">Pro-style UI</span>
          </div>
          {WHAT_YOU_GET.map((item) => (
            <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 transition-colors">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Download className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main downloader */}
      <section className="rounded-2xl border border-white/8 bg-[#0a0e16] p-5 md:p-7">
        <Downloader exampleUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </section>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {FEATURE_BADGES.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-1.5 border border-white/10 bg-white/3 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground font-medium">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
          </div>
        ))}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Download, val: stats.totalDownloads.toLocaleString(), label: "Total Downloads", color: "text-primary" },
            { icon: Star, val: stats.totalFavorites.toLocaleString(), label: "Saved Favorites", color: "text-yellow-400" },
            { icon: Layers, val: platforms.length || stats.platformBreakdown.length, label: "Platforms", color: "text-blue-400" },
            { icon: Zap, val: "100%", label: "Free Forever", color: "text-green-400" },
          ].map(({ icon: Icon, val, label, color }) => (
            <div key={label} className="bg-[#0a0e16] border border-white/8 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center">
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="text-xl font-bold font-mono">{val}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Platform grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">Supported Platforms</h2>
          </div>
          <span className="text-sm text-muted-foreground">{platforms.length} platforms</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {FEATURED_PLATFORMS.map(({ id, name, color, Icon }) => (
            <Link key={id} href={`/platform/${id}`}>
              <div className="group flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-[#0a0e16] hover:border-white/20 hover:bg-white/4 transition-all cursor-pointer">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: color }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium truncate">{name}</span>
              </div>
            </Link>
          ))}
          {platforms.slice(9).map((p) => (
            <Link key={p.id} href={`/platform/${p.id}`}>
              <div className="group flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-[#0a0e16] hover:border-white/20 hover:bg-white/4 transition-all cursor-pointer">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: p.color }}
                >
                  <Download className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
