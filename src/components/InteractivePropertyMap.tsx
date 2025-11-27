// src/components/InteractivePropertyMap.tsx - Google Maps with clickable pins
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface InteractivePropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const InteractivePropertyMap = ({ 
  properties, 
  center = { lat: 23.0545, lng: -109.7084 }, 
  zoom = 11 
}: InteractivePropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load Google Maps Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (mapRef.current && window.google) {
        initializeMap();
      }
    };

    // Check if script already exists
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    } else if (window.google) {
      initializeMap();
    }

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (map && window.google) {
      updateMarkers();
    }
  }, [properties, map]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);
  };

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    if (!map || !window.google) return;

    const newMarkers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    properties.forEach((property, index) => {
      if (!property.latitude || !property.longitude) return;

      const position = { 
        lat: property.latitude, 
        lng: property.longitude 
      };

      // Create marker
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: property.title,
        label: {
          text: String(index + 1),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#DC2626',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }
      });

      // Create info window content
      const infoContent = `
        <div style="max-width: 250px; padding: 8px;">
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
          >
            View Details
          </button>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });

      // Click marker to view property
      marker.addListener('click', () => {
        // Close all other info windows
        newMarkers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        // Open this info window
        infoWindow.open(map, marker);
      });

      // Hover to show info window
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      // Store info window reference
      marker.infoWindow = infoWindow;

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (properties.length > 0) {
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }

    setMarkers(newMarkers);
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[600px] rounded-xl border border-border shadow-lg"
      style={{ minHeight: '600px' }}
    />
  );
};

export default InteractivePropertyMap;
