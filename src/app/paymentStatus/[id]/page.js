"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft } from "react-icons/fa";
import ProfileHeader from "@/components/ProfileHeader";

export default function PaymentStatus() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const orderId = params.id;
    const transaction_status = searchParams.get("transaction_status");
    const status_code = searchParams.get("status_code");

    if (orderId) {
      checkPaymentStatus(orderId, transaction_status, status_code);
    }
  }, [params, searchParams]);

  const checkPaymentStatus = async (orderId, transaction_status, status_code) => {
    try {
      const response = await axios.post("/api/checkTransaction", {
        orderId,
        transaction_status,
        status_code
      });

      if (response.data.success) {
        setOrderData(response.data.order);
        if (response.data.order.status === "success") {
          setStatus("success");
          setMessage("Pembayaran berhasil! Terima kasih atas pesanan Anda.");
        } else if (response.data.order.status === "pending") {
          setStatus("pending");
          setMessage("Pembayaran masih dalam proses. Mohon tunggu konfirmasi.");
        } else {
          setStatus("failed");
          setMessage("Pembayaran gagal atau dibatalkan. Silakan coba lagi.");
        }
      } else {
        setStatus("failed");
        setMessage("Gagal memverifikasi status pembayaran.");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("failed");
      setMessage("Terjadi kesalahan saat memverifikasi pembayaran.");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <FaCheckCircle className="text-6xl text-green-400 mb-4" />;
      case "pending":
        return <FaClock className="text-6xl text-yellow-400 mb-4" />;
      case "failed":
        return <FaTimesCircle className="text-6xl text-red-400 mb-4" />;
      default:
        return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-white";
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
        <a href="/profile" className="flex items-center text-white hover:text-orange-400 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Kembali ke Profil</span>
        </a>
        <h1 className="text-xl font-bold text-white">Status Pembayaran</h1>
        <ProfileHeader />
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            {getStatusIcon()}
            
            <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
              {status === "loading" && "Memeriksa Status..."}
              {status === "success" && "Pembayaran Berhasil!"}
              {status === "pending" && "Pembayaran Tertunda"}
              {status === "failed" && "Pembayaran Gagal"}
            </h2>
            
            <p className="text-gray-300 mb-6 text-lg">
              {message}
            </p>

            {orderData && (
              <div className="bg-white/5 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-bold text-white mb-4">Detail Pesanan</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="font-semibold">Order ID:</span> {orderData.orderId}</p>
                  <p><span className="font-semibold">Total:</span> Rp {orderData.total?.toLocaleString()}</p>
                  <p><span className="font-semibold">Metode:</span> {orderData.orderType === "pickup" ? "Ambil di Tempat" : "Kirim ke Alamat"}</p>
                  <p><span className="font-semibold">Tanggal:</span> {new Date(orderData.date).toLocaleDateString("id-ID")}</p>
                  {orderData.orderType === "pickup" ? (
                    <p><span className="font-semibold">Waktu Pengambilan:</span> {orderData.pickupTime}</p>
                  ) : (
                    <p><span className="font-semibold">Waktu Pengiriman:</span> {orderData.deliveryTime}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/profile"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Lihat Riwayat Pesanan
              </a>
              <a
                href="/order"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Pesan Lagi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}