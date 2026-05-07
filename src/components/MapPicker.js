"use client";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { FaTimes, FaCheck, FaLocationArrow, FaExclamationTriangle, FaSearch, FaSpinner, FaMapMarkerAlt } from "react-icons/fa";

// Fix for default marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({ onMove }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMove(center.lat, center.lng);
    },
  });
  return null;
}

export default function MapPicker({ onSelect, onClose }) {
  const [position, setPosition] = useState({ lat: -6.993944, lng: 110.462 }); // Default to Shop Center
  const [address, setAddress] = useState("Mencari alamat...");
  const [isReady, setIsReady] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingResults, setIsSearchingResults] = useState(false);

  const fetchAddress = async (lat, lng) => {
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      } else {
        setAddress("Alamat tidak ditemukan");
      }
    } catch (err) {
      setAddress("Gagal mengambil alamat");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length < 3) {
      setSearchResults([]);
    }
  };

  const performSearch = async (query) => {
    if (!query || query.length < 3) return;

    setIsSearchingResults(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`
      );
      setSearchResults(response.data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearchingResults(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        performSearch(searchQuery);
      }
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSearchResult = (result) => {
    const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setPosition(newPos);
    setSearchQuery("");
    setSearchResults([]);
    if (mapInstance) {
      mapInstance.setView([newPos.lat, newPos.lng], 16);
    }
  };

  // Fetch address when position stabilizes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAddress(position.lat, position.lng);
    }, 500);
    return () => clearTimeout(timer);
  }, [position]);

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        if (mapInstance) {
          mapInstance.setView([newPos.lat, newPos.lng], 16);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationError("Izin lokasi diblokir. Klik ikon gembok (lock) di atas/samping alamat bar, lalu ubah Izin Lokasi menjadi 'Izinkan' (Allow).");
        } else {
          setLocationError("Gagal mendapatkan lokasi. Silakan coba lagi atau geser peta manual.");
        }
      }
    );
  };

  useEffect(() => {
    handleGetMyLocation();
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-gray-900 w-full md:max-w-xl md:rounded-3xl md:m-4 overflow-hidden border-white/20 shadow-2xl flex flex-col h-full md:h-[85vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
          <h3 className="font-bold text-white text-sm">Pilih Lokasi Pengiriman</h3>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white bg-white/10 rounded-full">
            <FaTimes size={12} />
          </button>
        </div>

        <div className="flex-1 relative">
          {/* Search Box */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-[90%] max-w-sm">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearchingResults ? (
                  <FaSpinner className="animate-spin text-orange-500" />
                ) : (
                  <FaSearch className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                placeholder="Cari alamat atau tempat..."
                className="w-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-sm rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-xl"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left p-3 hover:bg-white/10 flex items-start gap-3 border-b border-white/5 last:border-0 transition-colors"
                    >
                      <FaMapMarkerAlt className="text-orange-500 mt-1 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs text-white font-medium line-clamp-1">{result.display_name.split(',')[0]}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{result.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={15} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            ref={setMapInstance}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMove={(lat, lng) => setPosition({ lat, lng })} />
          </MapContainer>
          
          {/* Static Center Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none mb-2">
            <div className="relative">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/40 blur-[2px] rounded-full" />
            </div>
          </div>

          {/* Location Action Buttons */}
          <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={handleGetMyLocation}
              className="w-10 h-10 bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all"
              title="Lokasi Saya"
            >
              <FaLocationArrow size={14} />
            </button>
          </div>

          {locationError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%]">
              <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] p-2 rounded-lg flex items-center gap-2 shadow-lg border border-white/20">
                <FaExclamationTriangle className="shrink-0" />
                <p>{locationError}</p>
                <button onClick={() => setLocationError(null)} className="ml-auto underline">Tutup</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 space-y-4">
          <div className="text-[11px] text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10 min-h-[60px] flex items-center">
            {isSearching ? (
              <div className="flex items-center gap-2 text-orange-400 italic">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                Mencari alamat...
              </div>
            ) : (
              <p className="line-clamp-2 leading-relaxed">{address}</p>
            )}
          </div>
          <button 
            onClick={() => onSelect(position.lat, position.lng)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <FaCheck />
            Konfirmasi Lokasi Ini
          </button>
        </div>
      </div>
    </div>
  );
}
