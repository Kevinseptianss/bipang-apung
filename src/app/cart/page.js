"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import bg from "@/assets/bg.png";
import MobileNavbar from "@/components/MobileNavbar";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      const cartTotal = parsedCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotal(cartTotal);
    }
  }, []);

  const updateQuantity = (id, change) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    const cartTotal = newCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    setTotal(cartTotal);
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    const cartTotal = newCart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    setTotal(cartTotal);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background with Blur */}
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

      <div className="relative z-10 flex flex-col min-h-screen pb-32">
        <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <FaShoppingCart className="text-4xl text-white/20" />
              </div>
              <h2 className="text-xl font-bold mb-2">Keranjang Kosong</h2>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                Anda belum menambahkan item ke keranjang belanja.
              </p>
              <Link 
                href="/order"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center">
                  {item.image && (
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden mr-4">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{item.name}</h3>
                    <p className="text-orange-500 font-bold">Rp {item.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-white/40 hover:text-red-500 p-1"
                    >
                      <FaTrash size={14} />
                    </button>
                    <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Checkout Bar */}
        {cart.length > 0 && (
          <div className="fixed bottom-24 left-4 right-4 z-50">
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-in-up">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-white/60 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-bold text-orange-500">
                  Rp {total.toLocaleString()}
                </span>
              </div>
              <Link
                href="/ordertype"
                className="block w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-lg transform transition-all active:scale-95"
              >
                Lanjut ke Pembayaran
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
