"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import bg from "@/assets/bg.png";
import ProfileHeader from "@/components/ProfileHeader";
import { FaHome, FaMinus, FaPlus, FaShoppingCart, FaTimes } from "react-icons/fa";
import MobileNavbar from "@/components/MobileNavbar";

export default function Order() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);

  const handleIncrement = (item) => {
    const updatedCart = cart.map(cartItem =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  
  const handleDecrement = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem.quantity === 1) {
      const filteredCart = cart.filter(cartItem => cartItem.id !== item.id);
      setCart(filteredCart);
      localStorage.setItem("cart", JSON.stringify(filteredCart));
    } else {
      const updatedCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const handleContinue = () => {
    window.location.href = "/ordertype";
  };
  
  const handleCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      handleIncrement(item);
    } else {
      const newCart = [...cart, { ...item, quantity: 1 }];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const removeFromCart = (itemId) => {
    const filteredCart = cart.filter(cartItem => cartItem.id !== itemId);
    setCart(filteredCart);
    localStorage.setItem("cart", JSON.stringify(filteredCart));
  };

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    setTotal(newTotal);
  }, [cart]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("/api/getMenu");
        setMenuItems(response.data);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError("Gagal memuat menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={bg} 
          alt="background" 
          fill
          className="object-cover blur-[6px] scale-105 opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      {/* Header - Desktop Only */}
      <header className="relative z-50 bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 hidden md:block">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">Menu Kami</h1>
          <div className="flex items-center gap-4">
            {/* Desktop Cart Button */}
            <button 
              onClick={() => setShowCart(true)}
              className="hidden md:flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all relative"
            >
              <FaShoppingCart className="mr-2" size={16} />
              <span>Keranjang</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center border-2 border-black">
                  {cartItemCount}
                </span>
              )}
            </button>
            <ProfileHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
            <p className="text-white">Memuat menu...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-2xl backdrop-blur-md text-center">
            {error}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden border border-white/10 hover:border-orange-400/50 transition-all duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-orange-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold shadow-lg">
                      Rp {item.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <h2 className="text-sm md:text-xl font-bold text-white mb-1 truncate">{item.name}</h2>
                    <p className="text-gray-400 text-[10px] md:text-sm mb-3 line-clamp-1 md:line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      {cart.some((cartItem) => cartItem.id === item.id) ? (
                        <div className="flex items-center bg-orange-600 rounded-lg md:rounded-xl overflow-hidden w-full">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="flex-1 py-1.5 md:py-3 hover:bg-orange-700 transition-colors text-white flex justify-center"
                          >
                            <FaMinus size={8} className="md:w-3 md:h-3" />
                          </button>
                          <span className="flex-1 py-1.5 md:py-3 bg-orange-500 text-white font-bold text-center text-xs md:text-base">
                            {cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="flex-1 py-1.5 md:py-3 hover:bg-orange-700 transition-colors text-white flex justify-center"
                          >
                            <FaPlus size={8} className="md:w-3 md:h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCart(item)}
                          className="w-full bg-white/10 hover:bg-orange-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl transition-all duration-300 font-bold border border-white/10 hover:border-orange-500 flex items-center justify-center gap-1 md:gap-2 group-hover:bg-orange-600 text-[10px] md:text-sm"
                        >
                          <FaPlus size={10} className="md:w-3 md:h-3" />
                          <span>Tambah</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Desktop Cart Modal */}
      {showCart && (
        <div className="hidden md:flex fixed inset-0 bg-black/80 backdrop-blur-md z-[200] items-center justify-center animate-fade-in">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/20 w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Keranjang Belanja</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaShoppingCart className="mx-auto mb-4 text-5xl opacity-20" />
                  <p>Keranjang belanja kosong</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-orange-500 text-sm font-bold">Rp {item.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="w-8 h-8 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <FaPlus size={10} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/40">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60 font-medium">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-orange-500">
                    Rp {total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/20 transition-all active:scale-95"
                >
                  Lanjutkan Pemesanan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
