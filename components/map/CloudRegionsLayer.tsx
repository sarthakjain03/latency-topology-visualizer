"use client";
import { useEffect, useMemo, useState } from "react";
import cloudRegions from "@/data/cloudRegions.json";
import exchanges from "@/data/exchanges.json";
import { useFilterStore } from "@/hooks/useFilterStore";
import { Feature } from "geojson";
import RegionInfoDialog from "../dialogs/RegionInfoDialog";

interface Props {
  map: mapboxgl.Map | null;
}

function buildFeatures() {
  const features: Feature[] = [];

  cloudRegions.forEach((providerObj) => {
    const providerName: string = providerObj.provider;
    const color: string = "#888";

    (providerObj.regions || []).forEach((r) => {
      const exchangesInRegion = exchanges.filter((ex) => {
        return (
          ex.region === r.code ||
          ex.region === r.code ||
          (ex.provider === providerName && ex.region && ex.region === r.code)
        );
      });

      const serverCount = exchangesInRegion.length;

      const feature: Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: r.coords,
        },
        properties: {
          provider: providerName,
          code: r.code,
          name: r.name,
          color,
          serverCount,
          exchanges: exchangesInRegion.map((e) => ({
            name: e.name,
            city: e.city || e.region || "—",
            provider: e.provider,
          })),
        },
      };

      features.push(feature);
    });
  });

  return {
    type: "FeatureCollection",
    features,
  } as GeoJSON.FeatureCollection;
}

const SOURCE_ID = "cloud-regions-source";
const FILL_LAYER_ID = "cloud-regions-fill";
const CIRCLE_LAYER_ID = "cloud-regions-circle";
const LABEL_LAYER_ID = "cloud-regions-label";

export default function CloudRegionsLayer({ map }: Props) {
  const showRegions = useFilterStore((s) => s.showRegions);
  const [selectedRegion, setSelectedRegion] = useState<{
    provider: string;
    code: string;
    name?: string;
    color?: string;
    serverCount?: number;
    exchanges?: Array<{ name: string; city?: string; provider?: string }>;
  } | null>(null);

  const geojson = useMemo(() => buildFeatures(), []);

  useEffect(() => {
    if (!map) return;

    const addLayers = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: CIRCLE_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-color": ["get", "color"],
          "circle-opacity": 0.18,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.8,
          "circle-stroke-width": 1.5,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "serverCount"], 0],
            0,
            6,
            1,
            10,
            5,
            18,
            10,
            26,
            20,
            38,
            50,
            50,
          ],
        },
      });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-color": ["get", "color"],
          "circle-opacity": 0.06,
        },
      });

      map.addLayer({
        id: LABEL_LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "text-field": [
            "format",
            ["get", "serverCount"],
            { "font-scale": 1 },
            "\n",
            ["get", "code"],
          ],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-line-height": 1.1,
          "text-anchor": "center",
          "text-offset": [0, 0.5],
        },
        paint: {
          "text-color": "#000",
        },
      });

      map.on("mouseenter", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", CIRCLE_LAYER_ID, (e) => {
        if (!e.features || !e.features.length) return;
        const props = e.features[0].properties;
        const parsed = {
          provider: props?.provider,
          code: props?.code,
          name: props?.name,
          color: props?.color,
          serverCount: Number(props?.serverCount ?? 0),
          exchanges: props?.exchanges
            ? JSON.parse(props.exchanges)
            : props?.exchanges,
        };
        setSelectedRegion(parsed);
      });
    };

    setTimeout(() => {
      if (map.isStyleLoaded()) addLayers();
      else map.once("load", addLayers);
    }, 500);

    const updateVisibility = () => {
      const visible = showRegions ? "visible" : "none";
      if (map.getLayer(CIRCLE_LAYER_ID))
        map.setLayoutProperty(CIRCLE_LAYER_ID, "visibility", visible);
      if (map.getLayer(FILL_LAYER_ID))
        map.setLayoutProperty(FILL_LAYER_ID, "visibility", visible);
      if (map.getLayer(LABEL_LAYER_ID))
        map.setLayoutProperty(LABEL_LAYER_ID, "visibility", visible);
    };

    updateVisibility();

    const onStyleData = () => {
      if (!map.getSource(SOURCE_ID)) {
        addLayers();
      }
      updateVisibility();
    };
    map.on("styledata", onStyleData);

    return () => {
      if (!map || !map.getStyle()) return;
      try {
        if (map.getLayer(CIRCLE_LAYER_ID)) map.removeLayer(CIRCLE_LAYER_ID);
        if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
        if (map.getLayer(LABEL_LAYER_ID)) map.removeLayer(LABEL_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch (err) {
        console.error(err);
      }
      map.off("styledata", onStyleData);
    };
  }, [map, geojson, showRegions]);

  return (
    <>
      {selectedRegion && (
        <RegionInfoDialog
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </>
  );
}
