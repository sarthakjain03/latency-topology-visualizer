"use client";
import { useRef, useEffect, useState } from "react";
import ExchangeMarker from "./ExchangeMarker";
import CloudServerMarker from "./CloudServerMarker";
import Legend from "./Legend";
import LatencyConnections from "./LatencyConnections";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import exchanges from "@/data/exchanges.json";
import cloudRegions from "@/data/cloudRegions.json";

mapboxgl.accessToken = process.env.NEXT_MAPBOX_ACCESS_TOKEN;

const cloudFlareAccessToken = process.env.NEXT_CLOUDFLARE_API_TOKEN;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [parentMapRef, setParentMapRef] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        projection: "globe",
        zoom: 2,
        center: [-90, 40],
      });

      mapRef.current = map;

      if (map) {
        map.on("load", () => {
          setIsMapReady(true);
          setParentMapRef(map);
        });
      }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  return (
    <>
      <div id="map-container" className="h-full" ref={mapContainerRef}></div>
      {isMapReady &&
        parentMapRef &&
        exchanges?.map((exchange) => (
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
      {isMapReady &&
        parentMapRef &&
        cloudRegions?.map((cloudData) =>
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
      {isMapReady && <Legend />}
      {parentMapRef && <LatencyConnections map={parentMapRef} />}
    </>
  );
};

export default Map;
