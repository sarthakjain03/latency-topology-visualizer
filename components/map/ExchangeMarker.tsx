"use client";
import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { logos, colorMapping, CloudProvider } from "@/lib/constants";

const ExchangeMarker = ({
  map,
  lngLat,
  provider,
  crytoOrg,
  imageUrl,
  city,
  country,
}: {
  map: mapboxgl.Map | null;
  lngLat: [number, number];
  provider: CloudProvider;
  crytoOrg: string;
  imageUrl: string;
  city: string;
  country: string;
}) => {
  useEffect(() => {
    if (!map || !provider || !lngLat) return;

    const element = document.createElement("div");
    element.className = "custom-marker";
    element.style.width = "36px";
    element.style.height = "36px";
    element.style.borderRadius = "50%";
    element.style.overflow = "hidden";
    element.style.border = `3px solid ${colorMapping[provider]}`;
    element.style.backgroundColor = "white";
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";

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
              <img src="${imageUrl}" alt="${crytoOrg}" class="popup-org-logo" />
              <div class="popup-org-info">
                <h3>${crytoOrg}</h3>
                <p class="popup-provider">
                  <img src="${logos[provider]}" alt="${provider}" class="popup-provider-logo" />
                  <span>${provider}</span>
                </p>
              </div>
            </div>
            <div class="popup-location">
              <span>📍 ${city}, ${country}</span>
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
      popup?.remove();
      marker?.remove();
    };
  }, []);

  return null;
};

export default ExchangeMarker;
