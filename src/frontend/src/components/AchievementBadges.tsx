import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

const OPEN_DATES_KEY = "app_open_dates";

interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  check: () => boolean;
}

function trackOpenDate() {
  const today = new Date().toDateString();
  try {
    const stored = localStorage.getItem(OPEN_DATES_KEY);
    const dates: string[] = stored ? JSON.parse(stored) : [];
    if (!dates.includes(today)) {
      dates.push(today);
      if (dates.length > 30) dates.splice(0, dates.length - 30);
      localStorage.setItem(OPEN_DATES_KEY, JSON.stringify(dates));
    }
  } catch {
    // ignore
  }
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_reporter",
    title: "First Reporter",
    icon: "📶",
    description: "Submitted 1+ crowd-sourced signal report",
    check: () => {
      try {
        const s = localStorage.getItem("coverage_gaps");
        const gaps = s ? JSON.parse(s) : [];
        return Array.isArray(gaps) && gaps.length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    id: "antenna_expert",
    title: "Antenna Expert",
    icon: "📡",
    description: "Completed the antenna installation wizard",
    check: () => {
      try {
        return localStorage.getItem("antenna_wizard_completed") === "true";
      } catch {
        return false;
      }
    },
  },
  {
    id: "streak_5",
    title: "5-Day Streak",
    icon: "🔥",
    description: "Opened the app on 5 different days",
    check: () => {
      try {
        const s = localStorage.getItem(OPEN_DATES_KEY);
        const dates: string[] = s ? JSON.parse(s) : [];
        return dates.length >= 5;
      } catch {
        return false;
      }
    },
  },
  {
    id: "speed_champion",
    title: "Speed Champion",
    icon: "⚡",
    description: "Recorded a speed test result above 5 Mbps",
    check: () => {
      try {
        const best = Number(localStorage.getItem("best_download_speed") ?? 0);
        return best > 5;
      } catch {
        return false;
      }
    },
  },
  {
    id: "offline_hero",
    title: "Offline Hero",
    icon: "🦸",
    description: "Used the app while offline",
    check: () => {
      try {
        return localStorage.getItem("used_while_offline") === "true";
      } catch {
        return false;
      }
    },
  },
];

export function AchievementBadges() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    trackOpenDate();
    const set = new Set<string>();
    for (const a of ACHIEVEMENTS) {
      if (a.check()) set.add(a.id);
    }
    setUnlocked(set);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🏅</span>
        <h4 className="font-bold text-sm text-foreground">
          Achievement Badges
        </h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {unlocked.size}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              data-ocid={`home.achievement.item.${ACHIEVEMENTS.indexOf(a) + 1}`}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border w-20 ${
                isUnlocked
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/30 border-border/50"
              }`}
              title={a.description}
            >
              <div
                className={`text-2xl transition-all ${
                  isUnlocked ? "" : "grayscale opacity-40"
                }`}
              >
                {isUnlocked ? (
                  a.icon
                ) : (
                  <span className="relative">
                    {a.icon}
                    <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                  </span>
                )}
              </div>
              <p
                className={`text-[9px] text-center leading-tight font-medium ${
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {a.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
