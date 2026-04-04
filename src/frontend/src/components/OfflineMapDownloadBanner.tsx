import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function OfflineMapDownloadBanner() {
  const handleInstallPWA = () => {
    window.open(
      "https://support.google.com/chrome/answer/9658361",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Offline Map Access
        </h4>
      </div>
      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
            📱 Install as App (Recommended)
          </p>
          <p className="text-[10px] text-muted-foreground">
            Tap the browser menu (⋮) → “Add to Home Screen” or “Install App”.
            The app caches tower data for offline use.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs mt-2 border-blue-300 text-blue-700"
            onClick={handleInstallPWA}
            data-ocid="offline_map.install.button"
          >
            Learn How to Install
          </Button>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            🗺️ Save Map for Offline
          </p>
          <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open the Map tab while online</li>
            <li>Tap “Cache Map Tiles” button</li>
            <li>Map saves for 30-day offline use</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
