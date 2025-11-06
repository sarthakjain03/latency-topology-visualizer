import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const markerColorsBasedOnServers = {
  AWS: "blue",
  GCP: "red",
  Azure: "green",
};
const rotations = [-45, 0, 0, 0, 45];

const Marker = ({
  map,
  lngLat,
  index,
  provider,
}: {
  map: mapboxgl.Map | null;
  lngLat: [number, number];
  provider: "AWS" | "GCP" | "Azure";
  index: number;
}) => {
  useEffect(() => {
    if (map && provider && lngLat) {
      new mapboxgl.Marker({
        color:
          markerColorsBasedOnServers[
            provider as keyof typeof markerColorsBasedOnServers
          ],
        rotation: rotations[index],
      })
        .setLngLat(lngLat)
        .addTo(map as mapboxgl.Map);
    }
  }, []);

  return <div>Hello</div>;
};

export default Marker;
