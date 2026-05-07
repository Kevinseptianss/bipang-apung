"use client";
import { FaClock, FaTimes, FaCheck } from "react-icons/fa";

export default function PremiumTimePicker({ value, onChange, onClose }) {
  const timeSlots = [
    { label: "10:00 AM WIB", value: "10:00" },
    { label: "12:00 PM WIB", value: "12:00" },
    { label: "05:00 PM WIB", value: "17:00" },
    { label: "07:00 PM WIB", value: "19:00" }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-gray-900 w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Pilih Waktu
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="p-6 space-y-3">
          {timeSlots.map((slot) => {
            const isSelected = value === slot.value;
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => {
                  onChange(slot.value);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border transition-all flex justify-between items-center group
                  ${isSelected 
                    ? "bg-orange-500/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${isSelected ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 group-hover:text-white"}
                  `}>
                    <FaClock size={16} />
                  </div>
                  <span className={`font-semibold ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                    {slot.label}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <FaCheck size={10} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
          <p className="text-[10px] text-gray-500">Waktu pengiriman mengikuti jadwal kurir</p>
        </div>
      </div>
    </div>
  );
}
