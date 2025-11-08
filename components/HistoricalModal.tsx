"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
} from "recharts";
import { format } from "date-fns";

import mockLatency from "@/data/mockLatencyConnections.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Point = { t: number; ms: number };
type RangeKey = "1h" | "24h" | "7d" | "30d";

const TIME_RANGES: { key: RangeKey; label: string }[] = [
  { key: "1h", label: "1 hour" },
  { key: "24h", label: "24 hours" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

function generateMockHistory(baseMs: number, range: RangeKey): Point[] {
  const now = Date.now();
  let stepMs = 60_000;
  let count = 60;

  switch (range) {
    case "1h":
      stepMs = 60_000;
      count = 60;
      break;
    case "24h":
      stepMs = 5 * 60_000;
      count = 288;
      break;
    case "7d":
      stepMs = 60 * 60_000;
      count = 168;
      break;
    case "30d":
      stepMs = 6 * 60 * 60_000;
      count = 120;
      break;
  }

  return Array.from({ length: count }, (_, i) => {
    const t = now - (count - i) * stepMs;
    const jitter = (Math.random() - 0.5) * baseMs * 0.2;
    const spike = Math.random() < 0.02 ? Math.random() * baseMs * 2 : 0;
    const ms = Math.max(5, Math.round(baseMs + jitter + spike));
    return { t, ms };
  });
}

function computeStats(points: Point[]) {
  const values = points.map((p) => p.ms);
  if (!values.length) return { min: 0, max: 0, avg: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  return { min, max, avg };
}

// Export CSV utility
function downloadCSV(data: Point[], fileName: string) {
  const csv = [
    "timestamp,latency_ms",
    ...data.map((d) => `${d.t},${d.ms}`),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

interface HistoricalModalProps {
  showHistorical: boolean;
  onClose: () => void;
}

export default function HistoricalModal({
  showHistorical,
  onClose,
}: HistoricalModalProps) {
  const pairs = useMemo(() => {
    const uniquePairs = new Map<
      string,
      { exchange: string; regionCode: string; baseLatency: number }
    >();
    for (const c of mockLatency) {
      const key = `${c.exchange} ↔ ${c.regionCode}`;
      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, {
          exchange: c.exchange,
          regionCode: c.regionCode,
          baseLatency: c.latencyMs,
        });
      }
    }
    return Array.from(uniquePairs.entries()).map(([k, v]) => ({
      key: k,
      ...v,
    }));
  }, []);

  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(
    (pairs[0] && pairs[0].key) || null
  );
  const [range, setRange] = useState<RangeKey>("24h");
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!selectedPairKey) return;

    const timeout = setTimeout(() => {
      const pair = pairs.find((p) => p.key === selectedPairKey);
      if (!pair) return;
      const hist = generateMockHistory(pair.baseLatency, range);
      setPoints(hist);
    }, 0);

    return () => clearTimeout(timeout);
  }, [selectedPairKey, range, pairs]);

  const stats = useMemo(() => computeStats(points), [points]);

  const xTickFormatter = (val: number) => {
    if (range === "1h") return format(val, "HH:mm");
    if (range === "24h") return format(val, "HH:mm");
    if (range === "7d") return format(val, "EEE dd");
    return format(val, "MMM dd");
  };

  return (
    <Dialog open={showHistorical} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border border-slate-800 max-w-[90vw]! w-[90vw]!">
        <DialogHeader>
          <DialogTitle>📈 Historical Latency Trends</DialogTitle>
        </DialogHeader>

        <Card className="bg-slate-950 border border-slate-800 p-4 mt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-sm text-slate-400">Select pair</div>
                <Select
                  onValueChange={(v) => setSelectedPairKey(v)}
                  value={selectedPairKey ?? undefined}
                >
                  <SelectTrigger className="w-64 text-white">
                    <SelectValue placeholder="Select exchange ↔ region" />
                  </SelectTrigger>
                  <SelectContent>
                    {pairs.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.key} — base {p.baseLatency} ms
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-400">Range</div>
                <div className="flex gap-2 mt-1">
                  {TIME_RANGES.map((r) => (
                    <Button
                      key={r.key}
                      variant={range === r.key ? "outline" : "default"}
                      size="sm"
                      onClick={() => setRange(r.key)}
                      className="text-xs"
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">Stats:</div>
              <div className="flex gap-4 text-sm text-white">
                <span>
                  Avg <strong>{stats.avg} ms</strong>
                </span>
                <span>
                  Min <strong>{stats.min} ms</strong>
                </span>
                <span>
                  Max <strong>{stats.max} ms</strong>
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() =>
                  downloadCSV(
                    points,
                    `${selectedPairKey || "latency"}-${range}.csv`
                  )
                }
              >
                Export CSV
              </Button>
            </div>
          </div>

          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points.map((p) => ({ t: p.t, ms: p.ms }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="t"
                  tickFormatter={xTickFormatter}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="ms"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  width={60}
                  unit=" ms"
                />
                <Tooltip
                  formatter={(v) => `${v} ms`}
                  labelFormatter={(l) => format(Number(l), "PPpp")}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ms"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
                <Brush
                  dataKey="t"
                  height={30}
                  stroke="#06b6d4"
                  travellerWidth={6}
                  fill="#1e293b"
                  tickFormatter={xTickFormatter}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
