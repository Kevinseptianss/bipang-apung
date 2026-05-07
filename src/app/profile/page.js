"use client";
import { useState, useEffect, useCallback } from "react";
import { auth, googleProvider } from "@/config/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { 
  FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, 
  FaShoppingCart, FaTruck, FaStore, FaSync, FaWhatsapp, FaSignOutAlt, 
  FaGoogle, FaChevronRight 
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import bg from "@/assets/bg.png";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders?userId=${userId}`);
      if (response.data.success) {
        setTransactions(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        await fetchTransactions(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [fetchTransactions]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Gagal login dengan Google");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success": return <FaCheckCircle className="text-green-400" />;
      case "pending": return <FaClock className="text-yellow-400" />;
      case "failed": return <FaTimesCircle className="text-red-400" />;
      default: return <FaExclamationCircle className="text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={bg} 
          alt="background" 
          fill
          className="object-cover blur-[8px] scale-105 opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pb-32">
        {/* Mobile Header (Hidden as requested, but we need a spacer if we want) */}
        <div className="md:hidden h-8" />

        <main className="flex-1 p-5">
          {!user ? (
            /* Login State */
            <div className="flex flex-col items-center justify-center py-12 text-center h-[70vh]">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                <FaUser className="text-4xl text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Selamat Datang</h1>
              <p className="text-gray-400 mb-10 max-w-[280px] mx-auto leading-relaxed">
                Masuk untuk melihat riwayat pesanan dan mengelola profil Anda.
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full max-w-xs flex items-center justify-center gap-4 bg-white text-black py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-100 transition-all transform active:scale-95"
              >
                <FaGoogle className="text-red-500" />
                Masuk dengan Google
              </button>
            </div>
          ) : (
            /* Profile State */
            <div className="space-y-8 animate-fade-in">
              {/* Profile Card */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {user.photoURL ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 p-1">
                        <Image
                          src={user.photoURL}
                          alt={user.displayName}
                          width={80}
                          height={80}
                          className="rounded-xl object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center">
                        <FaUser className="text-3xl text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-black rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{user.displayName || "Pelanggan"}</h2>
                    <p className="text-white/40 text-sm truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Total Pesanan</p>
                    <p className="text-xl font-bold">{transactions.length}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl p-4 border border-red-500/20 flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <FaSignOutAlt size={16} />
                    <span className="text-xs font-bold">Keluar</span>
                  </button>
                </div>
              </div>

              {/* Order History Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaShoppingCart className="text-orange-500" size={18} />
                    Riwayat Pesanan
                  </h3>
                  <button 
                    onClick={() => fetchTransactions(user.uid)}
                    className={`text-orange-500 p-2 ${loading ? 'animate-spin' : ''}`}
                  >
                    <FaSync size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-white/5 rounded-[2rem] p-10 text-center border border-white/5">
                    <FaShoppingCart className="mx-auto text-4xl text-white/10 mb-4" />
                    <p className="text-white/40">Belum ada pesanan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((order) => (
                      <div 
                        key={order.order_id} 
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(order.status)}
                              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                                {order.status === 'success' ? 'Selesai' : order.status === 'pending' ? 'Menunggu' : 'Gagal'}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg">#{order.order_id.split('-')[0]}</h4>
                            <p className="text-white/40 text-xs">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-500 font-black text-lg">Rp {(order.payment?.amount || 0).toLocaleString()}</p>
                            <p className="text-white/40 text-[10px] uppercase">{order.orderDetails?.type === 'pickup' ? 'Ambil' : 'Kirim'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap text-[10px] font-medium text-white/80">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
                          {order.status === 'success' && (
                            <button 
                              onClick={() => {
                                const msg = `Halo Bipang Apung, saya ingin tanya pesanan #${order.order_id}`;
                                window.open(`https://wa.me/6287831100001?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-3 rounded-2xl text-xs font-bold border border-green-500/20 flex items-center justify-center gap-2 transition-colors"
                            >
                              <FaWhatsapp size={14} />
                              Bantuan
                            </button>
                          )}
                          <button className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-3 rounded-2xl text-xs font-bold border border-white/5 flex items-center justify-center gap-2 transition-colors">
                            Detail Pesanan
                            <FaChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
