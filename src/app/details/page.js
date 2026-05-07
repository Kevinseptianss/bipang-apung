"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaStickyNote, FaCalendarAlt, FaTruck, FaSpinner, FaStore, FaClock, FaGoogle, FaSignOutAlt, FaLock, FaMap, FaCheckCircle, FaSync } from "react-icons/fa";
import { auth, googleProvider, db } from "@/config/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ProfileHeader from "@/components/ProfileHeader";
import dynamic from "next/dynamic";
import PremiumDatePicker from "@/components/PremiumDatePicker";
import PremiumTimePicker from "@/components/PremiumTimePicker";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center text-white">Memuat Peta...</div>
});

export default function Details() {
  // Shop coordinates (6°59'38.2"S 110°27'43.2"E)
  const SHOP_COORDS = { lat: -6.993944, lng: 110.462 };

  const calculateLocalShippingFee = (jarakKm) => {
    const tarifMin = 15000; // Batas aman minimum
    const kmMin = 4;
    const tarifPerKm = 3500; // Batas aman per km

    if (jarakKm <= kmMin) {
      return tarifMin;
    } else {
      const sisaJarak = jarakKm - kmMin;
      return tarifMin + Math.ceil(sisaJarak * tarifPerKm);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  // Set minimum order date based on time cutoff (12:00 PM)
  const now = new Date();
  const currentHour = now.getHours();
  
  // If order is after 12:00 PM (Noon), minimum is H+2, else H+1
  const minDays = currentHour >= 12 ? 2 : 1;
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minDays);
  const tomorrowFormatted = minDate.toISOString().split("T")[0];

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderType] = useState("pickup");
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    note: "",
    date: tomorrowFormatted,
    time: "10:00",
    deliveryMethod: "Di Ambil di Toko",
    paymentMethod: "Pembayaran Online", // Always online payment
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Time slots for pickup and delivery
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  useEffect(() => {
    // Load cart and order type from localStorage
    const savedCart = localStorage.getItem("cart");
    const savedOrderType = localStorage.getItem("orderType") || "pickup";
    
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      const cartTotal = parsedCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotal(cartTotal);
    }
    
    setOrderType(savedOrderType);
    
    // Set default delivery method based on order type
    setFormData(prev => ({
      ...prev,
      deliveryMethod: savedOrderType === "pickup" ? "Di Ambil di Toko" : "Gojek, Maxim, Shopee, Bayar di tempat ongkirnya"
    }));

    // Listen for authentication state changes and fetch profile
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              ...prev,
              name: data.name || firebaseUser.displayName || "",
              phone: data.phone || "",
              address: data.address || "",
              note: data.note || ""
            }));
            
            if (data.coords && savedOrderType === "delivery") {
              setSelectedCoords(data.coords);
              const dist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lng, data.coords.lat, data.coords.lng);
              setDistance(dist.toFixed(1));
              const fee = calculateLocalShippingFee(dist);
              setSelectedRate({
                company: "Kurir Toko",
                type: "Delivery",
                price: fee,
                duration: "Estimasi 30-60 menit"
              });
            }
          } else {
            setFormData(prev => ({
              ...prev,
              name: firebaseUser.displayName || ""
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [orderType]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Gagal masuk dengan Google. Silakan coba lagi.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [distance, setDistance] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleMapSelect = async (lat, lng) => {
    setShowMap(false);
    setIsGettingLocation(true);
    setSelectedCoords({ lat, lng });
    
    // Calculate distance
    const dist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lng, lat, lng);
    setDistance(dist.toFixed(1));

    // Calculate Local Shipping Fee
    const fee = calculateLocalShippingFee(parseFloat(dist));
    setSelectedRate({
      company: "Kurir Toko",
      type: "Delivery",
      price: fee,
      duration: "Estimasi 30-60 menit"
    });

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: response.data.display_name
        }));
      }
    } catch (err) {
      setError("Gagal mendapatkan alamat dari peta. Silakan coba lagi.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });
        
        // Calculate distance
        const dist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lng, latitude, longitude);
        setDistance(dist.toFixed(1));

        // Calculate Local Shipping Fee
        const fee = calculateLocalShippingFee(parseFloat(dist));
        setSelectedRate({
          company: "Kurir Toko",
          type: "Delivery",
          price: fee,
          duration: "Estimasi 30-60 menit"
        });

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.data && response.data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: response.data.display_name
            }));
          } else {
            setError("Gagal mendapatkan detail alamat. Silakan gunakan peta.");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setError("Gagal mendapatkan alamat. Silakan gunakan peta.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsGettingLocation(false);
        if (err.code === 1) { // PERMISSION_DENIED
          setError("Izin lokasi diblokir. Klik ikon gembok (lock) di samping alamat browser Anda dan pilih 'Izinkan' (Allow) untuk menggunakan fitur ini.");
        } else {
          setError("Izin lokasi ditolak atau tidak tersedia. Silakan gunakan tombol 'Peta' untuk memilih manual.");
        }
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setError("Silakan masuk dengan Google terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        user: {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        },
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          address: orderType === "delivery" ? formData.address : "Ambil di Toko",
          note: formData.note
        },
        orderDetails: {
          type: orderType,
          date: formData.date,
          time: formData.time,
          deliveryMethod: orderType === "pickup" ? "Di Ambil di Toko" : formData.deliveryMethod
        },
        items: cart,
        totalAmount: total,
        paymentMethod: "Pembayaran Online", // Always online payment
        timestamp: new Date().toISOString()
      };

      const response = await axios.post("/api/createTransaction", orderData);
      
      if (response.data.success) {
        // Save/Update User Profile in Firestore
        try {
          await setDoc(doc(db, "users", user.uid), {
            name: formData.name,
            phone: formData.phone,
            address: orderType === "delivery" ? formData.address : "",
            note: formData.note,
            coords: selectedCoords,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        } catch (profileErr) {
          console.error("Error saving profile:", profileErr);
          // Don't block the transaction success even if profile save fails
        }

        setSuccess(true);
        console.log(response.data);
        localStorage.removeItem("cart");
        localStorage.removeItem("orderType");

        // Always prioritize Snap Popup if script is loaded
        if (window.snap && response.data.token) {
          window.snap.pay(response.data.token, {
            onSuccess: function(result) {
              window.location.href = `/cekorder/${response.data.orderId}`;
            },
            onPending: function(result) {
              window.location.href = `/cekorder/${response.data.orderId}`;
            },
            onError: function(result) {
              console.error("Payment error:", result);
            },
            onClose: function() {
              window.location.href = `/cekorder/${response.data.orderId}`;
            }
          });
        } else if (response.data.paymentUrl) {
          // Fallback to redirect
          window.location.href = response.data.paymentUrl;
        } else {
          setError("Gagal membuat link pembayaran");
        }
      } else {
        setError(response.data.message || "Gagal membuat transaksi");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={bg} 
          alt="background" 
          fill
          className="object-cover blur-[6px] scale-105 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <a href="/ordertype" className="flex items-center text-white hover:text-orange-400 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Kembali</span>
        </a>
        <h1 className="text-xl font-bold text-white">
          {orderType === "pickup" ? "Ambil di Tempat" : "Kirim ke Alamat"}
        </h1>
        
        <div className="hidden md:block">
          <ProfileHeader />
        </div>
      </header>

      <div className="relative z-10 flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <FaTruck className="mr-2 text-orange-400" />
                Ringkasan Pesanan
              </h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-white">
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-gray-300 text-sm"> x{item.quantity}</span>
                    </div>
                    <span className="text-orange-400 font-semibold">
                      Rp {(item.amount * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <span>Total:</span>
                    <span className="text-orange-400">Rp {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          {!user ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-lg font-bold text-white mb-4 text-center">
                Masuk untuk Melanjutkan Pesanan
              </h2>
              <p className="text-gray-300 text-sm text-center mb-6">
                Kami memerlukan akun Google Anda untuk menyimpan riwayat pesanan dan memudahkan pelacakan
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <FaGoogle className="mr-2 text-red-500" />
                Masuk dengan Google
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-green-500/20">
                <div className="flex items-center text-green-100">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">Masuk sebagai: {user.displayName}</p>
                    <p className="text-sm text-green-300">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2 text-lg">!</span>
                  {error}
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2 text-lg">✓</span>
                  Pesanan berhasil dibuat! Terima kasih.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaUser className="mr-2 text-orange-400" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              {/* Address - Only show for delivery */}
              {orderType === "delivery" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center text-white text-sm font-semibold">
                      <FaMapMarkerAlt className="mr-2 text-orange-400" />
                      Alamat Lengkap
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isGettingLocation}
                        className="text-[10px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-2 py-1 rounded-full border border-orange-500/30 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      >
                        {isGettingLocation ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaMapMarkerAlt />
                        )}
                        {isGettingLocation ? "Mencari..." : "Lokasi"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full border border-white/10 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <FaMap />
                        Peta
                      </button>
                    </div>
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    readOnly={orderType === "delivery"}
                    className={`w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all resize-none ${orderType === "delivery" ? "cursor-not-allowed opacity-80" : ""}`}
                    placeholder={orderType === "delivery" ? "Gunakan Pinpoint/Peta untuk mengisi alamat" : "Masukkan alamat lengkap"}
                    required={orderType === "delivery"}
                  />
                  {distance && (
                    <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1 px-1">
                      <FaCheckCircle size={10} />
                      Terdeteksi: {distance} KM dari lokasi toko
                    </p>
                  )}

                  {/* Shipping Rates Selection - Automatic Display */}
                  {orderType === "delivery" && (
                    <div className="mt-6 space-y-4">
                      <label className="flex items-center text-white text-sm font-semibold">
                        <FaTruck className="mr-2 text-orange-400" />
                        Layanan Pengiriman
                      </label>
                      
                      {selectedRate ? (
                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              {selectedRate.company} ({selectedRate.type})
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {selectedRate.duration}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-orange-400">
                              Rp {selectedRate.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                          <p className="text-[10px] text-gray-400 italic">Pilih lokasi terlebih dahulu untuk menghitung ongkir secara otomatis.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaPhone className="mr-2 text-orange-400" />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                  placeholder="Contoh: 08123456789"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaStickyNote className="mr-2 text-orange-400" />
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all resize-none"
                  placeholder="Tambahkan catatan khusus untuk pesanan Anda"
                />
              </div>

              {/* Delivery Method - Hidden for delivery type since we use rates, but keep logic */}
              {orderType === "pickup" && (
                <div>
                  <label className="flex items-center text-white text-sm font-semibold mb-2">
                    <FaTruck className="mr-2 text-orange-400" />
                    Konfirmasi Pengambilan
                  </label>
                  <div className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white">
                    <div className="flex items-center">
                      <FaStore className="mr-2 text-orange-400" />
                      <span>Ambil di Toko</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Alamat dan detail akan di kirim lewat Whatsapp<br />
                      Tlogo Biru <br />
                      Kecamatan: Pedurungan <br />
                      Kelurahan: Tlogosari Kulon <br />
                      Kode Pos: 50196 <br />
                      Jam buka: 11:00 - 21:00
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Date */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaCalendarAlt className="mr-2 text-orange-400" />
                  Tanggal {orderType === "pickup" ? "Pengambilan" : "Pengiriman"}
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full flex items-center justify-between border border-white/30 rounded-lg p-3 bg-white/5 text-white hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all text-left"
                >
                  <span className="font-medium">
                    {new Date(formData.date).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <FaCalendarAlt className="text-gray-400" size={14} />
                </button>
                
                <p className="text-sm text-gray-400 mt-1">
                  Minimal pemesanan H+{minDays} ({minDays === 1 ? "Besok" : "Lusa"}: {new Date(tomorrowFormatted).toLocaleDateString('id-ID')})
                </p>
              </div>

              {showDatePicker && (
                <PremiumDatePicker
                  value={formData.date}
                  minDate={tomorrowFormatted}
                  onChange={(newDate) => {
                    setFormData(prev => ({ ...prev, date: newDate }));
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}

              {/* Time Selection */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaClock className="mr-2 text-orange-400" />
                  Waktu {orderType === "pickup" ? "Pengambilan" : "Pengiriman"}
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full flex items-center justify-between border border-white/30 rounded-lg p-3 bg-white/5 text-white hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all text-left"
                >
                  <span className="font-medium">
                    {formData.time === "10:00" ? "10:00 AM WIB" : 
                     formData.time === "12:00" ? "12:00 PM WIB" : 
                     formData.time === "17:00" ? "05:00 PM WIB" : 
                     formData.time === "19:00" ? "07:00 PM WIB" : formData.time}
                  </span>
                  <FaClock className="text-gray-400" size={14} />
                </button>
              </div>

              {showTimePicker && (
                <PremiumTimePicker
                  value={formData.time}
                  onChange={(newTime) => {
                    setFormData(prev => ({ ...prev, time: newTime }));
                  }}
                  onClose={() => setShowTimePicker(false)}
                />
              )}

              <p className="text-sm text-gray-400 mt-1">
                {orderType === "pickup" 
                  ? "Pilih waktu yang sesuai untuk mengambil pesanan di toko"
                  : "Pilih waktu yang diinginkan untuk pengiriman"
                }
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !user || (orderType === 'delivery' && !selectedRate)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Memproses Pesanan...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Bayar Sekarang - Rp {(total + (selectedRate?.price || 0)).toLocaleString()}</span>
                  </div>
                )}
              </button>
              
              {!user && (
                <div className="text-center text-gray-400 text-sm mt-4">
                  <FaLock className="inline mr-2" />
                  Masuk dengan Google untuk melanjutkan pesanan
                </div>
              )}
            </form>
          </div>
          </>
          )}
        </div>
      </div>

      {showMap && (
        <MapPicker 
          onSelect={handleMapSelect} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}
