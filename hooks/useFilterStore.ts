"use client";
import { create } from "zustand";

export type VisualizationMode = "realtime" | "historical" | "regions";

export type FilterState = {
  // filters
  selectedExchanges: string[]; // names
  selectedProviders: string[]; // AWS, GCP, Azure, Cloudflare...
  latencyRange: [number, number]; // ms [min, max]

  // search
  query: string;

  // toggles / visual layers
  showRealtime: boolean;
  showHistorical: boolean;
  showRegions: boolean;

  // actions
  toggleExchange: (name: string) => void;
  toggleProvider: (provider: string) => void;
  setLatencyRange: (r: [number, number]) => void;
  setQuery: (q: string) => void;
  setLayer: (layer: "realtime" | "historical" | "regions", v: boolean) => void;
  resetAll: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  selectedExchanges: [
    "Binance",
    "Bybit",
    "OKX",
    "Deribit",
    "Kraken",
    "Coinbase Pro",
  ],
  selectedProviders: ["AWS", "GCP", "Azure"],
  latencyRange: [0, 300],
  query: "",

  showRealtime: true,
  showHistorical: false,
  showRegions: true,

  toggleExchange: (name) =>
    set((s) => {
      const exists = s.selectedExchanges.includes(name);
      return {
        selectedExchanges: exists
          ? s.selectedExchanges.filter((e) => e !== name)
          : [...s.selectedExchanges, name],
      };
    }),

  toggleProvider: (provider) =>
    set((s) => {
      const exists = s.selectedProviders.includes(provider);
      return {
        selectedProviders: exists
          ? s.selectedProviders.filter((p) => p !== provider)
          : [...s.selectedProviders, provider],
      };
    }),

  setLatencyRange: (r) => set({ latencyRange: r }),

  setQuery: (q) => set({ query: q }),

  setLayer: (layer, v) =>
    set(() => {
      if (layer === "realtime") return { showRealtime: v };
      if (layer === "historical") return { showHistorical: v };
      return { showRegions: v };
    }),

  resetAll: () =>
    set({
      selectedExchanges: [],
      selectedProviders: [],
      latencyRange: [0, 300],
      query: "",
      showRealtime: true,
      showHistorical: false,
      showRegions: true,
    }),
}));
