"use client";
import { useRef, useEffect, useState } from "react";
import ExchangeMarker from "./ExchangeMarker";
import CloudServerMarker from "./CloudServerMarker";
import Legend from "./Legend";
import LatencyConnections from "./LatencyConnections";
import CloudRegionsLayer from "./CloudRegionsLayer";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import exchanges from "@/data/exchanges.json";
import cloudRegions from "@/data/cloudRegions.json";

import { useFilterStore } from "@/hooks/useFilterStore";
import { useRealTimeLatency } from "@/hooks/useRealTimeLatency";
import HistoricalModal from "./HistoricalModal";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [parentMapRef, setParentMapRef] = useState<mapboxgl.Map | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const { data: realTimeData, isLoading, error } = useRealTimeLatency();

  const {
    selectedExchanges,
    selectedProviders,
    showHistorical,
    setLayer,
    query,
  } = useFilterStore();

  // 🗺️ Default center/zoom for reset
  const defaultView = {
    center: [-0.1276, 25.5072] as [number, number],
    zoom: 2,
    pitch: 0,
    bearing: 0,
  };

  // 🗺️ Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        projection: "globe",
        zoom: defaultView.zoom,
        center: defaultView.center,
      });

      mapRef.current = map;

      map.on("load", () => {
        setIsMapReady(true);
        setParentMapRef(map);
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // ⏱️ Debounce query input (1s)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 🔍 Animate map when debouncedQuery changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // ⬅️ Reset to default if query cleared
    if (debouncedQuery === "") {
      map.flyTo({
        center: defaultView.center,
        zoom: defaultView.zoom,
        pitch: defaultView.pitch,
        bearing: defaultView.bearing,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
      return;
    }

    // 1️⃣ Try to find exchange match
    const exchange = exchanges.find((ex) =>
      ex.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    if (exchange) {
      map.flyTo({
        center: exchange.coords as [number, number],
        zoom: 4.5,
        pitch: 45,
        bearing: Math.random() * 360,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
      return;
    }

    // 2️⃣ Try to find region match
    for (const provider of cloudRegions) {
      const region = provider.regions.find(
        (r) =>
          r.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          r.code.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      if (region) {
        map.flyTo({
          center: region.coords as [number, number],
          zoom: 4.5,
          pitch: 45,
          bearing: Math.random() * 360,
          speed: 0.8,
          curve: 1.2,
          essential: true,
        });
        return;
      }
    }
  }, [debouncedQuery]);

  return (
    <>
      <div id="map-container" className="h-full" ref={mapContainerRef}></div>
      {isMapReady && parentMapRef && (
        <>
          {exchanges
            ?.filter((exchange) => selectedExchanges?.includes(exchange.name))
            ?.map((exchange) => (
              <ExchangeMarker
                key={`${exchange.name}-marker`}
                map={parentMapRef}
                lngLat={exchange.coords as [number, number]}
                provider={exchange.provider as "AWS" | "GCP" | "Azure"}
                crytoOrg={exchange.name}
                imageUrl={exchange.imageUrl}
                city={exchange.city}
                country={exchange.country}
              />
            ))}

          {cloudRegions
            ?.filter((cloud) => selectedProviders?.includes(cloud.provider))
            ?.map((cloudData) =>
              cloudData?.regions?.map((region) => (
                <CloudServerMarker
                  key={`${cloudData.provider}-${region.code}-marker`}
                  map={parentMapRef}
                  lngLat={region.coords as [number, number]}
                  provider={cloudData.provider as "AWS" | "GCP" | "Azure"}
                  country={region.name}
                  code={region.code}
                />
              ))
            )}

          <Legend />
          {!isLoading && !error && (
            <LatencyConnections
              map={parentMapRef}
              realTimeData={realTimeData as number[]}
            />
          )}
          <CloudRegionsLayer map={parentMapRef} />
        </>
      )}
      {showHistorical && (
        <div className="w-full">
          <HistoricalModal
            showHistorical={showHistorical}
            onClose={() => setLayer("historical", false)}
          />
        </div>
      )}
    </>
  );
};

export default Map;
