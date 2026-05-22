import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground dark">
      {/* Desktop sidebar */}
      <AnimatePresence initial={false}>
        {!desktopCollapsed && (
          <motion.div
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden md:block h-screen sticky top-0 left-0 overflow-hidden flex-shrink-0"
            style={{ minWidth: 0 }}
          >
            <Sidebar
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              desktopOnly
              onCollapse={() => setDesktopCollapsed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-13 border-b border-border/40 flex items-center px-5 gap-3 bg-sidebar/90 backdrop-blur-md sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            title={desktopCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            {desktopCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <span className="font-bold text-base text-primary md:hidden tracking-tight">SnapSave Hub</span>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} mobileOnly />
    </div>
  );
}
