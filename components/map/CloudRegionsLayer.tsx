"use client";
import { useEffect, useMemo, useState } from "react";
import * as turf from "@turf/turf";
import cloudRegions from "@/data/cloudRegions.json";
import exchanges from "@/data/exchanges.json";
import { useFilterStore } from "@/hooks/useFilterStore";
import { Feature, Geometry } from "geojson";
import RegionInfoDialog from "../dialogs/RegionInfoDialog";
import { Region } from "@/lib/constants";

type RegionState = Region | null;

const SOURCE_ID = "cloud-regions-source";
const POLYGON_LAYER_ID = "cloud-regions-polygon";
const CIRCLE_LAYER_ID = "cloud-regions-circle";
const LABEL_LAYER_ID = "cloud-regions-label";

const providerColors: Record<string, string> = {
  AWS: "#3B82F6", // medium blue
  GCP: "#8B5CF6", // medium purple
  Azure: "#14B8A6", // medium teal
  default: "#888888",
};

const buildFeatures = () => {
  const polygonFeatures: Feature<Geometry>[] = [];
  const markerFeatures: Feature<Geometry>[] = [];

  cloudRegions?.forEach((providerObj) => {
    const providerName: string = providerObj.provider;
    const color = providerColors[providerName] || providerColors.default;

    const grouped: Record<string, any[]> = {};
    (providerObj.regions || []).forEach((r) => {
      if (!grouped[r.code]) grouped[r.code] = [];
      grouped[r.code].push(r);
    });

    Object.keys(grouped).forEach((regionCode) => {
      const regionsGroup = grouped[regionCode];
      const regionCoords = regionsGroup.map((r) => r.coords);

      const exchangesInRegion = exchanges.filter(
        (ex) =>
          ex.region === regionCode ||
          (ex.provider === providerName && ex.region === regionCode)
      );

      const exchangeCoords = exchangesInRegion
        .map((ex) => ex.coords)
        .filter(Boolean);

      const allPoints = [...regionCoords, ...exchangeCoords].filter(
        (p) => Array.isArray(p) && p.length === 2
      );

      if (allPoints.length === 0) return;

      const pointsFC = turf.featureCollection(
        allPoints.map((p) => turf.point(p))
      );
      const hull = turf.convex(pointsFC);

      if (hull) {
        hull.id = `${providerName}-${regionCode}-poly-${regionsGroup[0].name}`;
        hull.properties = {
          provider: providerName,
          code: regionCode,
          color,
          name: regionsGroup[0].name,
          serverCount: exchangesInRegion.length,
          exchanges: exchangesInRegion.map((e) => ({
            name: e.name,
            city: e.city || e.region || "—",
            provider: e.provider,
          })),
        };
        polygonFeatures.push(hull);
      }

      const centroid = turf.centroid(pointsFC);
      centroid.id = `${providerName}-${regionCode}-marker-${regionsGroup[0].name}`;
      centroid.properties = {
        provider: providerName,
        code: regionCode,
        color,
        name: regionsGroup[0].name,
        serverCount: exchangesInRegion.length,
        exchanges: exchangesInRegion.map((e) => ({
          name: e.name,
          city: e.city || e.region || "—",
          provider: e.provider,
        })),
      };
      markerFeatures.push(centroid);
    });
  });

  return {
    polygons: turf.featureCollection(polygonFeatures),
    markers: turf.featureCollection(markerFeatures),
  };
};

const CloudRegionsLayer = ({ map }: { map: mapboxgl.Map | null }) => {
  const showRegions = useFilterStore((s) => s.showRegions);
  const [selectedRegion, setSelectedRegion] = useState<RegionState>(null);

  const { polygons, markers } = useMemo(() => buildFeatures(), []);

  useEffect(() => {
    if (!map) return;

    const addLayers = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: polygons,
      });

      map.addLayer({
        id: POLYGON_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.15,
          "fill-outline-color": ["get", "color"],
        },
      });

      map.addSource("cloud-region-markers", {
        type: "geojson",
        data: markers,
      });
      map.addLayer({
        id: CIRCLE_LAYER_ID,
        type: "circle",
        source: "cloud-region-markers",
        paint: {
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#111",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.85,
          "circle-radius": 6,
        },
      });

      map.addLayer({
        id: LABEL_LAYER_ID,
        type: "symbol",
        source: "cloud-region-markers",
        layout: {
          "text-field": [
            "format",
            ["get", "serverCount"],
            { "font-scale": 1 },
            "\n",
            ["get", "code"],
          ],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-anchor": "top",
          "text-offset": [0, 1.2],
        },
        paint: {
          "text-color": "#111827",
        },
      });

      map.on("mouseenter", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", CIRCLE_LAYER_ID, (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties;
        if (!props) return;
        const parsed = {
          provider: props.provider,
          code: props.code,
          name: props.name,
          color: props.color,
          serverCount: Number(props.serverCount ?? 0),
          exchanges: props.exchanges ? JSON.parse(props.exchanges) : null,
        };
        setSelectedRegion(parsed);
      });
    };

    if (map.isStyleLoaded()) addLayers();
    else map.once("load", addLayers);

    const updateVisibility = () => {
      const visible = showRegions ? "visible" : "none";
      [POLYGON_LAYER_ID, CIRCLE_LAYER_ID, LABEL_LAYER_ID].forEach((layer) => {
        if (map.getLayer(layer))
          map.setLayoutProperty(layer, "visibility", visible);
      });
    };
    updateVisibility();

    const onStyleData = () => {
      if (!map.getSource(SOURCE_ID)) addLayers();
      updateVisibility();
    };

    map.on("styledata", onStyleData);

    return () => {
      if (!map || !map?.getStyle()) return;
      try {
        [POLYGON_LAYER_ID, CIRCLE_LAYER_ID, LABEL_LAYER_ID].forEach((layer) => {
          if (map.getLayer(layer)) map.removeLayer(layer);
        });
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
        if (map.getSource("cloud-region-markers"))
          map.removeSource("cloud-region-markers");
      } catch (err) {
        console.error(err);
      }
      map.off("styledata", onStyleData);
    };
  }, [map, polygons, markers, showRegions]);

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
};

export default CloudRegionsLayer;
