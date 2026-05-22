import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your download preferences and application settings.</p>
      </div>

      <div className="space-y-8 mt-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <div className="text-sm text-muted-foreground">Force dark mode or use system preference</div>
            </div>
            <Select defaultValue="dark">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">Download Defaults</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default Video Quality</Label>
              <div className="text-sm text-muted-foreground">Preferred resolution when available</div>
            </div>
            <Select defaultValue="1080p">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4k">4K</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-fetch Info</Label>
              <div className="text-sm text-muted-foreground">Automatically get media info when pasting URL</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">History & Privacy</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save History</Label>
              <div className="text-sm text-muted-foreground">Keep a record of your downloaded files</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
