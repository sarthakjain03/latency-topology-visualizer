"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import Marker from "./Marker";
import Legend from "./Legend";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Feature } from "geojson";

import exchanges from "@/data/exchanges.json";

interface ExchangeI {
  name: string;
  provider: string;
  region: string;
  coords: number[];
  city: string;
  country: string;
  note: string;
}

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FydGhha2oyMyIsImEiOiJjbWhuaGxiZXcwMGluMmpzaThoYTgwdmU5In0.h3k75-UOrlY0-C0AQHccQw";

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [parentMapRef, setParentMapRef] = useState<mapboxgl.Map | null>(null);

  const exchangeGeoData: Feature[] = useMemo(() => {
    return exchanges?.map((exchange: ExchangeI) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: exchange.coords },
      properties: {
        name: exchange.name,
        provider: exchange.provider,
        region: exchange.region,
        coords: exchange.coords,
        city: exchange.city,
        country: exchange.country,
        note: exchange.note,
      },
    }));
  }, []);

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

          // Add the source
          map!.addSource("exchanges", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: exchangeGeoData,
            },
          });

          // Add circle layer
          map!.addLayer({
            id: "exchange-points",
            type: "circle",
            source: "exchanges",
            paint: {
              "circle-radius": 6,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "latency"],
                0,
                "#22c55e", // green (low latency)
                50,
                "#facc15", // yellow (medium)
                100,
                "#ef4444", // red (high)
              ],
            },
          });
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
          <Marker
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
      {isMapReady && <Legend />}
    </>
  );
};

export default Map;
