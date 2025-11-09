"use client";
import { colorMapping } from "@/lib/constants";
import { useFilterStore } from "@/hooks/useFilterStore";

const Legend = () => {
  const { selectedProviders, showRealtime } = useFilterStore();

  return selectedProviders?.length > 0 || showRealtime ? (
    <div className="absolute bottom-6 left-6 rounded-lg bg-black/40 py-4 px-5">
      <div className="flex flex-col gap-6">
        {selectedProviders?.length > 0 && (
          <div>
            <p className="mb-2 font-semibold text-lg">Cloud Providers</p>
            <div className="flex flex-col gap-2 font-medium">
              {Object.entries(colorMapping)
                ?.filter(([provider]) => selectedProviders?.includes(provider))
                ?.map(([provider, color]) => (
                  <div
                    className="flex items-center gap-3"
                    key={`${provider}-${color}`}
                  >
                    <div
                      className={`rounded-full w-5 h-5`}
                      style={{ backgroundColor: color }}
                    />
                    <span>{provider}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
        {showRealtime && (
          <div>
            <p className="mb-2 font-semibold text-lg">Network Latencies</p>
            <div className="flex flex-col gap-2 font-medium">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full w-5 h-1`}
                  style={{ backgroundColor: "#22c55e" }}
                />
                <span>0 - 59</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full w-5 h-1`}
                  style={{ backgroundColor: "#eab308" }}
                />
                <span>60 - 119</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full w-5 h-1`}
                  style={{ backgroundColor: "#ef4444" }}
                />
                <span>{">= 120"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default Legend;
