import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface Props {
  rssi: number;
}

function estimateThroughput(rssi: number): number {
  if (rssi >= -75) return 20 + Math.random() * 30;
  if (rssi >= -90) return 5 + Math.random() * 15;
  return 0.5 + Math.random() * 4;
}

interface DataPoint {
  time: string;
  mbps: number;
}

export function ThroughputGraph({ rssi }: Props) {
  const [data, setData] = useState<DataPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 10 }, (_, i) => ({
      time: new Date(now - (9 - i) * 5000).toLocaleTimeString("en-UG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      mbps: estimateThroughput(rssi),
    }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint: DataPoint = {
        time: new Date().toLocaleTimeString("en-UG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        mbps: Math.round(estimateThroughput(rssi) * 10) / 10,
      };
      setData((prev) => [...prev.slice(-19), newPoint]);
    }, 5000);
    return () => clearInterval(interval);
  }, [rssi]);

  const latest = data[data.length - 1]?.mbps ?? 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">Live Throughput</h4>
        <span className="ml-auto text-sm font-bold text-primary">
          {latest.toFixed(1)} Mbps
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Updated every 5 seconds (estimated)
      </p>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.46 0.22 24.5)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.46 0.22 24.5)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)} Mbps`, "Throughput"]}
            contentStyle={{ fontSize: 10, padding: "2px 8px" }}
          />
          <Area
            type="monotone"
            dataKey="mbps"
            stroke="oklch(0.46 0.22 24.5)"
            fill="url(#tpGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
