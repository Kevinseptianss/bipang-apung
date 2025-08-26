"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaArrowLeft, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaShoppingCart, FaTruck, FaStore, FaSync, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import bg from "@/assets/bg.png";
import axios from "axios";
import ProfileHeader from "@/components/ProfileHeader";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const checkPendingPayments = useCallback(async (orders) => {
    const pendingOrders = orders.filter(order => 
      order.payment?.status === 'pending' || order.status === 'pending'
    );

    if (pendingOrders.length === 0) return;

    console.log(`Checking ${pendingOrders.length} pending payments...`);

    // Check each pending order
    const updatedOrders = [...orders];
    let hasUpdates = false;

    for (const order of pendingOrders) {
      try {
        console.log(`Checking payment status for order: ${order.order_id}`);
        const statusResponse = await axios.get(`/api/checkTransaction?order_id=${order.order_id}`);
        
        if (statusResponse.data) {
          const { transaction_status, fraud_status } = statusResponse.data;
          let newStatus = 'pending';

          // Determine new status based on Midtrans response
          if (transaction_status === 'capture') {
            newStatus = fraud_status === 'accept' ? 'success' : 'challenge';
          } else if (transaction_status === 'settlement') {
            newStatus = 'success';
          } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
            newStatus = 'failed';
          }

          // Update local state if status changed
          if (newStatus !== order.payment?.status && newStatus !== order.status) {
            console.log(`Order ${order.order_id} status updated: ${order.payment?.status || order.status} -> ${newStatus}`);
            
            // Update Firebase status
            try {
              await axios.post('/api/updateOrderStatus', { order_id: order.order_id });
            } catch (updateError) {
              console.error(`Failed to update Firebase for order ${order.order_id}:`, updateError);
            }
            
            const orderIndex = updatedOrders.findIndex(o => o.order_id === order.order_id);
            if (orderIndex !== -1) {
              updatedOrders[orderIndex] = {
                ...updatedOrders[orderIndex],
                payment: {
                  ...updatedOrders[orderIndex].payment,
                  status: newStatus,
                  transaction_status: transaction_status,
                  fraud_status: fraud_status
                },
                status: newStatus
              };
              hasUpdates = true;
            }
          }
        }
      } catch (error) {
        console.error(`Error checking payment status for order ${order.order_id}:`, error);
        // Continue with other orders even if one fails
      }
    }

    // Update state if there were any changes
    if (hasUpdates) {
      console.log('Updating transaction list with new payment statuses');
      setTransactions(updatedOrders);
    }
  }, [setTransactions]);

  const fetchTransactions = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders?userId=${userId}`);
      if (response.data.success) {
        const orders = response.data.orders || [];
        setTransactions(orders);
        
        // Check payment status for pending orders
        await checkPendingPayments(orders);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
    }
  }, [checkPendingPayments]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchTransactions(currentUser.uid);
      } else {
        window.location.href = "/";
      }
    });

    return () => unsubscribe();
  }, [fetchTransactions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <FaCheckCircle className="text-green-400" />;
      case "pending":
        return <FaClock className="text-yellow-400" />;
      case "failed":
        return <FaTimesCircle className="text-red-400" />;
      default:
        return <FaExclamationCircle className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Berhasil";
      case "pending":
        return "Menunggu Pembayaran";
      case "failed":
        return "Gagal";
      default:
        return "Tidak Diketahui";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleWhatsAppContact = (transaction) => {
    const orderDetails = `
Order ID: ${transaction.order_id}
Status: Pembayaran Berhasil
Tanggal: ${transaction.orderDetails?.date || 'N/A'}
Waktu: ${transaction.orderDetails?.time || 'N/A'}
Tipe: ${transaction.orderDetails?.type === 'pickup' ? 'Ambil di Tempat' : 'Pengiriman'}
${transaction.orderDetails?.deliveryMethod ? `Metode: ${transaction.orderDetails.deliveryMethod}` : ''}

Item Pesanan:
${transaction.items?.map(item => `- ${item.name} x${item.quantity} = Rp ${(item.amount * item.quantity).toLocaleString()}`).join('\n') || 'N/A'}

Total: Rp ${(transaction.payment?.amount || 0).toLocaleString()}

Customer:
Nama: ${transaction.customer?.name || 'N/A'}
Phone: ${transaction.customer?.phone || 'N/A'}
Alamat: ${transaction.customer?.address || 'N/A'}
${transaction.customer?.note ? `Catatan: ${transaction.customer.note}` : ''}
    `.trim();

    const message = `Halo, saya ingin mengkonfirmasi orderan saya.\n\n${orderDetails}`;
    const whatsappUrl = `https://wa.me/6287831100001?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleRefreshPayments = async () => {
    if (!user || refreshing) return;
    
    try {
      setRefreshing(true);
      await fetchTransactions(user.uid);
    } catch (error) {
      console.error("Error refreshing payments:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleContinuePayment = (transaction) => {
    if (transaction.payment?.payment_url) {
      window.open(transaction.payment.payment_url, "_blank");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
      <header className="relative z-50 flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <Link href="/" className="flex items-center text-white hover:text-orange-400 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Beranda</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Profil & Riwayat</h1>
        <ProfileHeader />
      </header>

      <div className="relative z-10 flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* User Profile Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
            <div className="flex items-center">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-2xl" />
                </div>
              )}
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  {user.displayName || "User"}
                </h2>
                <p className="text-gray-300">{user.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Bergabung sejak {formatDate(user.metadata.creationTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaShoppingCart className="mr-2 text-orange-400" />
                Riwayat Pesanan
              </h3>
              <button
                onClick={handleRefreshPayments}
                disabled={refreshing || loading}
                className="flex items-center bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={14} />
                {refreshing ? 'Memeriksa...' : 'Periksa Status'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-300">Memuat riwayat pesanan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-400">Belum ada riwayat pesanan</p>
                <a
                  href="/order"
                  className="inline-block mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Mulai Pesan
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center mb-2">
                          {getStatusIcon(transaction.payment?.status || transaction.status)}
                          <span className={`ml-2 font-semibold ${getStatusColor(transaction.payment?.status || transaction.status)}`}>
                            {getStatusText(transaction.payment?.status || transaction.status)}
                          </span>
                        </div>
                        <p className="text-white font-semibold">
                          Order #{transaction.order_id}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold text-lg">
                          Rp {(transaction.payment?.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mb-3">
                      <div className="flex items-center text-gray-300 text-sm mb-1">
                        {transaction.orderDetails?.type === "pickup" ? (
                          <>
                            <FaStore className="mr-2" />
                            <span>Ambil di Tempat - {transaction.orderDetails?.time}</span>
                          </>
                        ) : (
                          <>
                            <FaTruck className="mr-2" />
                            <span>Kirim ke Alamat - {transaction.orderDetails?.time}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        Tanggal: {transaction.orderDetails?.date ? new Date(transaction.orderDetails.date).toLocaleDateString("id-ID") : 'N/A'}
                      </p>
                      {transaction.orderDetails?.deliveryMethod && (
                        <p className="text-gray-400 text-sm">
                          Metode: {transaction.orderDetails.deliveryMethod}
                        </p>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mb-3">
                      <p className="text-gray-300 text-sm mb-2">Item pesanan:</p>
                      <div className="space-y-1">
                        {transaction.items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-gray-300">
                              Rp {(item.amount * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {(transaction.payment?.status === "pending" || transaction.status === "pending") && transaction.payment?.payment_url && (
                      <button
                        onClick={() => handleContinuePayment(transaction)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors font-semibold"
                      >
                        Lanjut Bayar
                      </button>
                    )}
                    
                    {/* WhatsApp Contact for Successful Orders */}
                    {(transaction.payment?.status === "success" || transaction.status === "success") && (
                      <button
                        onClick={() => handleWhatsAppContact(transaction)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center"
                      >
                        <FaWhatsapp className="mr-2" size={16} />
                        Hubungi WhatsApp
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
