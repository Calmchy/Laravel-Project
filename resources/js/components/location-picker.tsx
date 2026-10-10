import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dotIcon, OSM_ATTRIBUTION, OSM_TILES, PIN_COLORS } from '@/lib/map';

const COLORS = PIN_COLORS;

export type Place = { label: string; lat: number | null; lng: number | null };
type Which = 'pickup' | 'return';
type Props = {
    pickup: Place;
    ret: Place;
    onChange: (which: Which, place: Place) => void;
    /** Where the map opens first (city centre), falls back to Leyte. */
    center?: { lat: number; lng: number } | null;
};

const DEFAULT_CENTER = { lat: 11.0, lng: 124.9 }; // roughly central Leyte
const NOMINATIM = 'https://nominatim.openstreetmap.org';
/**
 * Map where the passenger chooses the pick-up and return points.
 *  1. Choose "Pick-up" or "Return", then CLICK the map (or search an address).
 *  2. "Live GPS" follows the phone/laptop position in REAL TIME (watchPosition) and can fill the active point.
 * Map tiles + address lookup come from OpenStreetMap (free, no API key).
 */
export default function LocationPicker({ pickup, ret, onChange, center }: Props) {
    const box = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const markers = useRef<Record<Which, L.Marker | null>>({ pickup: null, return: null });
    const route = useRef<L.Polyline | null>(null);
    const me = useRef<{ dot: L.CircleMarker; ring: L.Circle } | null>(null);
    const watchId = useRef<number | null>(null);
    const active = useRef<Which>('pickup');

    const [target, setTarget] = useState<Which>('pickup');
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [gps, setGps] = useState<{ on: boolean; lat?: number; lng?: number; acc?: number; error?: string }>({ on: false });
    const onChangeRef = useRef(onChange);
    useEffect(() => {
 onChangeRef.current = onChange; 
});
    useEffect(() => {
 active.current = target; 
}, [target]);

    /** Coordinates -> readable address (reverse geocoding). Falls back to raw coordinates if offline. */
    const addressFor = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17`, { headers: { Accept: 'application/json' } });
            const data = await res.json();

            return String(data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`).slice(0, 190);
        } catch {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, []);

    /** Save a point: tell the form immediately, then fill in the address when it arrives. */
    const setPoint = useCallback(async (which: Which, lat: number, lng: number, label?: string) => {
        onChangeRef.current(which, { label: label ?? 'Locating address…', lat, lng });

        if (!label) {
            onChangeRef.current(which, { label: await addressFor(lat, lng), lat, lng });
        }
    }, [addressFor]);

    // Create the map once.
    useEffect(() => {
        if (!box.current || map.current) {
            return;
        }

        const c = center ?? DEFAULT_CENTER;
        const m = L.map(box.current).setView([c.lat, c.lng], center ? 12 : 9);
        L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(m);
        m.on('click', (e: L.LeafletMouseEvent) => setPoint(active.current, e.latlng.lat, e.latlng.lng));
        map.current = m;

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current); // stop GPS when leaving the page
            }

            m.remove();
            map.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the two markers (and the line between them) in sync with the form values.
    useEffect(() => {
        const m = map.current;

        if (!m) {
            return;
        }

        (['pickup', 'return'] as Which[]).forEach((which) => {
            const p = which === 'pickup' ? pickup : ret;
            const existing = markers.current[which];

            if (p.lat === null || p.lng === null) {
                existing?.remove();
                markers.current[which] = null;

                return;
            }

            if (existing) {
                existing.setLatLng([p.lat, p.lng]);
            } else {
                // Markers are draggable: fine-tune the exact spot by dragging.
                const mk = L.marker([p.lat, p.lng], { icon: dotIcon(COLORS[which]), draggable: true, title: which === 'pickup' ? 'Pick-up' : 'Return' }).addTo(m);
                mk.on('dragend', () => setPoint(which, mk.getLatLng().lat, mk.getLatLng().lng));
                markers.current[which] = mk;
            }
        });

        route.current?.remove();
        route.current = null;

        if (pickup.lat !== null && pickup.lng !== null && ret.lat !== null && ret.lng !== null) {
            route.current = L.polyline([[pickup.lat, pickup.lng], [ret.lat, ret.lng]], { color: '#007f9e', weight: 3, dashArray: '8 8' }).addTo(m);
            m.fitBounds(route.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
        // Only the coordinates matter here; the labels change on every keystroke and must not rebuild markers.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickup.lat, pickup.lng, ret.lat, ret.lng, setPoint]);

    /** Search an address and drop the active point there. */
    const search = async () => {
        const q = query.trim();

        if (!q) {
            return;
        }

        setBusy(true);

        try {
            const res = await fetch(`${NOMINATIM}/search?format=jsonv2&limit=1&countrycodes=ph&q=${encodeURIComponent(q)}`);
            const [hit] = await res.json();

            if (hit) {
                const lat = Number(hit.lat), lng = Number(hit.lon);
                map.current?.setView([lat, lng], 16);
                await setPoint(active.current, lat, lng, String(hit.display_name).slice(0, 190));
            } else {
                setGps((g) => ({ ...g, error: 'No place found. Try a landmark or barangay name.' }));
            }
        } catch {
            setGps((g) => ({ ...g, error: 'Address search is unavailable right now. Click the map instead.' }));
        } finally {
            setBusy(false);
        }
    };

    /** Start / stop REAL-TIME GPS. The blue dot moves as the device moves. */
    const toggleGps = () => {
        if (gps.on && watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
            me.current?.dot.remove();
            me.current?.ring.remove();
            me.current = null;
            setGps({ on: false });

            return;
        }

        if (!('geolocation' in navigator)) {
            setGps({ on: false, error: 'This browser has no GPS support.' });

            return;
        }

        let first = true;
        watchId.current = navigator.geolocation.watchPosition(
            ({ coords }) => {
                const { latitude: lat, longitude: lng, accuracy: acc } = coords;
                setGps({ on: true, lat, lng, acc });

                if (!me.current && map.current) {
                    me.current = {
                        ring: L.circle([lat, lng], { radius: acc, color: '#007f9e', weight: 1, fillOpacity: 0.12 }).addTo(map.current),
                        dot: L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map.current),
                    };
                } else {
                    me.current?.dot.setLatLng([lat, lng]);
                    me.current?.ring.setLatLng([lat, lng]).setRadius(acc);
                }

                if (first) {
                    map.current?.setView([lat, lng], 16); // jump to the user once, then let them pan freely
                    first = false;
                }
            },
            (err) => {
                setGps({ on: false, error: err.code === err.PERMISSION_DENIED ? 'Location permission was denied. Allow it in your browser settings.' : 'Could not get your position. Try again outdoors.' });
                watchId.current = null;
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
        );
    };

    const tab = (which: Which, label: string) => (
        <button
            type="button"
            onClick={() => setTarget(which)}
            aria-pressed={target === which}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${target === which ? 'text-white shadow' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            style={target === which ? { backgroundColor: COLORS[which] } : undefined}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {tab('pickup', '① Set pick-up')}
                {tab('return', '② Set return')}
            </div>

            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault(); search(); 
} 
}}
                    placeholder={`Search a place for the ${target === 'pickup' ? 'pick-up' : 'return'} point…`}
                    className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
                <button type="button" onClick={search} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-teal-brand px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Search
                </button>
                <button
                    type="button"
                    onClick={toggleGps}
                    aria-pressed={gps.on}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition ${gps.on ? 'border-teal-brand bg-teal-brand/10 text-teal-brand' : 'hover:bg-muted'}`}
                >
                    <LocateFixed className="size-4" /> {gps.on ? 'GPS on' : 'Live GPS'}
                </button>
            </div>

            <div ref={box} className="z-0 h-80 w-full overflow-hidden rounded-xl border" aria-label="Map for choosing pick-up and return points" />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    {gps.on && gps.lat !== undefined
                        ? `Live position: ${gps.lat.toFixed(5)}, ${gps.lng?.toFixed(5)} (±${Math.round(gps.acc ?? 0)} m)`
                        : 'Click the map, drag a marker, or search to choose a point.'}
                </span>
                {gps.on && gps.lat !== undefined && gps.lng !== undefined && (
                    <button type="button" onClick={() => setPoint(target, gps.lat!, gps.lng!)} className="font-medium text-teal-brand hover:underline">
                        Use my position as {target === 'pickup' ? 'pick-up' : 'return'}
                    </button>
                )}
            </div>
            {gps.error && <p className="text-xs text-coral">{gps.error}</p>}
        </div>
    );
}
