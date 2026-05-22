import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Code, Zap, Shield } from "lucide-react";

export function About() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">About SnapSave Hub</h1>
        <p className="text-xl text-muted-foreground">The only media downloader you'll ever need.</p>
      </div>

      <div className="prose prose-invert max-w-none">
        <p>
          SnapSave Hub was built out of frustration. We were tired of ad-filled, slow, and unreliable downloaders that only worked for one platform. We wanted a tool that just worked, everywhere, instantly.
        </p>
        <p>
          So we built it. SnapSave Hub is a universal media downloader that supports over 1000+ websites, extracting the highest quality video and audio available.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <Card className="bg-card/50">
          <CardContent className="p-6 space-y-2">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm">Direct extraction and download streams mean zero waiting in queues.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-6 space-y-2">
            <Shield className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">100% Secure</h3>
            <p className="text-muted-foreground text-sm">No ads, no tracking, no malware. Just clean, raw files.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-6 space-y-2">
            <Download className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Highest Quality</h3>
            <p className="text-muted-foreground text-sm">Automatically fetches the best available resolution up to 4K.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-6 space-y-2">
            <Code className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold">Developer API</h3>
            <p className="text-muted-foreground text-sm">Built on a robust API that powers the entire experience.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-6 rounded-lg bg-primary/10 border border-primary/20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Built for the community</h2>
        <p className="text-muted-foreground">SnapSave Hub will always remain free to use.</p>
        <div className="pt-4">
          <Badge variant="outline" className="text-primary border-primary/50">v1.0.0</Badge>
        </div>
      </div>
    </div>
  );
}
