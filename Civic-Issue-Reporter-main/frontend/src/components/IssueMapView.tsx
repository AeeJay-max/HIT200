import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Issue {
    _id: string;
    title: string;
    location: { latitude: number; longitude: number; address: string };
    status: string;
    type: string;
}

interface IssueMapViewProps {
    issues: Issue[];
}

const IssueMapView: React.FC<IssueMapViewProps> = ({ issues }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number]>([31.0530, -17.8248]); // Default Harare

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                (error) => console.warn("Geolocation denied or error", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        if (!mapContainer.current) return;

        if (!mapRef.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,
                style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
                center: userLocation,
                zoom: 11,
            });

            mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        } else {
            // Update center if it was dynamically fetched later and map already exists
            mapRef.current.setCenter(userLocation);
        }

        // Clear old markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        issues.forEach(issue => {
            // Color coding
            let color = "#3b82f6"; // blue - default
            if (issue.status === "Resolved") color = "#22c55e"; // green
            else if (issue.status === "Rejected") color = "#ef4444"; // red
            else if (issue.status === "Pending") color = "#f59e0b"; // yellow
            else if (issue.status === "In Progress") color = "#3b82f6"; // blue
            else if (issue.status === "Reported") color = "#a855f7"; // purple

            // Ensure valid coords
            if (issue.location && typeof issue.location.longitude === "number" && typeof issue.location.latitude === "number") {
                const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                    `<strong>${issue.title}</strong><br/>
           Status: <em>${issue.status}</em><br/>
           Type: ${issue.type}`
                );

                const marker = new maplibregl.Marker({ color })
                    .setLngLat([issue.location.longitude, issue.location.latitude])
                    .setPopup(popup)
                    .addTo(mapRef.current!);

                markersRef.current.push(marker);
            }
        });

    }, [issues, userLocation]);

    return <div ref={mapContainer} style={{ width: "100%", height: "600px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }} />;
};

export default IssueMapView;
