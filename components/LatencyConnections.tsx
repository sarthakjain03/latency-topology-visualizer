"use client";
import { useEffect, useCallback } from "react";

import exchanges from "@/data/exchanges.json";
import cloudRegions from "@/data/cloudRegions.json";
import mockLatencyConnections from "@/data/mockLatencyConnections.json";
import { Feature } from "geojson";

const greenShades = [
  "#4ade80", // medium-light
  "#22c55e", // medium
];

const yellowShades = [
  "#facc15", // medium-light
  "#eab308", // medium
];

const redShades = [
  "#f87171", // medium-light
  "#ef4444", // medium
];

const LatencyConnections = ({ map }: { map: mapboxgl.Map | null }) => {
  const features: Feature[] = mockLatencyConnections
    .map((conn) => {
      const exchange = exchanges.find((e) => e.name === conn.exchange);
      const provider = cloudRegions.find((p) => p.provider === conn.provider);
      const region = provider?.regions.find((r) => r.code === conn.regionCode);

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
    .filter((f): f is Feature => f !== null);

  const lowLatencyFeatures = features.filter((f) => f.properties?.latency < 60);
  const mediumLatencyFeatures = features.filter(
    (f) => f.properties?.latency >= 60 && f.properties?.latency < 120
  );
  const highLatencyFeatures = features.filter(
    (f) => f.properties?.latency >= 120
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
  }, [map]);

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

        requestAnimationFrame(frame);
      };
      frame();
    };

    // const animatePulse = () => {
    //   let t = 0;

    //   const frame = () => {
    //     t += 0.05;
    //     const opacity = 0.6 + 0.4 * Math.sin(t); // oscillate between 0.2 and 1.0

    //     if (map.getLayer("latency-lines")) {
    //       map.setPaintProperty("latency-lines", "line-opacity", opacity);
    //     }

    //     requestAnimationFrame(frame);
    //   };

    //   frame();
    // };

    setTimeout(() => {
      if (map.isStyleLoaded()) startAnimation();
      else map.once("load", startAnimation);
    }, 500);
  }, [map, features]);

  return <div>LatencyConnections</div>;
};

export default LatencyConnections;
