"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaStickyNote, FaCalendarAlt, FaTruck, FaSpinner, FaStore, FaClock, FaGoogle, FaSignOutAlt } from "react-icons/fa";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import ProfileHeader from "@/components/ProfileHeader";

export default function Details() {
  // Set minimum order date to H+1 (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

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
    time: "10:00", // Default time
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

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Auto-fill name if available
        setFormData(prev => ({
          ...prev,
          name: prev.name || user.displayName || ""
        }));
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
        setSuccess(true);
        console.log(response.data);
        localStorage.removeItem("cart");
        localStorage.removeItem("orderType");

        // Always redirect to Midtrans payment
        if (response.data.paymentUrl) {
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
          className="object-cover"
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
        
        <ProfileHeader />
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
                  <label className="flex items-center text-white text-sm font-semibold mb-2">
                    <FaMapMarkerAlt className="mr-2 text-orange-400" />
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all resize-none"
                    placeholder="Masukkan alamat lengkap untuk pengiriman"
                    required={orderType === "delivery"}
                  />
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

              {/* Delivery Method - Conditional based on order type */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaTruck className="mr-2 text-orange-400" />
                  {orderType === "pickup" ? "Konfirmasi Pengambilan" : "Metode Pengiriman"}
                </label>
                {orderType === "pickup" ? (
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
                ) : (
                  <select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                    className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                  >
                    <option value="Gojek, Maxim, Shopee, Bayar di tempat ongkirnya" className="bg-gray-800">Delivery Service (Gojek/Maxim/Shopee)</option>
                  </select>
                )}
              </div>

              {/* Delivery Date */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaCalendarAlt className="mr-2 text-orange-400" />
                  Tanggal {orderType === "pickup" ? "Pengambilan" : "Pengiriman"}
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={tomorrowFormatted}
                  className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Minimal pemesanan H+1 (besok: {new Date(tomorrowFormatted).toLocaleDateString('id-ID')})
                </p>
              </div>

              {/* Time Selection */}
              <div>
                <label className="flex items-center text-white text-sm font-semibold mb-2">
                  <FaClock className="mr-2 text-orange-400" />
                  Waktu {orderType === "pickup" ? "Pengambilan" : "Pengiriman"}
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full border border-white/30 rounded-lg p-3 bg-white/5 text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                  required
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time} className="bg-gray-800">
                      {time} WIB
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  {orderType === "pickup" 
                    ? "Pilih waktu yang sesuai untuk mengambil pesanan di toko"
                    : "Pilih waktu yang diinginkan untuk pengiriman"
                  }
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Memproses Pesanan...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Bayar Sekarang - Rp {total.toLocaleString()}</span>
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
    </div>
  );
}
