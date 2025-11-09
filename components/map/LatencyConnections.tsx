"use client";
import { useEffect, useCallback, useMemo, useState } from "react";

import exchanges from "@/data/exchanges.json";
import cloudRegions from "@/data/cloudRegions.json";
import mockLatencyConnections from "@/data/latencyConnections.json";
import { Feature } from "geojson";
import { useFilterStore } from "@/hooks/useFilterStore";

interface MockLatencyConnection {
  exchange: string;
  provider: string;
  regionCode: string;
  latencyMs: number;
  [key: string]: any;
}

const greenShades = ["#22c55e", "green"];
const yellowShades = ["yellow", "#eab308"];
const redShades = ["#f87171", "red"];

const LatencyConnections = ({
  map,
  realTimeData,
}: {
  map: mapboxgl.Map | null;
  realTimeData: number[];
}) => {
  const { latencyRange, selectedExchanges, selectedProviders, showRealtime } =
    useFilterStore();
  const [latencyConnectionData, setLatencyConnectionData] = useState<
    MockLatencyConnection[]
  >([]);

  const updateMockLatencies = (
    mockData: MockLatencyConnection[],
    realtimeLatencies: number[]
  ): MockLatencyConnection[] => {
    return mockData?.map((conn, index) => {
      const newLatency =
        index < realtimeLatencies?.length
          ? realtimeLatencies?.[index]
          : conn.latencyMs;

      return {
        ...conn,
        latencyMs: newLatency,
      };
    });
  };

  useEffect(() => {
    setLatencyConnectionData(
      updateMockLatencies(mockLatencyConnections, realTimeData)
    );
  }, [realTimeData]);

  const features: Feature[] = useMemo(
    () =>
      latencyConnectionData
        .filter(
          (conn) =>
            conn.latencyMs >= latencyRange[0] &&
            conn.latencyMs <= latencyRange[1] &&
            showRealtime
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
    [
      latencyRange,
      selectedExchanges,
      selectedProviders,
      showRealtime,
      latencyConnectionData,
    ]
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
      if (!map) return;
      if (map.getLayer("low-latency-lines"))
        map.removeLayer("low-latency-lines");
      if (map.getLayer("medium-latency-lines"))
        map.removeLayer("medium-latency-lines");
      if (map.getLayer("high-latency-lines"))
        map.removeLayer("high-latency-lines");

      if (map.getSource("low-latencies")) map.removeSource("low-latencies");
      if (map.getSource("medium-latencies"))
        map.removeSource("medium-latencies");
      if (map.getSource("high-latencies")) map.removeSource("high-latencies");
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
      let indexArray = [0, 1, 1, 1, 1];
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
            greenShades[indexArray[0]],
            0.25,
            greenShades[indexArray[1]],
            0.5,
            greenShades[indexArray[2]],
            0.75,
            greenShades[indexArray[3]],
            1,
            greenShades[indexArray[4]],
          ]);

          map.setPaintProperty("medium-latency-lines", "line-gradient", [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            yellowShades[indexArray[0]],
            0.25,
            yellowShades[indexArray[1]],
            0.5,
            yellowShades[indexArray[2]],
            0.75,
            yellowShades[indexArray[3]],
            1,
            yellowShades[indexArray[4]],
          ]);

          map.setPaintProperty("high-latency-lines", "line-gradient", [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            redShades[indexArray[0]],
            0.25,
            redShades[indexArray[1]],
            0.5,
            redShades[indexArray[2]],
            0.75,
            redShades[indexArray[3]],
            1,
            redShades[indexArray[4]],
          ]);

          const shifted = [
            indexArray[indexArray.length - 1],
            ...indexArray.slice(0, -1),
          ];
          indexArray = [...shifted];
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
