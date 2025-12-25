// src/components/LeafletPropertyMap.tsx - Free map with OpenStreetMap (no API key!)
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths for Vite bundler
// This is a known issue: Vite doesn't handle Leaflet's default icon paths correctly
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
  id: string;
  mlsNumber?: string;
  title: string;
  price: string;
  beds: number;
  baths: number;
  location: string;
  latitude: number;
  longitude: number;
  image: string;
}

interface LeafletPropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const LeafletPropertyMap = ({ 
  properties, 
  center = { lat: 23.0545, lng: -109.7084 }, 
  zoom = 11 
}: LeafletPropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[LeafletMap] Component mounted, starting initialization');
    console.log('[LeafletMap] mapRef.current:', mapRef.current);
    console.log('[LeafletMap] Leaflet L available:', typeof L !== 'undefined');

    // Initialize map with bundled Leaflet
    initializeMap();

    return () => {
      console.log('[LeafletMap] Component unmounting, cleaning up map');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [properties]);

  const initializeMap = () => {
    console.log('[LeafletMap] initializeMap() called');

    if (!mapRef.current) {
      console.error('[LeafletMap] mapRef.current is null, cannot initialize');
      return;
    }

    try {
      console.log('[LeafletMap] Creating map instance with options');

      // Create map with performance optimizations
      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      }).setView([center.lat, center.lng], zoom);

      console.log('[LeafletMap] Map instance created successfully');

      // Add OpenStreetMap tiles (free!) with performance optimizations
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2,
      }).addTo(map);

      console.log('[LeafletMap] Tile layer added');

      mapInstanceRef.current = map;
      console.log('[LeafletMap] Map stored in ref, initialization complete');

      // Add markers after map is ready
      if (properties.length > 0) {
        console.log(`[LeafletMap] Adding ${properties.length} markers`);
        updateMarkers();
      } else {
        console.log('[LeafletMap] No properties to add markers for');
      }
    } catch (error) {
      console.error('[LeafletMap] Error during map initialization:', error);
      console.error('[LeafletMap] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  const updateMarkers = () => {
    console.log('[LeafletMap] updateMarkers() called');

    if (!mapInstanceRef.current) {
      console.warn('[LeafletMap] Cannot update markers: map instance not ready');
      return;
    }

    try {
      console.log(`[LeafletMap] Clearing ${markersRef.current.length} existing markers`);

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      const bounds = L.latLngBounds([]);
      console.log(`[LeafletMap] Processing ${properties.length} properties for markers`);

    properties.forEach((property, index) => {
      if (!property.latitude || !property.longitude) return;

      // Create custom icon with number
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 40px;
              height: 40px;
              background: #DC2626;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 8px;
              left: 0;
              width: 40px;
              text-align: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              z-index: 1;
            ">${index + 1}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      // Create marker
      const marker = L.marker([property.latitude, property.longitude], { icon })
        .addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div style="min-width: 250px; max-width: 300px;">
          <img 
            src="${property.image}" 
            alt="${property.title}"
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
            onerror="this.src='https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=200&fit=crop'"
          />
          <div style="font-size: 18px; font-weight: bold; color: #7C3AED; margin-bottom: 4px;">
            ${property.price}
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            🛏️ ${property.beds} beds • 🛁 ${property.baths} baths
          </div>
          <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px; line-height: 1.3;">
            ${property.title}
          </div>
          <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
            📍 ${property.location}
          </div>
          <button 
            onclick="window.location.href='/property/${property.mlsNumber || property.id}'"
            style="
              width: 100%;
              background: #7C3AED;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            "
            onmouseover="this.style.background='#6D28D9'"
            onmouseout="this.style.background='#7C3AED'"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Open popup on hover
      marker.on('mouseover', function() {
        this.openPopup();
      });

      // Click to navigate
      marker.on('click', function() {
        // Popup will show with "View Details" button
      });

      markersRef.current.push(marker);
      bounds.extend([property.latitude, property.longitude]);
    });

      // Fit map to show all markers
      if (properties.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        console.log(`[LeafletMap] Fitted map bounds to show ${properties.length} markers`);
      }
    } catch (error) {
      console.error('[LeafletMap] Error updating markers:', error);
      console.error('[LeafletMap] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  return (
    <>
      <style>{`
        .leaflet-container {
          border-radius: 12px;
          z-index: 1;
        }
        .custom-marker {
          background: none;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 8px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      {!mapInstanceRef.current && (
        <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-[50vh] md:h-[600px] lg:h-[calc(100vh-8rem)] rounded-none md:rounded-xl border-none md:border md:border-border shadow-none md:shadow-lg"
        style={{ minHeight: '300px' }}
      />
    </>
  );
};

export default LeafletPropertyMap;
