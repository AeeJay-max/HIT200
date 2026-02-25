import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOXGL_ACCESS_TOKEN;

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initializeMap = (lng: number, lat: number) => {
      if (!mapContainer.current || mapRef.current) return;

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [lng, lat],
        zoom: 12,
      });

      // Change cursor on hover over map
      mapRef.current.on("mouseenter", () => {
        mapRef.current!.getCanvas().style.cursor = "crosshair";
      });
      mapRef.current.on("mouseleave", () => {
        mapRef.current!.getCanvas().style.cursor = "";
      });

      mapRef.current.on("click", async (e) => {
        const { lng, lat } = e.lngLat;

        // Update or create the marker - make it draggable
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          markerRef.current = new maplibregl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);

          // Change cursor while dragging marker
          markerRef.current.on("dragstart", () => {
            if (mapRef.current)
              mapRef.current.getCanvas().style.cursor = "grabbing";
          });

          markerRef.current.on("dragend", async () => {
            if (mapRef.current)
              mapRef.current.getCanvas().style.cursor = "crosshair";

            const lngLat = markerRef.current!.getLngLat();
            const address = await reverseGeocode(lngLat.lng, lngLat.lat);
            onLocationSelect(lngLat.lat, lngLat.lng, address);
          });
        }

        const address = await reverseGeocode(lng, lat);
        onLocationSelect(lat, lng, address);
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initializeMap(position.coords.longitude, position.coords.latitude);
        },
        () => {
          initializeMap(77.757218, 20.932185); // Fallback to Bangalore
        },
        { enableHighAccuracy: true }
      );
    } else {
      initializeMap(77.757218, 20.932185);
    }

    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onLocationSelect]);

  async function reverseGeocode(lng: number, lat: number) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      return data.features && data.features[0]
        ? data.features[0].place_name
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default MapComponent;
