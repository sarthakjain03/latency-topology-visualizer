"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RegionProps {
  region: {
    provider: string;
    code: string;
    name?: string;
    color?: string;
    serverCount?: number;
    exchanges?: Array<{ name: string; city?: string; provider?: string }>;
  };
  onClose: () => void;
}

export default function RegionInfoDialog({ region, onClose }: RegionProps) {
  const { provider, code, name, serverCount = 0, exchanges = [] } = region;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md! w-full">
        <DialogHeader>
          <DialogTitle>
            {provider} — {code}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">{name}</div>
        </DialogHeader>

        <div className="p-4">
          <div className="mb-3">
            <div className="text-xs text-muted-foreground">Server Count</div>
            <div className="text-lg font-medium">{serverCount}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Exchanges</div>
            <div className="space-y-2 max-h-40 overflow-auto">
              {exchanges && exchanges.length ? (
                exchanges.map((ex) => (
                  <div
                    key={ex.name}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ex.city} • {ex.provider}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No exchanges mapped
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
