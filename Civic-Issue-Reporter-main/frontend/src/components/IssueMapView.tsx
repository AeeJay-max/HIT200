import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_ACCESS_TOKEN;

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
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!mapContainer.current) return;

        if (!mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [31.0530, -17.8248], // Harare, Zimbabwe default
                zoom: 11,
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
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
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<strong>${issue.title}</strong><br/>
           Status: <em>${issue.status}</em><br/>
           Type: ${issue.type}`
                );

                const marker = new mapboxgl.Marker({ color })
                    .setLngLat([issue.location.longitude, issue.location.latitude])
                    .setPopup(popup)
                    .addTo(mapRef.current!);

                markersRef.current.push(marker);
            }
        });

    }, [issues]);

    return <div ref={mapContainer} style={{ width: "100%", height: "600px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }} />;
};

export default IssueMapView;
