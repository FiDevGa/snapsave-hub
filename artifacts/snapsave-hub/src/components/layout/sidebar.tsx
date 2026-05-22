import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, History, Star, Settings, Code, Info, HelpCircle, Search, X, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useListPlatforms } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  SiYoutube, SiTiktok, SiInstagram, SiX, SiSoundcloud, SiReddit,
  SiFacebook, SiVimeo, SiDailymotion, SiTwitch, SiKick, SiBilibili,
  SiPinterest, SiTumblr, SiSnapchat, SiThreads, SiVk, SiMixcloud,
  SiBandcamp, SiAudiomack, SiTed
} from "react-icons/si";

function getPlatformIcon(platformId: string, className = "w-4 h-4") {
  switch (platformId) {
    case 'youtube': return <SiYoutube className={`${className} text-red-500`} />;
    case 'tiktok': return <SiTiktok className={`${className} text-white`} />;
    case 'instagram': return <SiInstagram className={`${className} text-pink-500`} />;
    case 'twitter': return <SiX className={`${className} text-sky-400`} />;
    case 'soundcloud': return <SiSoundcloud className={`${className} text-orange-500`} />;
    case 'reddit': return <SiReddit className={`${className} text-orange-600`} />;
    case 'facebook': return <SiFacebook className={`${className} text-blue-500`} />;
    case 'vimeo': return <SiVimeo className={`${className} text-cyan-400`} />;
    case 'dailymotion': return <SiDailymotion className={`${className} text-blue-400`} />;
    case 'twitch': return <SiTwitch className={`${className} text-purple-400`} />;
    case 'kick': return <SiKick className={`${className} text-green-400`} />;
    case 'bilibili': return <SiBilibili className={`${className} text-cyan-400`} />;
    case 'pinterest': return <SiPinterest className={`${className} text-red-500`} />;
    case 'tumblr': return <SiTumblr className={`${className} text-indigo-400`} />;
    case 'snapchat': return <SiSnapchat className={`${className} text-yellow-400`} />;
    case 'threads': return <SiThreads className={`${className} text-gray-200`} />;
    case 'vk': return <SiVk className={`${className} text-blue-400`} />;
    case 'mixcloud': return <SiMixcloud className={`${className} text-cyan-400`} />;
    case 'bandcamp': return <SiBandcamp className={`${className} text-teal-400`} />;
    case 'audiomack': return <SiAudiomack className={`${className} text-amber-400`} />;
    case 'ted': return <SiTed className={`${className} text-red-500`} />;
    default: return <Download className={`${className} text-primary`} />;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  video: "Video Platforms",
  social: "Social Media",
  music: "Music & Audio",
  streaming: "Streaming",
  other: "Other",
};

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ mobileOpen, setMobileOpen, desktopOnly, mobileOnly }: SidebarProps) {
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    video: true, social: true, music: false, streaming: false,
  });
  const { data: platforms = [] } = useListPlatforms();

  const filteredPlatforms = platforms.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped: Record<string, typeof platforms> = {};
  filteredPlatforms.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const navItem = (path: string, icon: React.ReactNode, label: string) => (
    <Link href={path}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer ${
        location === path
          ? 'bg-primary/15 text-primary border border-primary/20'
          : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
      }`}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border/50 w-64">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tighter no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <span>SnapSave</span>
        </Link>
        {mobileOnly && (
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search platforms..."
            className="pl-8 bg-white/5 border-white/10 text-sm h-8 focus-visible:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Main nav */}
        <div className="space-y-0.5 mb-4">
          {navItem('/', <Home className="w-4 h-4" />, 'Home / Download')}
          {navItem('/history', <History className="w-4 h-4" />, 'Recent Downloads')}
          {navItem('/favorites', <Star className="w-4 h-4" />, 'Favorites')}
        </div>

        <Separator className="bg-border/30 mb-3" />

        {/* Platform categories */}
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-2">
            <button
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              onClick={() => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
            >
              <span>{CATEGORY_LABELS[cat] || cat}</span>
              {expandedCats[cat] ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedCats[cat] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-1">
                    {items.map(platform => (
                      <Link key={platform.id} href={`/platform/${platform.id}`}>
                        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-sm cursor-pointer ${
                          location === `/platform/${platform.id}`
                            ? 'bg-primary/15 text-primary'
                            : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                        }`}>
                          {getPlatformIcon(platform.id)}
                          <span>{platform.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="pb-4" />
      </ScrollArea>

      <Separator className="bg-border/30" />

      {/* Bottom nav */}
      <div className="p-3 space-y-0.5">
        {navItem('/settings', <Settings className="w-4 h-4" />, 'Settings')}
        {navItem('/source-code', <Code className="w-4 h-4" />, 'Source Code')}
        {navItem('/about', <Info className="w-4 h-4" />, 'About')}
        {navItem('/support', <HelpCircle className="w-4 h-4" />, 'Support')}
      </div>
    </div>
  );

  if (desktopOnly) {
    return <div className="hidden md:block h-full">{sidebarContent}</div>;
  }

  if (mobileOnly) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-50 h-full shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
