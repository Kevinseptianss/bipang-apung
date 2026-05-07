"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  FaBox, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTruck, 
  FaCreditCard, FaClock, FaWhatsapp, FaSync, FaCheckCircle, 
  FaExclamationCircle, FaTimesCircle, FaChevronRight, FaArrowLeft, FaStickyNote
} from "react-icons/fa";
import bg from "@/assets/bg.png";
import axios from "axios";

export default function CekOrderPage() {
  const params = useParams();
  const { id } = params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderData = useCallback(async () => {
    try {
      const orderResponse = await axios.get(`/api/getorder?order_id=${id}`);
      if (orderResponse.data) {
        setOrderDetails(orderResponse.data);
        
        if (orderResponse.data?.payment?.method === 'Pembayaran Online') {
          await checkTransactionStatus(orderResponse.data.order_id);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Pesanan tidak ditemukan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const checkTransactionStatus = async (orderId) => {
    try {
      const response = await axios.get(`/api/checkTransaction?order_id=${orderId}`);
      if (response.data && response.data.transaction_status) {
        setStatus(response.data.transaction_status);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  useEffect(() => {
    if (id) fetchOrderData();
  }, [id, fetchOrderData]);

  const handlePayNow = () => {
    if (window.snap && orderDetails?.payment?.snap_token) {
      window.snap.pay(orderDetails.payment.snap_token, {
        onSuccess: () => fetchOrderData(),
        onPending: () => fetchOrderData(),
        onClose: () => fetchOrderData()
      });
    } else if (orderDetails?.payment?.payment_url) {
      const url = orderDetails.payment.payment_url.replace('app.sandbox.midtrans.com', 'app.midtrans.com');
      window.open(url, '_blank');
    }
  };

  const getStatusDisplay = (status, orderStatus) => {
    const s = status || orderStatus;
    switch (s) {
      case "settlement": 
      case "success":
        return { label: "Berhasil", color: "text-green-400", bg: "bg-green-400/10", icon: <FaCheckCircle /> };
      case "pending": 
        return { label: "Menunggu", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: <FaClock /> };
      case "expire":
      case "deny":
      case "cancel":
      case "failed":
        return { label: "Gagal/Batal", color: "text-red-400", bg: "bg-red-400/10", icon: <FaTimesCircle /> };
      default: 
        return { label: "Diproses", color: "text-blue-400", bg: "bg-blue-400/10", icon: <FaSync className="animate-spin" /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <FaExclamationCircle className="text-4xl text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-gray-400 mb-8">{error}</p>
        <Link href="/" className="bg-white text-black px-8 py-3 rounded-2xl font-bold">Back to Home</Link>
      </div>
    );
  }

  const statusUI = getStatusDisplay(status, orderDetails.status);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image src={bg} alt="bg" fill className="object-cover blur-[8px] scale-105 opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
            <FaArrowLeft size={14} />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold">Detail Pesanan</h1>
            <p className="text-xs text-white/40">#{orderDetails.order_id.split('-')[0]}</p>
          </div>
          <button onClick={() => { setRefreshing(true); fetchOrderData(); }} className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 ${refreshing ? 'animate-spin' : ''}`}>
            <FaSync size={12} />
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 mb-6 text-center">
          <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 border-2 ${statusUI.color.replace('text-', 'border-')}/30 ${statusUI.bg}`}>
            <span className={`text-3xl ${statusUI.color}`}>{statusUI.icon}</span>
          </div>
          <h2 className="text-2xl font-black mb-1">{statusUI.label}</h2>
          <p className="text-white/40 text-sm mb-6">ID Pesanan: {orderDetails.order_id}</p>
          
          {(status === 'pending' || orderDetails.status === 'pending') && (
            <button 
              onClick={handlePayNow}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <FaCreditCard />
              Bayar Sekarang
            </button>
          )}
        </div>

        {/* Section: Items */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 mb-6">
          <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
            <FaBox className="text-orange-500" />
            Item Pesanan
          </h3>
          <div className="space-y-4">
            {orderDetails.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-white/40">Rp {item.amount.toLocaleString()} x {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">Rp {(item.amount * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Subtotal</span>
              <span className="font-medium">Rp {orderDetails.payment.itemsTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Ongkos Kirim</span>
              <span className="font-medium">Rp {orderDetails.payment.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2 text-orange-500">
              <span>Total Akhir</span>
              <span>Rp {orderDetails.payment.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Section: Delivery Info */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 mb-6">
          <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
            <FaTruck className="text-orange-500" />
            Detail Pengiriman
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                <FaUser className="text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">Nama & Telepon</p>
                <p className="text-sm font-bold">{orderDetails.customer.name}</p>
                <p className="text-xs text-white/40">{orderDetails.customer.phone}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                <FaMapMarkerAlt className="text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">Alamat Pengiriman</p>
                <p className="text-xs text-white/60 leading-relaxed">{orderDetails.customer.address}</p>
              </div>
            </div>
            {orderDetails.customer.note && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <FaStickyNote className="text-white/40" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">Catatan</p>
                  <p className="text-xs text-white/60">{orderDetails.customer.note}</p>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                <FaCalendarAlt className="text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider mb-0.5">Jadwal Pengiriman</p>
                <p className="text-xs text-white/60">
                  {new Date(orderDetails.orderDetails.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} • {orderDetails.orderDetails.time} WIB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bantuan Button */}
        <button 
          onClick={() => {
            const msg = `Halo Bipang Apung, saya ingin tanya pesanan #${orderDetails.order_id}`;
            window.open(`https://wa.me/6287831100001?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 py-4 rounded-[1.5rem] font-bold border border-green-500/20 flex items-center justify-center gap-3 transition-colors"
        >
          <FaWhatsapp size={18} />
          Hubungi Admin (WhatsApp)
        </button>
      </div>
    </div>
  );
}
