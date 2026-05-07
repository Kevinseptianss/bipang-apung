"use client";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FaTimes, FaCheck } from "react-icons/fa";

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
  const [position, setPosition] = useState({ lat: -6.9932, lng: 110.4203 }); // Default Semarang center
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Try to get user location for initial center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsReady(true);
      }, () => {
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
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
          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={15} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
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
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 space-y-4">
          <div className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="font-mono text-[10px]">Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}</p>
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
