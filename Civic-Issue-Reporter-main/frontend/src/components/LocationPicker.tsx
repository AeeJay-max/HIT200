import React, { useEffect, useRef } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  location: Location | null;
  onChange: (location: Location) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const marker = useRef<Marker | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    const initMap = (lng: number, lat: number) => {
      if (map.current) return;
      map.current = new maplibregl.Map({
        container: mapContainer.current!,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [lng, lat],
        zoom: 12,
      });

      marker.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        const lngLat = marker.current!.getLngLat();
        onChange({ latitude: lngLat.lat, longitude: lngLat.lng });
      });

      map.current.on("click", (e) => {
        marker.current!.setLngLat(e.lngLat);
        onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
      });
    };

    if (location) {
      initMap(location.longitude, location.latitude);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            initMap(position.coords.longitude, position.coords.latitude);
          },
          () => {
            initMap(-74.006, 40.7128); // Fallback to NYC
          },
          { enableHighAccuracy: true }
        );
      } else {
        initMap(-74.006, 40.7128);
      }
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [location, onChange]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "300px",
        borderRadius: 8,
        overflow: "hidden",
      }}
    />
  );
};

export default LocationPicker;
