"use client";
import { useState } from "react";
import Map from "@/components/map/Map";
import ControlPanel from "@/components/ControlPanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex h-screen w-screen bg-slate-950 text-white">
        <div className="hidden lg:block z-20 w-88 p-4 border-r border-white/10 bg-slate-900/70 overflow-y-auto">
          <ControlPanel />
        </div>

        <div className="absolute top-4 left-4 z-30 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-slate-900/80 border-white/20 text-white hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] sm:w-[70%] p-0 bg-slate-900 text-white border-r border-white/10 overflow-y-auto"
            >
              <SheetHeader className="p-4 border-b border-white/10">
                <SheetTitle className="text-white">Control Panel</SheetTitle>
              </SheetHeader>
              <div className="px-3">
                <ControlPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 relative">
          <Map />
        </div>
      </main>
    </QueryClientProvider>
  );
}
