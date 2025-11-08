"use client";
import React, { useMemo } from "react";
import mockLatency from "@/data/mockLatencyConnections.json"; // adjust path as needed
import { useFilterStore } from "@/hooks/useFilterStore";

const MetricsDashboard: React.FC = () => {
  const { selectedExchanges, selectedProviders, latencyRange, query } =
    useFilterStore();

  // filter connections based on store
  const filtered = useMemo(() => {
    return mockLatency.filter((c) => {
      // exchange filter
      if (selectedExchanges.length && !selectedExchanges.includes(c.exchange))
        return false;
      // provider filter
      if (selectedProviders.length && !selectedProviders.includes(c.provider))
        return false;
      // latency range
      if (c.latencyMs < latencyRange[0] || c.latencyMs > latencyRange[1])
        return false;
      // query filter (match exchange or regionCode)
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.exchange.toLowerCase().includes(q) &&
          !c.regionCode.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [selectedExchanges, selectedProviders, latencyRange, query]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const avg = count
      ? Math.round(filtered.reduce((s, c) => s + c.latencyMs, 0) / count)
      : 0;
    const min = count ? Math.min(...filtered.map((c) => c.latencyMs)) : 0;
    const max = count ? Math.max(...filtered.map((c) => c.latencyMs)) : 0;

    // number of visible exchanges
    const visibleExchanges = Array.from(
      new Set(filtered.map((c) => c.exchange))
    ).length;

    return { count, avg, min, max, visibleExchanges };
  }, [filtered]);

  return (
    <div className="bg-white/5 p-3 rounded-lg shadow-sm w-full">
      <h3 className="text-sm font-semibold mb-2">Performance Metrics</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-white/3 rounded">
          <div className="text-xs text-muted-foreground">Connections</div>
          <div className="text-lg font-medium">{stats.count}</div>
        </div>

        <div className="p-2 bg-white/3 rounded">
          <div className="text-xs text-muted-foreground">Avg Latency</div>
          <div className="text-lg font-medium">{stats.avg} ms</div>
        </div>

        <div className="p-2 bg-white/3 rounded">
          <div className="text-xs text-muted-foreground">Min / Max</div>
          <div className="text-lg font-medium">
            {stats.min} ms / {stats.max} ms
          </div>
        </div>

        <div className="p-2 bg-white/3 rounded">
          <div className="text-xs text-muted-foreground">Exchanges Visible</div>
          <div className="text-lg font-medium">{stats.visibleExchanges}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
