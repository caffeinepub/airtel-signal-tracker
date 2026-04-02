import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSpeedTest } from "../hooks/useSpeedTest";

type Verdict = "good" | "bad" | "untested";

function getDownloadVerdict(download: number | null, minMbps: number): Verdict {
  if (download === null) return "untested";
  return download >= minMbps ? "good" : "bad";
}

function getVideoCallVerdict(
  download: number | null,
  upload: number | null,
): Verdict {
  if (download === null || upload === null) return "untested";
  return download >= 1.5 && upload >= 1 ? "good" : "bad";
}

function getGamingVerdict(
  ping: number | null,
  download: number | null,
): Verdict {
  if (ping === null || download === null) return "untested";
  return ping <= 50 && download >= 1 ? "good" : "bad";
}

const verdictColors: Record<Verdict, string> = {
  good: "bg-signal-green/15 text-signal-green border border-signal-green/30",
  bad: "bg-destructive/10 text-destructive border border-destructive/20",
  untested: "bg-secondary text-muted-foreground border border-border",
};

const verdictIcons: Record<Verdict, string> = {
  good: "✅",
  bad: "❌",
  untested: "--",
};

interface StatBoxProps {
  label: string;
  value: number | null;
  unit: string;
  running: boolean;
}

function StatBox({ label, value, unit, running }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-white/5 rounded-xl p-3 min-w-0">
      <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
        {label}
      </span>
      <AnimatePresence mode="wait">
        {running ? (
          <motion.span
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}
            className="text-xl font-bold text-white"
          >
            …
          </motion.span>
        ) : value !== null ? (
          <motion.span
            key="value"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xl font-bold text-white"
          >
            {value}
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white/40"
          >
            --
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-xs text-white/50">{unit}</span>
    </div>
  );
}

export function SpeedTestBanner() {
  const { ping, download, upload, status, progress, run } = useSpeedTest();

  const isRunning = status === "running";

  const livestreamVerdict = getDownloadVerdict(download, 3);
  const videoCallVerdict = getVideoCallVerdict(download, upload);
  const gamingVerdict = getGamingVerdict(ping, download);

  const badges: { label: string; emoji: string; verdict: Verdict }[] = [
    { label: "Livestream", emoji: "📺", verdict: livestreamVerdict },
    { label: "Video Call", emoji: "📹", verdict: videoCallVerdict },
    { label: "Gaming", emoji: "🎮", verdict: gamingVerdict },
  ];

  return (
    <motion.div
      data-ocid="speedtest.card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-2 rounded-2xl overflow-hidden shadow-compass"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.04 240) 0%, oklch(0.18 0.03 250) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.46 0.22 24.5 / 0.25)" }}
          >
            <Zap
              className="w-4 h-4"
              style={{ color: "oklch(0.7 0.18 24.5)" }}
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm leading-tight">
              Network Speed Test
            </h2>
            <p className="text-white/50 text-xs">
              Tests your actual internet speed
            </p>
          </div>
        </div>
        <Button
          data-ocid="speedtest.run.button"
          disabled={isRunning}
          onClick={run}
          size="sm"
          className="text-xs font-bold h-8 px-4 rounded-full"
          style={{
            background: isRunning
              ? "oklch(0.35 0.04 240)"
              : "linear-gradient(135deg, oklch(0.5 0.24 24.5), oklch(0.38 0.2 24.5))",
            color: "white",
            border: "none",
          }}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Testing…
            </>
          ) : (
            "Run Test"
          )}
        </Button>
      </div>

      {/* Progress bar (only while running) */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <Progress
              data-ocid="speedtest.loading_state"
              value={progress}
              className="h-1.5"
              style={{ background: "oklch(0.35 0.04 240)" }}
            />
            <p className="text-white/40 text-xs mt-1">
              {progress < 25
                ? "Measuring ping…"
                : progress < 75
                  ? "Testing download…"
                  : "Testing upload…"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results grid */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <StatBox
          label="Ping"
          value={ping}
          unit="ms"
          running={isRunning && ping === null}
        />
        <StatBox
          label="Download"
          value={download}
          unit="Mbps"
          running={isRunning && download === null && progress >= 25}
        />
        <StatBox
          label="Upload"
          value={upload}
          unit="Mbps"
          running={isRunning && upload === null && progress >= 75}
        />
      </div>

      {/* Use-case verdict badges */}
      <div className="flex gap-2 px-4 pb-4">
        {badges.map(({ label, emoji, verdict }) => (
          <div
            key={label}
            data-ocid={`speedtest.${label.toLowerCase().replace(" ", "_")}.badge`}
            className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-semibold ${verdictColors[verdict]}`}
          >
            <span className="block text-base leading-tight">
              {verdict === "untested" ? emoji : verdictIcons[verdict]}
            </span>
            <span className="block">{label}</span>
          </div>
        ))}
      </div>

      {/* Explainer */}
      <div
        className="px-4 pb-3 text-center"
        style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}
      >
        <p className="text-white/35 text-xs pt-2">
          Check suitability for livestreaming, video calls &amp; gaming
        </p>
      </div>
    </motion.div>
  );
}
