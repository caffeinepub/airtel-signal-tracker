import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HardDrive } from "lucide-react";

function estimateLocalStorageUsage(): { usedKB: number; pct: number } {
  let total = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      const val = localStorage.getItem(key) ?? "";
      total += key.length + val.length;
    }
  } catch {
    /* ignore */
  }
  const usedKB = Math.round((total * 2) / 1024); // UTF-16 = 2 bytes/char
  const maxKB = 5 * 1024; // 5MB typical limit
  const pct = Math.min(100, Math.round((usedKB / maxKB) * 100));
  return { usedKB, pct };
}

export function StorageHealthChecker() {
  const { usedKB, pct } = estimateLocalStorageUsage();
  const isWarning = pct > 80;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Storage Health</h4>
        <Badge
          className={`ml-auto text-[10px] border ${
            isWarning
              ? "bg-red-100 text-red-700 border-red-200"
              : "bg-emerald-100 text-emerald-700 border-emerald-200"
          }`}
        >
          {isWarning ? "⚠️ Nearly Full" : "✅ OK"}
        </Badge>
      </div>
      <Progress value={pct} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">
        {usedKB} KB used of ~5,120 KB ({pct}%)
      </p>
      {isWarning && (
        <p className="text-xs text-destructive mt-1">
          Storage nearly full — clear old data to prevent issues
        </p>
      )}
    </div>
  );
}
