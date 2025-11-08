import Map from "@/components/Map";
import ControlPanel from "@/components/ControlPanel";

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-slate-950 text-white">
      {/* Left side — control panel */}
      <div className="z-20 w-88 p-4 border-r border-white/10 bg-slate-900/70 overflow-y-auto">
        <ControlPanel />
      </div>

      {/* Right side — map visualization */}
      <div className="flex-1 relative">
        <Map />
      </div>
    </main>
  );
}
