"use client";
import { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes, FaCalendarAlt } from "react-icons/fa";

export default function PremiumDatePicker({ value, onChange, minDate, onClose }) {
  // Safe date parsing for YYYY-MM-DD
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const min = useMemo(() => parseDateString(minDate), [minDate]);
  const [currentDate, setCurrentDate] = useState(() => {
    const initial = parseDateString(value);
    // If current value is less than min, start at min
    return initial < min ? new Date(min) : initial;
  });

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    // Don't go before min month
    if (prevMonth.getFullYear() < min.getFullYear() || 
       (prevMonth.getFullYear() === min.getFullYear() && prevMonth.getMonth() < min.getMonth())) {
      return;
    }
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSelected = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const selected = parseDateString(value);
    return d.toDateString() === selected.toDateString();
  };

  const isToday = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d.toDateString() === new Date().toDateString();
  };

  const isDisabled = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    const m = new Date(min);
    m.setHours(0, 0, 0, 0);
    return d < m;
  };

  const handleSelect = (day) => {
    if (isDisabled(day)) return;
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, "0");
    const date = String(selected.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${date}`);
    onClose();
  };

  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-10 w-10" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const disabled = isDisabled(d);
    const selected = isSelected(d);
    const today = isToday(d);

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => handleSelect(d)}
        disabled={disabled}
        className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all transform active:scale-90
          ${selected 
            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-110 z-10" 
            : disabled 
              ? "text-gray-600 cursor-not-allowed opacity-30" 
              : "text-white hover:bg-white/10 hover:text-orange-400"
          }
          ${today && !selected ? "border border-orange-500/50 text-orange-400" : ""}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-gray-900 w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" />
              Pilih Tanggal
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="flex justify-between items-center bg-black/40 rounded-2xl p-2 border border-white/5">
            <button 
              onClick={handlePrevMonth}
              className={`p-2 transition-all rounded-xl ${
                currentDate.getFullYear() === min.getFullYear() && currentDate.getMonth() === min.getMonth()
                ? "text-gray-700 cursor-not-allowed"
                : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <FaChevronLeft size={12} />
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{monthNames[currentDate.getMonth()]}</p>
              <p className="text-gray-500 text-[10px] font-mono">{currentDate.getFullYear()}</p>
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
              <div key={i} className="h-8 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
          <p className="text-[10px] text-gray-500">
            Minimal pemesanan H+{Math.ceil((min.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))}
          </p>
        </div>
      </div>
    </div>
  );
}
