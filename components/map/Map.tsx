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
import HistoricalModal from "../dialogs/HistoricalDataDialog";

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

  const defaultView = {
    center: [-0.1276, 25.5072] as [number, number],
    zoom: 2,
    pitch: 0,
    bearing: 0,
  };

  const [viewportZoom, setViewportZoom] = useState(defaultView.zoom);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setViewportZoom(0.9); // Mobile
      else if (width < 1024) setViewportZoom(1.5); // Tablet
      else setViewportZoom(2); // Desktop
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        projection: "globe",
        zoom: viewportZoom,
        center: defaultView.center,
        pitch: defaultView.pitch,
        bearing: defaultView.bearing,
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
  }, [viewportZoom]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (debouncedQuery === "") {
      map.flyTo({
        center: defaultView.center,
        zoom: viewportZoom,
        pitch: 0,
        bearing: 0,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
      return;
    }

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
  }, [debouncedQuery, viewportZoom]);

  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        className="h-[calc(100vh-0px)] w-full relative"
      ></div>
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
