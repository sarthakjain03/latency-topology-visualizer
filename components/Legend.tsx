"use client";
import { colorMapping } from "@/lib/constants";
import { useFilterStore } from "@/hooks/useFilterStore";

const Legend = () => {
  const { selectedProviders, showRealtime } = useFilterStore();

  const shouldShow = selectedProviders?.length > 0 || showRealtime;
  if (!shouldShow) return null;

  return (
    <div
      className="
        absolute 
        bottom-6 left-6 
        lg:right-auto 
        lg:bottom-6 
        w-[90%] sm:w-[80%] md:w-auto
        mx-auto lg:mx-0
        lg:rounded-lg
        rounded-xl
        bg-black/50 
        py-3 px-4 lg:py-4 lg:px-5 
        text-white 
        z-30
        flex justify-center lg:block
      "
    >
      <div className="flex flex-col lg:flex-col gap-4 lg:gap-6 text-sm lg:text-base w-full">
        {selectedProviders?.length > 0 && (
          <div>
            <p className="mb-2 font-semibold text-base lg:text-lg text-center lg:text-left">
              Cloud Providers
            </p>
            <div className="flex flex-wrap lg:flex-col justify-center lg:justify-start gap-3 font-medium">
              {Object.entries(colorMapping)
                .filter(([provider]) => selectedProviders?.includes(provider))
                .map(([provider, color]) => (
                  <div
                    className="flex items-center gap-2 lg:gap-3"
                    key={`${provider}-${color}`}
                  >
                    <div
                      className="rounded-full w-4 h-4 lg:w-5 lg:h-5"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm lg:text-base">{provider}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {showRealtime && (
          <div>
            <p className="mb-2 font-semibold text-base lg:text-lg text-center lg:text-left">
              Network Latencies
            </p>
            <div className="flex flex-wrap lg:flex-col justify-center lg:justify-start gap-3 font-medium">
              <div className="flex items-center gap-2 lg:gap-3">
                <div
                  className="rounded-full w-6 h-1.5 lg:w-5 lg:h-1"
                  style={{ backgroundColor: "#22c55e" }}
                />
                <span className="text-sm lg:text-base">0 - 59</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div
                  className="rounded-full w-6 h-1.5 lg:w-5 lg:h-1"
                  style={{ backgroundColor: "#eab308" }}
                />
                <span className="text-sm lg:text-base">60 - 119</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div
                  className="rounded-full w-6 h-1.5 lg:w-5 lg:h-1"
                  style={{ backgroundColor: "#ef4444" }}
                />
                <span className="text-sm lg:text-base">{">= 120"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legend;
