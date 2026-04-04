import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type NavigatorWithWakeLock = Navigator & {
  wakeLock: { request: (type: string) => Promise<WakeLockSentinel> };
};

export function ScreenBrightnessOptimizer() {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      setWakeLockActive(false);
      toast.info("Screen lock released");
    } else {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (
            navigator as NavigatorWithWakeLock
          ).wakeLock.request("screen");
          setWakeLockActive(true);
          toast.success("☀️ Screen will stay on");
        } else {
          toast.error("Screen Wake Lock not supported on this device");
        }
      } catch {
        toast.error("Could not lock screen");
      }
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center gap-4">
      <Sun className="w-5 h-5 text-yellow-500 shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">Screen Stay-Awake</p>
        <p className="text-[10px] text-muted-foreground">
          Prevents screen sleeping during installation
        </p>
      </div>
      <Button
        size="sm"
        variant={wakeLockActive ? "default" : "outline"}
        className={`h-8 text-xs shrink-0 ${wakeLockActive ? "btn-airtel" : ""}`}
        onClick={toggleWakeLock}
        data-ocid="screen_lock.toggle.button"
      >
        {wakeLockActive ? "ON" : "OFF"}
      </Button>
      <Badge
        className={`text-[10px] border shrink-0 ${wakeLockActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-secondary text-muted-foreground"}`}
      >
        {wakeLockActive ? "Active" : "Inactive"}
      </Badge>
    </div>
  );
}
