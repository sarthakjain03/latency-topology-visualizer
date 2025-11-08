"use client";
import { useEffect, useCallback, useMemo } from "react";

import exchanges from "@/data/exchanges.json";
import cloudRegions from "@/data/cloudRegions.json";
import mockLatencyConnections from "@/data/mockLatencyConnections.json";
import { Feature } from "geojson";

import { useFilterStore } from "@/hooks/useFilterStore";

const greenShades = [
  "#22c55e", // medium-light
  "green", // medium
];

const yellowShades = [
  "yellow", // medium-light
  "#eab308", // medium
];

const redShades = [
  "#f87171", // medium-light
  "red", // medium
];

const LatencyConnections = ({ map }: { map: mapboxgl.Map | null }) => {
  const { latencyRange, selectedExchanges, selectedProviders } =
    useFilterStore();

  const features: Feature[] = useMemo(
    () =>
      mockLatencyConnections
        .filter(
          (conn) =>
            conn.latencyMs >= latencyRange[0] &&
            conn.latencyMs <= latencyRange[1]
        )
        .map((conn) => {
          const exchange = exchanges
            .filter((e) => selectedExchanges?.includes(e.name))
            .find((e) => e.name === conn.exchange);
          const provider = cloudRegions
            .filter((p) => selectedProviders?.includes(p.provider))
            .find((p) => p.provider === conn.provider);
          const region = provider?.regions.find(
            (r) => r.code === conn.regionCode
          );

          if (!exchange?.coords || !region?.coords) return null;

          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [exchange?.coords, region?.coords],
            },
            properties: {
              latency: conn.latencyMs,
              color:
                conn.latencyMs < 60
                  ? "green"
                  : conn.latencyMs < 120
                  ? "yellow"
                  : "red",
            },
          } as Feature;
        })
        .filter((f): f is Feature => f !== null),
    [latencyRange, selectedExchanges, selectedProviders]
  );

  const lowLatencyFeatures = useMemo(
    () => features.filter((f) => f.properties?.latency < 60),
    [features]
  );
  const mediumLatencyFeatures = useMemo(
    () =>
      features.filter(
        (f) => f.properties?.latency >= 60 && f.properties?.latency < 120
      ),
    [features]
  );
  const highLatencyFeatures = useMemo(
    () => features.filter((f) => f.properties?.latency >= 120),
    [features]
  );

  const addSourceAndLayer = useCallback(
    (
      sourceName: string,
      layerName: string,
      features: Feature[],
      colorShades: string[]
    ) => {
      if (!map) return;
      if (map.getSource(sourceName)) return;

      map.addSource(sourceName, {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        lineMetrics: true,
      });

      map.addLayer({
        id: layerName,
        type: "line",
        source: sourceName,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            colorShades[1],
            1,
            colorShades[0],
          ],
          "line-width": 2.5,
          "line-opacity": 0.9,
        },
      });
    },
    [map]
  );

  const loadLowLatencyFeatures = useCallback(() => {
    addSourceAndLayer(
      "low-latencies",
      "low-latency-lines",
      lowLatencyFeatures,
      greenShades
    );
  }, [lowLatencyFeatures]);

  const loadMediumLatencyFeatures = useCallback(() => {
    addSourceAndLayer(
      "medium-latencies",
      "medium-latency-lines",
      mediumLatencyFeatures,
      yellowShades
    );
  }, [mediumLatencyFeatures]);

  const loadHighLatencyFeatures = useCallback(() => {
    addSourceAndLayer(
      "high-latencies",
      "high-latency-lines",
      highLatencyFeatures,
      redShades
    );
  }, [highLatencyFeatures]);

  useEffect(() => {
    if (!map || !features) return;

    if (map.isStyleLoaded()) {
      loadLowLatencyFeatures();
      loadMediumLatencyFeatures();
      loadHighLatencyFeatures();
    } else {
      map.once("load", loadLowLatencyFeatures);
      map.once("load", loadMediumLatencyFeatures);
      map.once("load", loadHighLatencyFeatures);
    }

    return () => {
      map.removeLayer("low-latency-lines");
      map.removeLayer("medium-latency-lines");
      map.removeLayer("high-latency-lines");

      map.removeSource("low-latencies");
      map.removeSource("medium-latencies");
      map.removeSource("high-latencies");
    };
  }, [map, features]);

  useEffect(() => {
    if (!map) return;

    map.once("styledata", loadLowLatencyFeatures);
    map.once("styledata", loadMediumLatencyFeatures);
    map.once("styledata", loadHighLatencyFeatures);

    return () => {
      map.off("styledata", loadLowLatencyFeatures);
      map.off("styledata", loadMediumLatencyFeatures);
      map.off("styledata", loadHighLatencyFeatures);
    };
  }, [map, features]);

  useEffect(() => {
    if (!map) return;
    let animationFrameId: number;

    const startAnimation = () => {
      let index1 = 0;
      let index2 = 1;
      let index3 = 1;
      let index4 = 1;
      let index5 = 1;
      let frameCount = 0;

      const frame = () => {
        frameCount++;

        if (
          frameCount % 15 === 0 && // Adjust for speed
          map.getLayer("low-latency-lines") &&
          map.getLayer("medium-latency-lines") &&
          map.getLayer("high-latency-lines")
        ) {
          map.setPaintProperty("low-latency-lines", "line-gradient", [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            greenShades[index1],
            0.25,
            greenShades[index2],
            0.5,
            greenShades[index3],
            0.75,
            greenShades[index4],
            1,
            greenShades[index5],
          ]);

          map.setPaintProperty("medium-latency-lines", "line-gradient", [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            yellowShades[index1],
            0.25,
            yellowShades[index2],
            0.5,
            yellowShades[index3],
            0.75,
            yellowShades[index4],
            1,
            yellowShades[index5],
          ]);

          map.setPaintProperty("high-latency-lines", "line-gradient", [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            redShades[index1],
            0.25,
            redShades[index2],
            0.5,
            redShades[index3],
            0.75,
            redShades[index4],
            1,
            redShades[index5],
          ]);

          if (index1 === 0) {
            index2 = 0;
            index1 = 1;
          } else if (index2 === 0) {
            index3 = 0;
            index2 = 1;
          } else if (index3 === 0) {
            index4 = 0;
            index3 = 1;
          } else if (index4 === 0) {
            index5 = 0;
            index4 = 1;
          } else {
            index1 = 0;
            index5 = 1;
          }
        }

        animationFrameId = requestAnimationFrame(frame);
      };
      frame();
    };

    map.off("styledata", startAnimation);

    setTimeout(() => {
      if (map.isStyleLoaded()) startAnimation();
      else map.once("load", startAnimation);
    }, 500);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [map]);

  return null;
};

export default LatencyConnections;
