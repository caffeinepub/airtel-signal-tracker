import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Copy, ExternalLink, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const TIPS = [
  {
    id: "channel",
    icon: "📡",
    text: "Change WiFi channel to 1, 6, or 11 to reduce congestion",
  },
  {
    id: "reboot",
    icon: "🔄",
    text: "Reboot your router monthly to clear memory and refresh connection",
  },
  {
    id: "qos",
    icon: "🎯",
    text: "Enable QoS in router settings to prioritise video and game traffic",
  },
  {
    id: "position",
    icon: "📶",
    text: "Move router to a central elevated position, away from thick walls",
  },
];

const DNS_OPTIONS = [
  {
    name: "Cloudflare",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    badge: "Fastest",
    color: "text-orange-400",
  },
  {
    name: "Google",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    badge: "Reliable",
    color: "text-blue-400",
  },
];

export function WifiStabilizer() {
  const [open, setOpen] = useState(false);
  const [ip, setIp] = useState("192.168.1.1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleOpenRouter() {
    const url = `http://${ip || "192.168.1.1"}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyDns(dns: string) {
    navigator.clipboard
      .writeText(dns)
      .then(() => toast.success(`Copied ${dns} to clipboard`))
      .catch(() => toast.error(`Copy failed — paste manually: ${dns}`));
  }

  return (
    <motion.div
      data-ocid="stabilizer.card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mx-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden"
    >
      {/* Collapsible header */}
      <button
        type="button"
        data-ocid="stabilizer.toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <span className="font-bold text-sm text-foreground block leading-tight">
              WiFi Stabilizer
            </span>
            <span className="text-xs text-muted-foreground">
              Admin access &amp; stability tips
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-5"
              style={{ borderTop: "1px solid oklch(var(--border))" }}
            >
              {/* Router Admin Access */}
              <section className="pt-4 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>🔐</span> Router Admin Access
                </h3>
                <p className="text-xs text-muted-foreground">
                  Open your router&apos;s admin panel to apply stability fixes.
                  Credentials are not sent anywhere.
                </p>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="router-ip"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Router IP Address
                    </Label>
                    <Input
                      id="router-ip"
                      data-ocid="stabilizer.router_ip.input"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      placeholder="192.168.1.1"
                      className="h-10 text-sm"
                      type="text"
                      inputMode="url"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="router-user"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Username
                    </Label>
                    <Input
                      id="router-user"
                      data-ocid="stabilizer.username.input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="h-10 text-sm"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="router-pass"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Password
                    </Label>
                    <Input
                      id="router-pass"
                      data-ocid="stabilizer.password.input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      type="password"
                      className="h-10 text-sm"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  data-ocid="stabilizer.open_router.button"
                  onClick={handleOpenRouter}
                  className="w-full h-11 font-semibold text-sm btn-airtel rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Router Admin Panel
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  💡 Most routers use{" "}
                  <span className="font-mono font-semibold">192.168.1.1</span>{" "}
                  or{" "}
                  <span className="font-mono font-semibold">192.168.0.1</span>
                </p>
              </section>

              {/* Quick Stability Tips */}
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>⚡</span> Quick Stability Tips
                </h3>
                <ul className="space-y-2">
                  {TIPS.map((tip, idx) => (
                    <li
                      key={tip.id}
                      data-ocid={`stabilizer.tip.item.${idx + 1}`}
                      className="flex items-start gap-2.5 bg-secondary/60 rounded-xl px-3 py-2.5"
                    >
                      <span className="text-base leading-tight mt-0.5">
                        {tip.icon}
                      </span>
                      <span className="text-xs text-foreground/80 leading-relaxed">
                        {tip.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommended DNS */}
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>🌐</span> Recommended DNS Servers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Set these in your router&apos;s DNS settings for faster, more
                  stable browsing.
                </p>
                <div className="space-y-2">
                  {DNS_OPTIONS.map((dns) => (
                    <div
                      key={dns.name}
                      className="flex items-center justify-between bg-secondary/60 rounded-xl px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <span
                            className={`text-xs font-bold ${dns.color} block leading-tight`}
                          >
                            {dns.name}
                            <span className="ml-1.5 text-xs font-normal bg-secondary rounded px-1 py-0.5 text-muted-foreground">
                              {dns.badge}
                            </span>
                          </span>
                          <span className="font-mono text-xs text-foreground">
                            {dns.primary} / {dns.secondary}
                          </span>
                        </div>
                      </div>
                      <Button
                        data-ocid={`stabilizer.${dns.name.toLowerCase()}_dns.button`}
                        variant="outline"
                        size="sm"
                        onClick={() => copyDns(dns.primary)}
                        className="h-8 px-3 text-xs gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
