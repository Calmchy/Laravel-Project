import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { dotIcon, OSM_ATTRIBUTION, OSM_TILES, PIN_COLORS } from '@/lib/map';

type Point = { lat: number | null; lng: number | null };

/**
 * Small READ-ONLY map for the review step: shows the pick-up and return pins and the line between them.
 * Dragging/zooming is disabled so it behaves like a picture, not a second picker.
 */
export default function RouteMap({ pickup, ret, className = '' }: { pickup: Point; ret: Point; className?: string }) {
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!box.current) {
            return;
        }

        const map = L.map(box.current, {
            zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
            boxZoom: false, keyboard: false, touchZoom: false,
        });
        L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);

        const points: L.LatLngTuple[] = [];
        const pin = (p: Point, color: string) => {
            if (p.lat !== null && p.lng !== null) {
                L.marker([p.lat, p.lng], { icon: dotIcon(color), interactive: false }).addTo(map);
                points.push([p.lat, p.lng]);
            }
        };
        pin(pickup, PIN_COLORS.pickup);
        pin(ret, PIN_COLORS.return);

        if (points.length === 2) {
            L.polyline(points, { color: PIN_COLORS.pickup, weight: 3, dashArray: '8 8' }).addTo(map);
        }

        if (points.length) {
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
        } else {
            map.setView([11.0, 124.9], 8); // no points chosen: show central Leyte
        }

        return () => {
            map.remove();
        };
    }, [pickup.lat, pickup.lng, ret.lat, ret.lng]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={box} className={`z-0 overflow-hidden rounded-xl ${className}`} aria-label="Route map" />;
}
