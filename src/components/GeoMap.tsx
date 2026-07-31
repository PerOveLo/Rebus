import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ARRIVAL_RADIUS_M } from '../services/geo';
import type { GeoPos } from '../types';

export interface GeoMapPost {
  number: number;
  symbol: string;
  pos: GeoPos;
  done?: boolean;
  isNext?: boolean;
}

export interface GeoMapProps {
  center: GeoPos;
  posts: GeoMapPost[];
  userPos?: GeoPos | null;
  routeFrom?: GeoPos | null; // stiplet linje fra forrige post/lagets posisjon
  editable?: boolean;
  onMove?: (postNumber: number, pos: GeoPos) => void;
  onSelect?: (postNumber: number) => void;
  onViewChange?: (center: GeoPos) => void; // kalles når spillleder panorerer/zoomer
  height?: number;
}

// Ekte kart (Leaflet) med gratis fliser: Esri World Imagery (satellitt)
// og OpenStreetMap. Ingen API-nøkler. Posisjonsdata forblir på telefonen.
export function GeoMap({
  center,
  posts,
  userPos,
  routeFrom,
  editable = false,
  onMove,
  onSelect,
  onViewChange,
  height = 380,
}: GeoMapProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef(false);

  // Init
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { zoomControl: true, attributionControl: true });
    map.setView([center.lat, center.lng], 17);

    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Bilder © Esri' },
    );
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    });
    satellite.addTo(map);
    L.control.layers({ '🛰️ Satellitt': satellite, '🗺️ Kart': streets }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on('moveend', () => {
      const c = map.getCenter();
      onViewChangeRef.current?.({ lat: Number(c.lat.toFixed(6)), lng: Number(c.lng.toFixed(6)) });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Følg sentrum ved store hopp (f.eks. etter adressesøk)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], map.getZoom() || 17);
  }, [center.lat, center.lng]);

  // Tegn innhold
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const next = posts.find((p) => p.isNext);

    // Stiplet rute mot neste post
    if (next && routeFrom) {
      L.polyline(
        [
          [routeFrom.lat, routeFrom.lng],
          [next.pos.lat, next.pos.lng],
        ],
        { color: '#f4553f', weight: 4, dashArray: '8 10', opacity: 0.9 },
      ).addTo(layer);
    }

    // «Fremme»-sirkel rundt neste post
    if (next) {
      L.circle([next.pos.lat, next.pos.lng], {
        radius: ARRIVAL_RADIUS_M,
        color: '#f4553f',
        weight: 2,
        fillColor: '#ffc94d',
        fillOpacity: 0.25,
      }).addTo(layer);
    }

    for (const p of posts) {
      const cls = p.done ? 'geo-pin geo-pin-done' : p.isNext ? 'geo-pin geo-pin-next' : 'geo-pin';
      const html = `<div class="${cls}"><span class="geo-pin-num">${p.done ? '✓' : p.number}</span><span class="geo-pin-emoji">${p.isNext || editable ? p.symbol : ''}</span></div>`;
      const marker = L.marker([p.pos.lat, p.pos.lng], {
        draggable: editable,
        icon: L.divIcon({ className: 'geo-pin-wrap', html, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: `Post ${p.number}`,
      }).addTo(layer);
      if (editable && onMove) {
        marker.on('dragend', () => {
          const ll = marker.getLatLng();
          onMove(p.number, { lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) });
        });
      }
      if (onSelect) marker.on('click', () => onSelect(p.number));
    }

    if (userPos) {
      L.marker([userPos.lat, userPos.lng], {
        icon: L.divIcon({
          className: 'geo-pin-wrap',
          html: '<div class="geo-user">📍</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 30],
        }),
        title: 'Dere er her',
      }).addTo(layer);
    }

    // Første gang: zoom slik at alle postene er synlige
    if (!fittedRef.current && posts.length > 0) {
      fittedRef.current = true;
      const bounds = L.latLngBounds(posts.map((p) => [p.pos.lat, p.pos.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25), { maxZoom: 18 });
    }
  }, [posts, userPos, routeFrom, editable, onMove, onSelect]);

  return (
    <div
      ref={divRef}
      className="map-frame"
      style={{ height, width: '100%' }}
      aria-label="GPS-kart over rebusområdet"
    />
  );
}
