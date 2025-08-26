"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  FiPackage, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiTruck, 
  FiCreditCard,
  FiClock,
  FiMessageSquare,
  FiExternalLink,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiShoppingCart,
  FiCheck
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineRestaurantMenu } from "react-icons/md";

export default function CekOrderPage() {
  const params = useParams();
  const { id } = params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderData = async () => {
    try {
      // Fetch order details
      const orderResponse = await fetch(`/api/getorder?order_id=${id}`);
      const orderData = await orderResponse.json();
      
      if (orderResponse.ok) {
        setOrderDetails(orderData);
        console.log("Order details:", orderData);
        
        // Check payment status if payment method is online
        if (orderData?.payment?.method === 'Pembayaran Online' && orderData?.order_id) {
          await checkTransactionStatus(orderData.order_id);
        }
      } else {
        setError(orderData.error || "Pesanan tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkTransactionStatus = async (orderId) => {
    try {
      const statusResponse = await fetch(`/api/checkTransaction?order_id=${orderId}`);
      const statusData = await statusResponse.json();
      
      if (statusResponse.ok && statusData.transaction_status) {
        setStatus(statusData.transaction_status);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderData();
  };

  const handleWhatsAppSupport = () => {
    const phone = "6281234567890"; // Replace with your WhatsApp support number
    const message = `Halo, saya perlu bantuan mengenai pesanan ${id}. Mohon informasi lebih lanjut.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Memeriksa status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <FiXCircle className="text-red-400 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Pesanan Tidak Ditemukan</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "settlement": return "text-green-400 bg-green-400/10";
      case "pending": return "text-yellow-400 bg-yellow-400/10";
      case "expire":
      case "deny":
      case "cancel":
        return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Menunggu Pembayaran";
      case "settlement": return "Pembayaran Berhasil";
      case "expire": return "Pembayaran Kadaluarsa";
      case "deny": return "Pembayaran Ditolak";
      case "cancel": return "Pembayaran Dibatalkan";
      default: return "Belum Dibayar";
    }
  };

  const getOrderStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "completed": return "text-green-400 bg-green-400/10";
      case "processing": return "text-blue-400 bg-blue-400/10";
      case "pending": return "text-yellow-400 bg-yellow-400/10";
      default: return "text-red-400 bg-red-400/10";
    }
  };

  const isPendingPayment = status === "pending" && orderDetails?.payment?.payment_url;
  const isUnpaidOrder = !status && orderDetails?.payment?.method === 'Pembayaran Online' && orderDetails?.payment?.status === 'pending';
  const isExpiredPayment = status === "expire" || status === "cancel" || status === "deny";

  const handleWhatsAppFollowUp = () => {
    const phone = "6281234567890"; // Replace with your WhatsApp support number
    const orderUrl = `https://bipangapung.vercel.app/cekorder/${id}`;
    
    let message = `Halo, saya ${orderDetails?.customer?.name || 'customer'} dengan pesanan ${id}.`;
    
    if (isUnpaidOrder || isPendingPayment) {
      message += ` Saya belum menyelesaikan pembayaran untuk pesanan ini. Mohon bantuan untuk melanjutkan pembayaran. Link order: ${orderUrl}`;
    } else if (isExpiredPayment) {
      message += ` Pembayaran saya sudah kadaluarsa. Apakah masih bisa diproses? Mohon bantuan. Link order: ${orderUrl}`;
    } else {
      message += ` Mohon informasi status pesanan ini. Link order: ${orderUrl}`;
    }
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Milestone functions
  const getMilestones = () => {
    const milestones = [
      {
        id: 'pending',
        title: 'Menunggu',
        subtitle: 'Pesanan diterima',
        icon: FiShoppingCart,
        color: 'orange',
        description: 'Pesanan Anda telah diterima dan sedang menunggu konfirmasi pembayaran'
      },
      {
        id: 'processing',
        title: 'Diproses',
        subtitle: 'Sedang dimasak',
        icon: MdOutlineRestaurantMenu,
        color: 'green',
        description: 'Chef sedang menyiapkan pesanan Anda dengan penuh cinta'
      },
      {
        id: 'completed',
        title: 'Selesai',
        subtitle: 'Siap diantar/diambil',
        icon: FiCheckCircle,
        color: 'blue',
        description: 'Pesanan sudah siap! Silakan ambil atau tunggu kurir kami'
      },
      {
        id: 'cancelled',
        title: 'Dibatalkan',
        subtitle: 'Pesanan dibatalkan',
        icon: FiXCircle,
        color: 'red',
        description: 'Pesanan telah dibatalkan'
      }
    ];

    return milestones;
  };

  const getCurrentMilestoneIndex = () => {
    const currentStatus = orderDetails?.status || 'pending';
    const milestones = getMilestones();
    
    // Special handling for cancelled orders
    if (currentStatus === 'cancelled' || isExpiredPayment) {
      return -1; // Special case for cancelled
    }
    
    // For unpaid orders, stay at pending
    if (isUnpaidOrder && !status) {
      return 0;
    }
    
    const index = milestones.findIndex(milestone => milestone.id === currentStatus);
    return index !== -1 ? index : 0;
  };

  const MilestoneComponent = () => {
    const milestones = getMilestones();
    const currentIndex = getCurrentMilestoneIndex();
    const isCancelled = currentIndex === -1;

    return (
      <>
        {isCancelled ? (
          // Cancelled state
          <div className="text-center animate-fadeIn">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <FiXCircle className="text-red-400 text-3xl" />
              </div>
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-red-400 mb-2">Pesanan Dibatalkan</h3>
                <p className="text-gray-400 text-lg">
                  {isExpiredPayment ? 'Pembayaran tidak berhasil atau kadaluarsa' : 'Pesanan telah dibatalkan'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Normal milestone progression
          <div className="relative animate-slideInUp">
            {/* Progress Line */}
            <div className="absolute top-10 left-10 right-10 h-1 bg-gray-600 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-2000 ease-out ${
                  currentIndex >= 2 ? 'bg-blue-500' : // Completed - blue
                  currentIndex >= 1 ? 'bg-green-500' : // Processing - green  
                  currentIndex >= 0 ? 'bg-orange-500' : 'bg-gray-600' // Pending - orange
                }`}
                style={{ 
                  width: `${Math.max(0, (currentIndex / (milestones.length - 1)) * 100)}%`,
                  transition: 'width 2s ease-out'
                }}
              />
            </div>

            {/* Milestones */}
            <div className="relative flex justify-between">
              {milestones.slice(0, -1).map((milestone, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const IconComponent = milestone.icon;
                
                // Get color classes based on milestone color
                const getColorClasses = (color, isActive, isCurrent) => {
                  if (!isActive) return 'bg-gray-700 border-gray-600';
                  
                  switch (color) {
                    case 'orange':
                      return isCurrent 
                        ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/40' 
                        : 'bg-orange-500 border-orange-400';
                    case 'green':
                      return isCurrent 
                        ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/40' 
                        : 'bg-green-500 border-green-400';
                    case 'blue':
                      return isCurrent 
                        ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/40' 
                        : 'bg-blue-500 border-blue-400';
                    default:
                      return 'bg-gray-500 border-gray-400';
                  }
                };

                const getRippleColor = (color) => {
                  switch (color) {
                    case 'orange': return 'bg-orange-500/30';
                    case 'green': return 'bg-green-500/30';
                    case 'blue': return 'bg-blue-500/30';
                    default: return 'bg-gray-500/30';
                  }
                };

                return (
                  <div key={milestone.id} className="flex flex-col items-center" style={{
                    animationDelay: `${index * 200}ms`
                  }}>
                    {/* Circle */}
                    <div className={`
                      relative w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4 transition-all duration-700 ease-out animate-slideInUp
                      ${getColorClasses(milestone.color, isActive, isCurrent)}
                      ${isCurrent ? 'animate-pulse transform scale-110' : isActive ? 'transform scale-105' : ''}
                    `}>
                      {isActive && index < currentIndex ? (
                        <FiCheck className="text-white text-2xl animate-fadeIn" />
                      ) : (
                        <IconComponent className={`text-2xl transition-all duration-500 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`} />
                      )}
                      
                      {/* Ripple effect for current step */}
                      {isCurrent && (
                        <>
                          <div className={`absolute inset-0 rounded-full ${getRippleColor(milestone.color)} animate-ping`} />
                          <div className={`absolute inset-0 rounded-full ${getRippleColor(milestone.color)} animate-ping`} style={{animationDelay: '0.5s'}} />
                        </>
                      )}
                      
                      {/* Glow effect for completed steps */}
                      {isActive && index < currentIndex && (
                        <div className={`absolute inset-0 rounded-full ${getRippleColor(milestone.color)} animate-pulse`} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="text-center max-w-28">
                      <h4 className={`font-bold text-base transition-all duration-500 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}>
                        {milestone.title}
                      </h4>
                      <p className={`text-sm mt-1 transition-all duration-500 ${
                        isActive ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {milestone.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Step Description */}
            {currentIndex >= 0 && currentIndex < milestones.length - 1 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600 animate-fadeIn">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiClock className="text-blue-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">
                      {milestones[currentIndex].title}
                    </h4>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {milestones[currentIndex].description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(34, 197, 94, 0.4); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-progressGlow {
          animation: progressGlow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiPackage className="text-blue-400 text-2xl" />
              <div>
                <h1 className="text-xl font-bold text-white">Detail Pesanan</h1>
                <p className="text-gray-400 text-sm">{orderDetails?.order_id}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Milestone Progress */}
        <MilestoneComponent />

        {/* Unpaid Order Alert */}
        {isUnpaidOrder && (
          <div className="p-4 rounded-lg border border-yellow-400 bg-yellow-400/10 text-yellow-400">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="text-xl mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Pembayaran Belum Diselesaikan</h3>
                <p className="text-sm mb-4 opacity-90">
                  Pesanan Anda telah dibuat tetapi pembayaran belum diselesaikan. 
                  Silakan lanjutkan pembayaran atau hubungi kami untuk bantuan.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {orderDetails?.payment?.payment_url && (
                    <a
                      href={orderDetails.payment.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FiExternalLink className="text-sm" />
                      <span>Lanjutkan Pembayaran</span>
                    </a>
                  )}
                  <button
                    onClick={handleWhatsAppFollowUp}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <FaWhatsapp className="text-sm" />
                    <span>Minta Bantuan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expired Payment Alert */}
        {isExpiredPayment && (
          <div className="p-4 rounded-lg border border-red-400 bg-red-400/10 text-red-400">
            <div className="flex items-start space-x-3">
              <FiXCircle className="text-xl mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Pembayaran Tidak Berhasil</h3>
                <p className="text-sm mb-4 opacity-90">
                  {status === "expire" && "Pembayaran telah kadaluarsa. Silakan hubungi kami untuk membuat pesanan baru atau memperpanjang waktu pembayaran."}
                  {status === "deny" && "Pembayaran ditolak oleh sistem. Silakan coba metode pembayaran lain atau hubungi kami."}
                  {status === "cancel" && "Pembayaran dibatalkan. Jika ini tidak disengaja, silakan hubungi kami untuk bantuan."}
                </p>
                <button
                  onClick={handleWhatsAppFollowUp}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FaWhatsapp className="text-sm" />
                  <span>Hubungi Kami</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Alert */}
        {status && (
          <div className={`p-4 rounded-lg border ${getStatusColor(status)} border-current`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {status === "settlement" && <FiCheckCircle className="text-xl" />}
                {status === "pending" && <FiClock className="text-xl" />}
                {(status === "expire" || status === "deny" || status === "cancel") && 
                  <FiAlertCircle className="text-xl" />
                }
                <div>
                  <h3 className="font-semibold">Status Pembayaran</h3>
                  <p className="text-sm opacity-90">{getStatusText(status)}</p>
                </div>
              </div>
              
              {isPendingPayment && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={orderDetails.payment.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <FiExternalLink className="text-sm" />
                    <span>Lanjutkan Pembayaran</span>
                  </a>
                  <button
                    onClick={handleWhatsAppSupport}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <FaWhatsapp className="text-sm" />
                    <span className="hidden sm:inline">Bantuan</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FiUser className="text-blue-400" />
              <span>Informasi Pelanggan</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiUser className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Nama Pelanggan</p>
                    <p className="text-white font-medium">{orderDetails?.customer?.name || 'Tidak tersedia'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiPhone className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">No. Telepon</p>
                    <p className="text-white font-medium">{orderDetails?.customer?.phone || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Alamat</p>
                    <p className="text-white font-medium">{orderDetails?.customer?.address || 'Tidak tersedia'}</p>
                  </div>
                </div>
                {orderDetails?.customer?.note && (
                  <div className="flex items-start space-x-3">
                    <FiMessageSquare className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Catatan</p>
                      <p className="text-white font-medium">{orderDetails.customer.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FiPackage className="text-blue-400" />
              <span>Detail Pesanan</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <FiCalendar className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Tanggal Pesan</p>
                  <p className="text-white font-medium">
                    {orderDetails?.created_at ? formatDate(orderDetails.created_at) : 'Tidak tersedia'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiTruck className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Metode Pengiriman</p>
                  <p className="text-white font-medium">{orderDetails?.orderDetails?.deliveryMethod || 'Tidak tersedia'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiCreditCard className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Metode Pembayaran</p>
                  <p className="text-white font-medium">{orderDetails?.payment?.method || 'Tidak tersedia'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">Status Pesanan:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(orderDetails?.status)}`}>
                  {orderDetails?.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-white border-b border-gray-700 pb-2">Item Pesanan</h3>
              {orderDetails?.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      width={64}
                      height={64}
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-sm truncate">{item.description}</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {item.quantity} × {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="text-white font-semibold flex-shrink-0">
                    {formatCurrency(item.amount * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetails?.payment?.itemsTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Biaya Pengiriman:</span>
                  <span>{formatCurrency(orderDetails?.payment?.deliveryFee || 0)}</span>
                </div>
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(orderDetails?.payment?.amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {(isPendingPayment || isUnpaidOrder) && orderDetails?.payment?.payment_url && (
            <a
              href={orderDetails.payment.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center space-x-2"
            >
              <FiExternalLink />
              <span>Lanjutkan Pembayaran</span>
            </a>
          )}
          
          <button
            onClick={handleWhatsAppFollowUp}
            className={`${
              (isPendingPayment || isUnpaidOrder) && orderDetails?.payment?.payment_url 
                ? 'flex-1' 
                : 'w-full'
            } bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2`}
          >
            <FaWhatsapp />
            <span>
              {isUnpaidOrder || isPendingPayment ? 'Minta Bantuan Pembayaran' : 
               isExpiredPayment ? 'Hubungi untuk Pesanan Baru' : 
               'Hubungi Kami via WhatsApp'}
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
