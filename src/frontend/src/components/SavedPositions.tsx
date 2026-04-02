import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, MapPin, QrCode, Share2, Signal, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { SignalPosition } from "../backend.d";
import { getSignalQuality } from "../utils/geo";

interface SavedPositionsProps {
  positions: SignalPosition[];
  onClear: () => void;
  isClearing: boolean;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts);
  if (ms === 0) return "Unknown time";
  const d = new Date(ms);
  return d.toLocaleString("en-UG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildShareText(pos: SignalPosition): string {
  return `Best Airtel signal at ${pos.latitude.toFixed(4)},${pos.longitude.toFixed(4)} — ${Number(pos.rssiDbm)} dBm, bearing ${pos.compassHeading.toFixed(0)}°, mount ${Number(pos.heightRecommendation)}m`;
}

function buildMapsUrl(pos: SignalPosition): string {
  return `https://maps.google.com/?q=${pos.latitude.toFixed(6)},${pos.longitude.toFixed(6)}`;
}

async function sharePosition(pos: SignalPosition) {
  const text = buildShareText(pos);
  if (navigator.share) {
    try {
      await navigator.share({ text });
      toast.success("Shared!");
      return;
    } catch {
      // Fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Unable to share");
  }
}

export function SavedPositions({
  positions,
  onClear,
  isClearing,
}: SavedPositionsProps) {
  if (positions.length === 0) {
    return (
      <div
        data-ocid="saved.empty_state"
        className="text-center py-8 text-muted-foreground"
      >
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No saved positions yet</p>
        <p className="text-xs mt-1">
          Use "Save Position" to record optimal signal spots
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="saved.list">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-foreground">
          {positions.length} Saved Position{positions.length !== 1 ? "s" : ""}
        </h4>
        <Button
          data-ocid="saved.clear.delete_button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isClearing}
          className="text-destructive hover:text-destructive text-xs h-7"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {positions
            .slice()
            .reverse()
            .map((pos, i) => {
              const rssi = Number(pos.rssiDbm);
              const quality = getSignalQuality(rssi);
              const qColors = {
                strong: "text-signal-green bg-signal-green/10",
                moderate: "text-signal-yellow bg-signal-yellow/10",
                weak: "text-primary bg-primary/10",
              };
              const mapsUrl = buildMapsUrl(pos);
              const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(mapsUrl)}`;

              return (
                <motion.div
                  key={String(pos.timestamp)}
                  data-ocid={`saved.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-card rounded-xl p-3 border border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Signal className="w-3 h-3" />
                            {Number(pos.rssiDbm).toFixed(0)} dBm
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pos.compassHeading.toFixed(0)}°
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Number(pos.heightRecommendation)}m
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${qColors[quality]}`}
                      >
                        {quality === "strong"
                          ? "✅"
                          : quality === "moderate"
                            ? "⚠️"
                            : "❌"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(pos.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Share / QR row */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Button
                      data-ocid={`saved.share.button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => sharePosition(pos)}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          data-ocid={`saved.qr.open_modal_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        data-ocid={`saved.qr.dialog.${i + 1}`}
                        className="max-w-xs"
                      >
                        <DialogHeader>
                          <DialogTitle>Signal Position QR</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-3 py-2">
                          <img
                            src={qrSrc}
                            alt="QR code for signal position"
                            width={200}
                            height={200}
                            className="rounded-lg border border-border"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            Scan to open in Google Maps
                          </p>
                          <p className="text-xs font-mono text-foreground text-center break-all">
                            {pos.latitude.toFixed(5)},{" "}
                            {pos.longitude.toFixed(5)}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
