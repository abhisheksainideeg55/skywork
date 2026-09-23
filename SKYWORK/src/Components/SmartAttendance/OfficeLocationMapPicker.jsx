import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Navigation,
  MapPin,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
  Building2,
  Crosshair,
  Sparkles,
  X,
  Compass,
} from 'lucide-react';

// Fix Leaflet's default icon path issue with bundlers (Vite)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [28, 44],
  iconAnchor: [14, 44],
  popupAnchor: [0, -40],
  shadowSize: [44, 44],
});
L.Marker.prototype.options.icon = DefaultIcon;

const QUICK_CITIES = [
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Noida', lat: 28.5355, lng: 77.391 },
  { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
];

export const OfficeLocationMapPicker = ({
  latitude,
  longitude,
  radius = 50,
  officeName = '',
  address = '',
  onChange, // ({ latitude, longitude, address, name })
}) => {
  const mapContainerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const popupRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedAddressName, setSelectedAddressName] = useState(address || '');

  const currentLat = Number(latitude) || 26.9124;
  const currentLng = Number(longitude) || 75.7873;
  const currentRadius = Number(radius) || 50;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marker
      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        title: officeName || 'Office Geofence Center',
      }).addTo(map);

      // Popup
      marker.bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: 600; text-align: center;">
          📍 <strong>${officeName || 'Office Location'}</strong><br/>
          <span style="font-size: 10px; color: #4f46e5; font-weight: normal;">Drag pin or click map to move</span>
        </div>`
      );

      // Radius Circle
      const circle = L.circle([currentLat, currentLng], {
        radius: currentRadius,
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.22,
        weight: 2.5,
        dashArray: '4, 6',
      }).addTo(map);

      // Disable click propagation on the search container so clicking inside search dropdown does not trigger map click
      if (searchContainerRef.current) {
        L.DomEvent.disableClickPropagation(searchContainerRef.current);
        L.DomEvent.disableScrollPropagation(searchContainerRef.current);
      }

      // Reverse geocode helper
      const reverseGeocode = async (lat, lng) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );
          const data = await res.json();
          if (data && data.display_name) {
            setSelectedAddressName(data.display_name);
            if (onChange) {
              onChange({
                latitude: Number(lat.toFixed(6)),
                longitude: Number(lng.toFixed(6)),
                address: data.display_name,
              });
            }
          }
        } catch (e) {
          // Ignore reverse geocode failures
        }
      };

      // Marker drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        circle.setLatLng(pos);
        const lat = Number(pos.lat.toFixed(6));
        const lng = Number(pos.lng.toFixed(6));
        if (onChange) {
          onChange({
            latitude: lat,
            longitude: lng,
          });
        }
        reverseGeocode(lat, lng);
      });

      // Map click event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const formattedLat = Number(lat.toFixed(6));
        const formattedLng = Number(lng.toFixed(6));
        marker.setLatLng([formattedLat, formattedLng]);
        circle.setLatLng([formattedLat, formattedLng]);
        if (onChange) {
          onChange({
            latitude: formattedLat,
            longitude: formattedLng,
          });
        }
        reverseGeocode(formattedLat, formattedLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      // Invalidate size after modal render
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when coordinates or radius change from parent
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      const latLng = [currentLat, currentLng];
      markerRef.current.setLatLng(latLng);
      circleRef.current.setLatLng(latLng);
      circleRef.current.setRadius(currentRadius);
    }
  }, [currentLat, currentLng, currentRadius]);

  // Live Debounced Search Function (Nominatim + Photon fallback)
  const executeSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // 1. Try OpenStreetMap Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&limit=6&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
        setIsSearching(false);
        return;
      }

      // 2. Fallback to Photon (Komoot) for fast fuzzy geocoding
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6`
      );
      const photonData = await photonRes.json();
      if (photonData && photonData.features && photonData.features.length > 0) {
        const mapped = photonData.features.map((f) => {
          const p = f.properties;
          const name = [p.name, p.street, p.city || p.district, p.state, p.country]
            .filter(Boolean)
            .join(', ');
          return {
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            display_name: name || p.name,
          };
        });
        setSearchResults(mapped);
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle typing in search box with debounce
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowResults(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    executeSearch(searchQuery);
  };

  // Select item from search results
  const selectSearchResult = (item) => {
    const lat = Number(parseFloat(item.lat).toFixed(6));
    const lng = Number(parseFloat(item.lon).toFixed(6));
    const addressName = item.display_name;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.openPopup();
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
      }
    }

    setSelectedAddressName(addressName);
    setSearchQuery(addressName.split(',')[0]);
    setShowResults(false);

    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lng,
        address: addressName,
      });
    }
  };

  // Select Quick City
  const handleSelectQuickCity = (city) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 16, { duration: 1.0 });
      if (markerRef.current) markerRef.current.setLatLng([city.lat, city.lng]);
      if (circleRef.current) circleRef.current.setLatLng([city.lat, city.lng]);
    }
    setSearchQuery(city.name);
    setSelectedAddressName(`${city.name}, India`);
    if (onChange) {
      onChange({
        latitude: city.lat,
        longitude: city.lng,
        address: `${city.name}, India`,
      });
    }
  };

  // Center Pin at Current Map Center
  const handleCenterPinOnMap = () => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    const lat = Number(center.lat.toFixed(6));
    const lng = Number(center.lng.toFixed(6));

    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current) circleRef.current.setLatLng([lat, lng]);

    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lng,
      });
    }
  };

  // Locate Current Device GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
          );
          const data = await res.json();
          const detectedAddr = data?.display_name || 'Current Device Location';
          setSelectedAddressName(detectedAddr);
          setSearchQuery(detectedAddr.split(',')[0]);

          if (onChange) {
            onChange({
              latitude: lat,
              longitude: lng,
              address: detectedAddr,
            });
          }
        } catch {
          if (onChange) {
            onChange({ latitude: lat, longitude: lng });
          }
        }
        setIsLocating(false);
      },
      (err) => {
        alert(err.message || 'Unable to retrieve your current location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Quick City Jumper Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
        <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center shrink-0 mr-1">
          <Compass className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Jump to:
        </span>
        {QUICK_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleSelectQuickCity(city)}
            className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/70 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 text-gray-700 dark:text-gray-300 transition shrink-0 font-medium border border-gray-200 dark:border-gray-600"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Main Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-900/60 bg-gray-100 dark:bg-gray-900 shadow-md">
        {/* Floating Search Bar */}
        <div
          ref={searchContainerRef}
          className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto"
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <input
                type="text"
                placeholder="Type office address, building, or area (e.g. Malviya Nagar Jaipur)..."
                value={searchQuery}
                onChange={handleQueryChange}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              <span>Find</span>
            </button>

            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Use current device GPS position"
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-xl border border-gray-300 dark:border-gray-600 transition shrink-0 flex items-center justify-center"
            >
              <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </form>

          {/* Autocomplete Search Dropdown */}
          {showResults && (
            <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-100 dark:border-gray-700 max-h-56 overflow-y-auto z-[1001] divide-y divide-gray-100 dark:divide-gray-700">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/40 flex items-start gap-2.5 transition text-gray-800 dark:text-gray-200 group"
                  >
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-gray-900 dark:text-white">
                        {item.display_name.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.display_name}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  {isSearching ? 'Searching location...' : 'No locations found. Try another search.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Element */}
        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0 cursor-crosshair" />

        {/* Floating Controls (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleCenterPinOnMap}
            title="Place pin in the center of the screen"
            className="p-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition flex items-center justify-center"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Coordinate & Geofence Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-gray-900/90 text-white backdrop-blur-md px-3 py-2 rounded-xl text-xs font-mono shadow-xl border border-white/15 pointer-events-none flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            Lat: {currentLat.toFixed(5)}, Lng: {currentLng.toFixed(5)} • Geofence: {currentRadius}m
          </span>
        </div>

        {/* Tip Indicator */}
        <div className="absolute top-16 left-3 z-[999] bg-indigo-950/90 text-indigo-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-lg pointer-events-none border border-indigo-400/20 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-300 shrink-0" />
          <span>Click anywhere on the map or drag the blue pin to pinpoint office location</span>
        </div>
      </div>
    </div>
  );
};

export default OfficeLocationMapPicker;
