"use client";
import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { logos, colorMapping, CloudProvider } from "@/lib/constants";

const CloudServerMarker = ({
  map,
  lngLat,
  provider,
  country,
  code,
}: {
  map: mapboxgl.Map | null;
  lngLat: [number, number];
  provider: CloudProvider;
  country: string;
  code: string;
}) => {
  useEffect(() => {
    if (!map || !provider || !lngLat) return;

    const element = document.createElement("div");
    element.className = "custom-marker";
    element.style.width = "12px";
    element.style.height = "12px";
    element.style.borderRadius = "50%";
    element.style.backgroundColor = `${colorMapping[provider]}`;

    const marker = new mapboxgl.Marker(element)
      .setLngLat(lngLat)
      .addTo(map as mapboxgl.Map);

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    const el = marker.getElement();
    el.addEventListener("mouseenter", () => {
      popup
        .setLngLat(lngLat)
        .setHTML(
          `
          <div class="popup-container">
            <div class="popup-header">
              <img src="${logos[provider]}" alt="${provider}" class="popup-org-logo" />
              <div class="popup-org-info">
                <h3>${provider}</h3>
                <p class="popup-provider">
                  <span>${code}</span>
                </p>
              </div>
            </div>
            <div class="popup-location">
              <span>📍 ${country}</span>
            </div>
          </div>
        `
        )
        .addTo(map as mapboxgl.Map);
    });

    el.addEventListener("mouseleave", () => {
      popup.remove();
    });

    return () => {
      popup.remove();
      marker.remove();
    };
  }, []);

  return null;
};

export default CloudServerMarker;
