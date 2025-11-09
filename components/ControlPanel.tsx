"use client";
import React, { useMemo, ChangeEvent } from "react";
import { useFilterStore } from "@/hooks/useFilterStore";
import MetricsDashboard from "./MetricsDashboard";
import exchanges from "@/data/exchanges.json";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const uniqueProviders = Array.from(new Set(exchanges.map((e) => e.provider)));

const ControlPanel: React.FC = () => {
  const {
    selectedExchanges,
    selectedProviders,
    latencyRange,
    query,
    showRealtime,
    showRegions,
    toggleExchange,
    toggleProvider,
    setLatencyRange,
    setQuery,
    setLayer,
    resetAll,
  } = useFilterStore();

  const exchangeList = useMemo(() => exchanges.map((e) => e.name), []);

  const onLatencyChange = (vals: number[]) => {
    const r: [number, number] = [vals[0] ?? 0, vals[1] ?? 300];
    setLatencyRange(r);
  };

  return (
    <aside className="w-full lg:w-80 px-4 pb-4 space-y-4 bg-slate-900/60 rounded-lg text-white">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => resetAll()}>
          Reset
        </Button>
      </div>

      <div>
        <label className="text-sm text-gray-300">
          Search Exchanges / Regions
        </label>
        <Input
          placeholder="Search (Binance, us-east-1...)"
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm text-gray-300">Cloud Providers</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {uniqueProviders.map((p) => {
            const active = selectedProviders.includes(p);
            return (
              <button
                key={p}
                onClick={() => toggleProvider(p)}
                className={`px-2 py-1 rounded-md text-sm border ${
                  active ? "bg-white/10 border-white" : "border-white/10"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-300">Exchanges</label>
        <div className="max-h-36 overflow-auto mt-2 grid gap-2">
          {exchangeList.map((ex) => {
            const checked = selectedExchanges.includes(ex);
            return (
              <label key={ex} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleExchange(ex)}
                />
                <span className="truncate">{ex}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-300">Latency Range (ms)</label>
        <div className="mt-2">
          <Slider
            value={latencyRange}
            min={0}
            max={1000}
            step={1}
            onValueChange={(vals: number[]) => onLatencyChange(vals)}
            className="**:data-[slot=slider-range]:bg-sky-400 **:data-[slot=slider-track]:bg-slate-700"
          />
          <div className="text-xs text-gray-300 mt-1">
            {latencyRange[0]} ms — {latencyRange[1]} ms
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setLayer("historical", true)}
        >
          Show Historical Data
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Realtime</div>
            <div className="text-xs text-gray-400">Show live latency lines</div>
          </div>
          <Switch
            checked={showRealtime}
            onCheckedChange={(v: boolean) => setLayer("realtime", !!v)}
            className="data-[state=checked]:bg-sky-400 data-[state=unchecked]:bg-slate-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Regions</div>
            <div className="text-xs text-gray-400">
              Show cloud region overlays
            </div>
          </div>
          <Switch
            checked={showRegions}
            onCheckedChange={(v: boolean) => setLayer("regions", !!v)}
            className="data-[state=checked]:bg-sky-400 data-[state=unchecked]:bg-slate-700"
          />
        </div>
      </div>

      <MetricsDashboard />
    </aside>
  );
};

export default ControlPanel;
