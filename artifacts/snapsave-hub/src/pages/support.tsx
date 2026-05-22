import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Twitter } from "lucide-react";

export function Support() {
  return (
    <div className="space-y-12 max-w-3xl">
      <div>
        <h1 className="text-4xl font-bold tracking-tighter mb-4">Support & FAQ</h1>
        <p className="text-xl text-muted-foreground">Everything you need to know about using SnapSave Hub.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Which platforms are supported?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              SnapSave Hub supports almost all major platforms including YouTube, TikTok, Instagram, Twitter/X, SoundCloud, Reddit, Facebook, Vimeo, and hundreds more. If it has a video or audio file, we can probably download it.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it really free?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, 100% free. No hidden fees, no premium tiers, no watermarks, and no download limits.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Where do my downloaded files go?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Files are saved to your device's default Downloads folder. On mobile devices, they may be saved to your Files app or Photos/Gallery depending on your OS and settings.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Why did my download fail?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Downloads can fail for a few reasons: the video might be private/restricted, the platform might have updated their systems (we fix these quickly), or the URL might be invalid. Try refreshing the page and pasting the link again.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="bg-card border border-border p-8 rounded-lg text-center space-y-6">
        <h2 className="text-2xl font-semibold">Still need help?</h2>
        <p className="text-muted-foreground">Reach out to our support team. We usually respond within 24 hours.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" /> Email Support
          </Button>
          <Button variant="outline" className="gap-2">
            <Twitter className="w-4 h-4" /> DM on Twitter
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Join Discord
          </Button>
        </div>
      </section>
    </div>
  );
}
