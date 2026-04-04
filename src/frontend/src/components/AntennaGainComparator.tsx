import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Antenna } from "lucide-react";

interface Props {
  rssi: number;
}

const ANTENNAS = [
  { name: "5 dBi Omni", gain: 5, desc: "Wide coverage, indoor/window mount" },
  { name: "9 dBi Yagi", gain: 9, desc: "Directional, medium range" },
  { name: "14 dBi Yagi", gain: 14, desc: "Long range, roof mount" },
];

export function AntennaGainComparator({ rssi }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Antenna className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Antenna Gain Comparator
        </h4>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">
        Baseline: {rssi.toFixed(0)} dBm
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px] h-7 px-2">Antenna</TableHead>
            <TableHead className="text-[10px] h-7 px-2">Gain</TableHead>
            <TableHead className="text-[10px] h-7 px-2">
              Expected RSSI
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ANTENNAS.map((a) => {
            const expected = rssi + a.gain;
            return (
              <TableRow key={a.name}>
                <TableCell className="text-xs px-2 py-1.5">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                </TableCell>
                <TableCell className="text-xs px-2 py-1.5 font-mono">
                  +{a.gain} dBi
                </TableCell>
                <TableCell className="text-xs px-2 py-1.5">
                  <Badge
                    className={`text-[10px] border ${
                      expected >= -75
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : expected >= -90
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {expected.toFixed(0)} dBm
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
