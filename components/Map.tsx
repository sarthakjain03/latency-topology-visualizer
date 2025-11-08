"use client";
import { useRef, useEffect, useState } from "react";
import Marker from "./Marker";
import Legend from "./Legend";
import LatencyConnections from "./LatencyConnections";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import exchanges from "@/data/exchanges.json";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FydGhha2oyMyIsImEiOiJjbWhuaGxiZXcwMGluMmpzaThoYTgwdmU5In0.h3k75-UOrlY0-C0AQHccQw";

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
      {parentMapRef && <LatencyConnections map={parentMapRef} />}
    </>
  );
};

export default Map;
