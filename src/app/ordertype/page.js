"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import bg from "@/assets/bg.png";
import ProfileHeader from "@/components/ProfileHeader";
import { FaArrowLeft, FaStore, FaTruck, FaShoppingCart } from "react-icons/fa";

export default function OrderType() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      const cartTotal = parsedCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotal(cartTotal);
    }
  }, []);

  const handleOrderType = (type) => {
    // Save the order type to localStorage and redirect to details
    localStorage.setItem("orderType", type);
    window.location.href = "/details";
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
        <a href="/order" className="flex items-center text-white hover:text-orange-400 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Kembali</span>
        </a>
        <h1 className="text-xl font-bold text-white">Pilih Metode Pengambilan</h1>
        <ProfileHeader />
      </header>

      <div className="relative z-10 flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <FaShoppingCart className="mr-2 text-orange-400" />
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

          {/* Order Type Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              Bagaimana Anda ingin menerima pesanan?
            </h2>
            
            {/* Pickup Option */}
            <button
              onClick={() => handleOrderType("pickup")}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-orange-400/50 rounded-xl p-6 text-left transition-all duration-300 hover:transform hover:scale-[1.02] group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mr-4">
                  <FaStore className="text-2xl text-orange-400 group-hover:text-orange-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Ambil di Tempat</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Datang langsung ke toko kami untuk mengambil pesanan
                  </p>
                  <div className="flex items-center text-green-400 text-sm">
                    <span className="mr-2">✓</span>
                    <span>Tidak ada biaya tambahan</span>
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <span className="mr-2">✓</span>
                    <span>Lebih cepat dan praktis</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Delivery Option */}
            <button
              onClick={() => handleOrderType("delivery")}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-orange-400/50 rounded-xl p-6 text-left transition-all duration-300 hover:transform hover:scale-[1.02] group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                  <FaTruck className="text-2xl text-blue-400 group-hover:text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Kirim ke Alamat</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Kami akan mengirim pesanan ke alamat yang Anda tentukan
                  </p>
                  <div className="flex items-center text-yellow-400 text-sm">
                    <span className="mr-2">!</span>
                    <span>Biaya ongkir ditanggung pembeli</span>
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <span className="mr-2">✓</span>
                    <span>Nyaman tanpa perlu keluar rumah</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Pilih metode yang paling cocok untuk Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
