import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug } from "lucide-react";
import { useState } from "react";

export function CoaxCableHealthChecker() {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [result, setResult] = useState<{ diff: number; ok: boolean } | null>(
    null,
  );

  const check = () => {
    const b = Number(before);
    const a = Number(after);
    if (Number.isNaN(b) || Number.isNaN(a)) return;
    const diff = Math.abs(a - b);
    setResult({ diff: Math.round(diff * 10) / 10, ok: diff <= 3 });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Plug className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Coax Cable Health Checker
        </h4>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Enter signal readings before and after the cable connection.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Before cable (dBm)
          </Label>
          <Input
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            placeholder="-70"
            className="h-8 text-sm mt-1"
            data-ocid="coax.before.input"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">
            After cable (dBm)
          </Label>
          <Input
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            placeholder="-74"
            className="h-8 text-sm mt-1"
            data-ocid="coax.after.input"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs w-full btn-airtel"
        onClick={check}
        data-ocid="coax.check.button"
      >
        Check Cable
      </Button>
      {result && (
        <div className="mt-3 flex items-center gap-3 bg-secondary/40 rounded-lg p-3">
          <span className="text-lg">{result.ok ? "✅" : "⚠️"}</span>
          <div>
            <p className="text-xs font-bold text-foreground">
              {result.ok ? "Cable OK" : "Cable Loss Detected"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Loss: {result.diff} dB{" "}
              {!result.ok ? "— consider shorter/better cable" : ""}
            </p>
          </div>
          <Badge
            className={`ml-auto border text-[10px] ${result.ok ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}
          >
            {result.diff} dB
          </Badge>
        </div>
      )}
    </div>
  );
}
