import L from 'leaflet';

/** Pin colours: pick-up = brand teal, return = coral. Used by every map in the app. */
export const PIN_COLORS = { pickup: '#007f9e', return: '#ff6f61' } as const;

/** Plain coloured dot: avoids Leaflet's default pin images, which break under bundlers. */
export const dotIcon = (color: string) =>
    L.divIcon({
        className: '',
        html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
