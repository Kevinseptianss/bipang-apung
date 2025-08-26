"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import Head from "next/head";
import logo from "@/assets/logo.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaTrash, 
  FaWhatsapp, 
  FaCopy, 
  FaSync,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTimes,
  FaBars,
  FaChartLine,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShoppingCart,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaSpinner,
  FaBoxOpen
} from "react-icons/fa";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  
  // Enhanced admin features
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Monthly filter for stats
  const [statsFilter, setStatsFilter] = useState("current_month"); // "all" or "current_month" or "custom_month"
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // For month/year picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthPicker && !event.target.closest('.month-picker-container')) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

  const fetchOrders = useCallback(async (isAutoRefresh = false) => {
    // Only show loading state if it's not an auto-refresh
    if (!isAutoRefresh) {
      setIsLoadingOrders(true);
    }
    
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data.orders || []);
      setAllOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (!isAutoRefresh) {
        setError("Gagal memuat pesanan");
      }
    } finally {
      if (!isAutoRefresh) {
        setIsLoadingOrders(false);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchOrders();
      
      // Setup auto-refresh based on toggle state
      if (autoRefreshEnabled) {
        const interval = setInterval(() => fetchOrders(true), 30000);
        setRefreshInterval(interval);
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [fetchOrders, autoRefreshEnabled]);

  // PWA Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Enhanced filtering logic
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_id?.toLowerCase().includes(searchLower) ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.customer?.phone?.includes(searchTerm) ||
        (order.customer?.address && order.customer.address.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filters
    if (selectedDate) {
      const selectedDay = new Date(selectedDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at).setHours(0, 0, 0, 0);
        return orderDate === selectedDay;
      });
    } else if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (start && end) {
          return orderDate >= start && orderDate <= end;
        } else if (start) {
          return orderDate >= start;
        } else if (end) {
          return orderDate <= end;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [allOrders, searchTerm, statusFilter, selectedDate, dateRange]);

  // Update orders state when filters change
  useEffect(() => {
    setOrders(filteredOrders);
  }, [filteredOrders]);

  const clearFilters = () => {
    setSelectedDate(null);
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setStatusFilter("all");
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const AdminPanel = () => {
    const handleStatusChange = async (orderId, newStatus) => {
      try {
        await axios.put(`/api/orders/${orderId}`, { status: newStatus });
        setOrders(
          orders.map((order) =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setAllOrders(
          allOrders.map((order) =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } catch (err) {
        console.error("Failed to update status:", err);
        setError("Gagal mengubah status pesanan");
        setTimeout(() => setError(""), 3000);
      }
    };

    const handleDeleteOrder = async (orderId) => {
      if (confirm("Yakin ingin menghapus pesanan ini?")) {
        try {
          await axios.delete(`/api/orders/${orderId}`);
          setOrders(orders.filter((order) => order.order_id !== orderId));
          setAllOrders(allOrders.filter((order) => order.order_id !== orderId));
        } catch (err) {
          console.error("Failed to delete order:", err);
          setError("Gagal menghapus pesanan");
          setTimeout(() => setError(""), 3000);
        }
      }
    };

    const sendWhatsAppMessage = (order) => {
      const message = `Halo ${order.customer?.name}! 👋\n\nTerima kasih telah berbelanja di Babi Panggang Apung! 🍖\n\nPesanan Anda:\n📋 Order ID: ${order.order_id}\n💰 Total: ${formatCurrency(getOrderAmount(order))}\n📍 Status: ${getStatusText(order)}\n\n🔗 Cek status pesanan: https://bipangapung.vercel.app/cekorder/${order.order_id}\n\nTerima kasih! 🙏`;
      const whatsappUrl = `https://wa.me/${order.customer?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };

    const copyOrderMessage = (order) => {
      const message = `Terima kasih telah berbelanja di Babi Panggang Apung!\nOrder ID: ${order.order_id}\nStatus: ${getStatusText(order)}\nTotal: ${formatCurrency(getOrderAmount(order))}\n\nCek pesanan: https://bipangapung.vercel.app/cekorder/${order.order_id}`;
      navigator.clipboard.writeText(message);
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      toast.textContent = 'Pesan berhasil disalin!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    };

    const formatDate = (dateString) => {
      const options = { 
        day: "2-digit",
        month: "short", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      };
      return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const formatCurrency = (amount) => {
      if (!amount || isNaN(amount)) return "Rp 0";
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "completed":
          return <FaCheckCircle className="text-green-500" />;
        case "processing":
          return <FaClock className="text-yellow-500" />;
        case "cancelled":
          return <FaTimes className="text-red-500" />;
        default:
          return <FaExclamationCircle className="text-blue-500" />;
      }
    };

    const getOrderStatus = (order) => {
      // For online payment orders, check payment status first
      if (order.payment?.method === 'Pembayaran Online') {
        if (order.payment?.status === 'settlement') {
          // Payment completed, check if order has been updated to processing/completed
          return order.status === 'completed' ? 'completed' : 
                 order.status === 'processing' ? 'processing' : 'pending'; // Default to pending (menunggu) for paid orders
        } else if (order.payment?.status === 'pending') {
          return 'unpaid'; // Special status for unpaid orders
        } else if (['expire', 'deny', 'cancel'].includes(order.payment?.status)) {
          return 'cancelled'; // Payment failed
        }
      }
      
      // Default to the order status from database
      return order.status || 'pending';
    };

    const getStatusText = (order) => {
      const status = getOrderStatus(order);
      switch (status) {
        case "completed":
          return "Selesai";
        case "processing":
          return "Diproses";
        case "pending":
          return "Menunggu"; // All pending orders show "Menunggu"
        case "unpaid":
          return "Belum Bayar";
        case "cancelled":
          return "Dibatalkan";
        default:
          return "Menunggu"; // Changed from "Tidak Diketahui" to "Menunggu"
      }
    };

    const getStatusColor = (order) => {
      const status = getOrderStatus(order);
      switch (status) {
        case "completed":
          return "bg-green-900/30 text-green-300 border-green-700/50";
        case "processing":
          return "bg-blue-900/30 text-blue-300 border-blue-700/50";
        case "pending":
          return "bg-yellow-900/30 text-yellow-300 border-yellow-700/50";
        case "unpaid":
          return "bg-red-900/30 text-red-300 border-red-700/50";
        case "cancelled":
          return "bg-gray-900/30 text-gray-300 border-gray-700/50";
        default:
          return "bg-yellow-900/30 text-yellow-300 border-yellow-700/50";
      }
    };

    // Helper function to get order total amount
    const getOrderAmount = (order) => {
      // Try different possible paths for amount, including items calculation
      let amount = 0;
      
      // First try the payment amount
      if (order.payment?.amount) {
        amount = parseFloat(order.payment.amount);
      }
      // Then try direct amount fields
      else if (order.amount) {
        amount = parseFloat(order.amount);
      }
      else if (order.totalAmount) {
        amount = parseFloat(order.totalAmount);
      }
      else if (order.finalTotal) {
        amount = parseFloat(order.finalTotal);
      }
      // If no amount found, calculate from items
      else if (order.items && Array.isArray(order.items)) {
        const itemsTotal = order.items.reduce((itemSum, item) => {
          return itemSum + (parseFloat(item.amount || 0) * parseInt(item.quantity || 0));
        }, 0);
        const deliveryFee = parseFloat(order.payment?.deliveryFee || order.deliveryFee || 0);
        amount = itemsTotal + deliveryFee;
      }
      
      return isNaN(amount) ? 0 : amount;
    };

    const calculateStats = useCallback(() => {
      // Filter orders based on stats filter
      let ordersToCalculate = orders;
      
      if (statsFilter === "current_month") {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        ordersToCalculate = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
      } else if (statsFilter === "custom_month") {
        const targetMonth = selectedMonth.getMonth();
        const targetYear = selectedMonth.getFullYear();
        
        ordersToCalculate = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear;
        });
      }
      
      // Use the helper function for consistent amount calculation
      const total = ordersToCalculate.reduce((sum, order) => {
        return sum + getOrderAmount(order);
      }, 0);
      
      const completed = ordersToCalculate.filter(o => getOrderStatus(o) === "completed").length;
      const processing = ordersToCalculate.filter(o => getOrderStatus(o) === "processing").length;
      const pending = ordersToCalculate.filter(o => getOrderStatus(o) === "pending").length;
      const unpaid = ordersToCalculate.filter(o => getOrderStatus(o) === "unpaid").length;
      const cancelled = ordersToCalculate.filter(o => getOrderStatus(o) === "cancelled").length;
      
      return { total, completed, processing, pending: pending + unpaid, cancelled };
    }, [orders, statsFilter, selectedMonth]);

    const stats = useMemo(() => {
      return calculateStats();
    }, [calculateStats]);
    
    const handleInstallApp = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    };
    
    const getCurrentPeriodText = () => {
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      if (statsFilter === "current_month") {
        const currentDate = new Date();
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      } else if (statsFilter === "custom_month") {
        return `${monthNames[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
      }
      return "Semua Waktu";
    };

    const toggleAutoRefresh = () => {
      setAutoRefreshEnabled(prev => {
        const newState = !prev;
        if (!newState && refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        return newState;
      });
    };

    const exportToCSV = () => {
      if (orders.length === 0) return;
      
      const csvData = orders.map(order => ({
        order_id: order.order_id,
        tanggal: formatDate(order.created_at),
        customer: order.customer?.name,
        phone: order.customer?.phone,
        alamat: order.customer?.address,
        items: order.items?.map(item => `${item.name} (${item.quantity})`).join('; ') || '',
        total: getOrderAmount(order),
        status: getStatusText(order),
        pembayaran: order.payment?.method || order.paymentMethod,
        pengiriman: order.orderDetails?.deliveryMethod || order.deliveryMethod
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pesanan_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    };

    return (
      <>
        <Head>
          <title>Apung Admin</title>
          <meta name="application-name" content="Apung Admin" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Apung Admin" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#1F2937" />
          <meta name="background-color" content="#111827" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <link rel="apple-touch-startup-image" href="/logo.png" />
          <link rel="icon" href="/logo.png" />
        </Head>
        
        <style jsx global>{`
          /* PWA and iOS Full Screen Support */
          @supports(padding: max(0px)) {
            .ios-safe-area {
              padding-top: max(env(safe-area-inset-top), 0px);
              padding-bottom: max(env(safe-area-inset-bottom), 0px);
              padding-left: max(env(safe-area-inset-left), 0px);
              padding-right: max(env(safe-area-inset-right), 0px);
            }
          }
          
          /* Hide scrollbars in standalone mode */
          @media all and (display-mode: standalone) {
            body {
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            ::-webkit-scrollbar {
              width: 0px;
              background: transparent;
            }
          }
          
          /* Prevent bounce scrolling on iOS */
          body {
            position: fixed;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          
          #__next {
            height: 100vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .datepicker-dark-theme .react-datepicker {
            background-color: #374151 !important;
            border: 1px solid #4B5563 !important;
            border-radius: 8px !important;
            font-family: inherit !important;
          }
          
          .datepicker-dark-theme .react-datepicker__header {
            background-color: #4B5563 !important;
            border-bottom: 1px solid #6B7280 !important;
            border-radius: 8px 8px 0 0 !important;
          }
          
          .datepicker-dark-theme .react-datepicker__current-month {
            color: #FFFFFF !important;
            font-weight: 600 !important;
          }
          
          .datepicker-dark-theme .react-datepicker__navigation {
            border: none !important;
          }
          
          .datepicker-dark-theme .react-datepicker__navigation:hover *::before {
            border-color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__navigation-icon::before {
            border-color: #D1D5DB !important;
          }
          
          .datepicker-dark-theme .react-datepicker__month-text {
            color: #D1D5DB !important;
            padding: 8px !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
          }
          
          .datepicker-dark-theme .react-datepicker__month-text:hover {
            background-color: #4B5563 !important;
            color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__month-text--selected {
            background-color: #8B5CF6 !important;
            color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__month-text--keyboard-selected {
            background-color: #7C3AED !important;
            color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__year-text {
            color: #D1D5DB !important;
            padding: 8px !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
          }
          
          .datepicker-dark-theme .react-datepicker__year-text:hover {
            background-color: #4B5563 !important;
            color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__year-text--selected {
            background-color: #8B5CF6 !important;
            color: #FFFFFF !important;
          }
          
          .datepicker-dark-theme .react-datepicker__year-text--keyboard-selected {
            background-color: #7C3AED !important;
            color: #FFFFFF !important;
          }
        `}</style>
        
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 ios-safe-area">
        {/* Modern Header */}
        <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur-md shadow-sm border-b border-gray-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image 
                    src={logo} 
                    alt="Logo" 
                    width={40} 
                    height={40} 
                    className="rounded-full shadow-md" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                  <p className="text-xs text-gray-400">Kelola pesanan dengan mudah</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchOrders}
                  disabled={isLoadingOrders}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  title="Manual Refresh"
                >
                  <FaSync className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={toggleAutoRefresh}
                  className={`p-2 rounded-full shadow-lg transition-all active:scale-95 ${
                    autoRefreshEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                  title={autoRefreshEnabled ? "Auto-refresh ON - Click to turn OFF" : "Auto-refresh OFF - Click to turn ON"}
                >
                  <FaSync className={`w-4 h-4 ${autoRefreshEnabled ? '' : 'opacity-50'}`} />
                </button>
                
                {/* PWA Install Button */}
                {showInstallButton && (
                  <button
                    onClick={handleInstallApp}
                    className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all active:scale-95"
                    title="Install App"
                  >
                    <FaDownload className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (refreshInterval) {
                      clearInterval(refreshInterval);
                      setRefreshInterval(null);
                    }
                    localStorage.removeItem("adminToken");
                    setIsAuthenticated(false);
                  }}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all active:scale-95"
                  title="Logout"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="px-4 py-4">
          {/* Stats Filter Toggle */}
          <div className="mb-4 bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FaChartLine className="text-blue-400 text-lg" />
                <div>
                  <span className="text-white font-medium">Statistik Penjualan</span>
                  <p className="text-gray-400 text-xs">{getCurrentPeriodText()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={() => setStatsFilter("all")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  statsFilter === "all" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatsFilter("current_month")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  statsFilter === "current_month" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Bulan Ini
              </button>
              
              {/* Month/Year Picker */}
              <div className="relative month-picker-container">
                <button
                  onClick={() => {
                    setShowMonthPicker(!showMonthPicker);
                    if (!showMonthPicker) {
                      setStatsFilter("custom_month");
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    statsFilter === "custom_month" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <FaCalendarAlt className="text-xs" />
                  <span>Pilih Bulan</span>
                </button>
                
                {showMonthPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-4 z-50 min-w-[280px]">
                    <div className="text-center mb-4">
                      <h4 className="text-white font-medium text-sm">Pilih Bulan & Tahun</h4>
                    </div>
                    
                    <div className="datepicker-dark-theme">
                      <DatePicker
                        selected={selectedMonth}
                        onChange={(date) => {
                          setSelectedMonth(date);
                          setStatsFilter("custom_month");
                        }}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        inline
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                      <button
                        onClick={() => {
                          setSelectedMonth(new Date());
                          setStatsFilter("custom_month");
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all"
                      >
                        Bulan Ini
                      </button>
                      <button
                        onClick={() => setShowMonthPicker(false)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg transition-all"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Penjualan</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.total)}</p>
                </div>
                <FaMoneyBillWave className="text-blue-200 text-2xl" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Selesai</p>
                  <p className="text-xl font-bold">{stats.completed}</p>
                </div>
                <FaCheckCircle className="text-emerald-200 text-2xl" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Diproses</p>
                  <p className="text-xl font-bold">{stats.processing}</p>
                </div>
                <FaClock className="text-amber-200 text-2xl" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">Total Pesanan</p>
                  <p className="text-xl font-bold">{orders.length}</p>
                </div>
                <FaShoppingCart className="text-violet-200 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Mobile First */}
        <div className="px-4 pb-4">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
            {/* Search Bar */}
            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari order ID, nama, atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white placeholder-gray-400"
              />
            </div>

            {/* Filter Row */}
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-white"
              >
                <option value="all">🔍 Semua Status</option>
                <option value="pending">⏳ Menunggu</option>
                <option value="processing">🔄 Diproses</option>
                <option value="completed">✅ Selesai</option>
                <option value="cancelled">❌ Dibatalkan</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaFilter className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-700 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    📅 Tanggal Spesifik
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setDateRange({ startDate: null, endDate: null });
                    }}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-white"
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Dari Tanggal
                    </label>
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => {
                        setDateRange({ ...dateRange, startDate: date });
                        setSelectedDate(null);
                      }}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-white"
                      placeholderText="Mulai"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Sampai Tanggal
                    </label>
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => {
                        setDateRange({ ...dateRange, endDate: date });
                        setSelectedDate(null);
                      }}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      minDate={dateRange.startDate}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-white"
                      placeholderText="Sampai"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>
                
                <button
                  onClick={clearFilters}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  🗑️ Reset Filter
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-600">
              <span>Menampilkan {orders.length} dari {allOrders.length} pesanan</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Auto-refresh
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-4">
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Orders List - Mobile Optimized */}
        <div className="px-4 pb-6">
          {isLoadingOrders ? (
            <div className="text-center py-12">
              <FaSpinner className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-300 font-medium">Memuat pesanan...</p>
              <p className="text-gray-500 text-sm">Harap tunggu sebentar</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FaBoxOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Tidak ada pesanan</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== 'all' ? 'Tidak ada pesanan yang sesuai filter' : 'Belum ada pesanan masuk hari ini'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden"
                >
                  {/* Order Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer active:bg-gray-700/50"
                    onClick={() => toggleOrderExpansion(order.order_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-mono text-sm font-bold text-white">
                          #{order.order_id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order)}`}>
                            {getStatusText(order)}
                          </span>
                        </div>
                        {expandedOrders.has(order.order_id) ? 
                          <FaChevronUp className="w-4 h-4 text-gray-400" /> : 
                          <FaChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{order.customer?.name}</p>
                        <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-white">{formatCurrency(getOrderAmount(order))}</p>
                        <p className="text-xs text-gray-400">{order.items?.length || 0} item</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrders.has(order.order_id) && (
                    <div className="border-t border-gray-700">
                      {/* Customer Info */}
                      <div className="p-4 bg-gray-700/50">
                        <h4 className="font-semibold text-white mb-2 flex items-center">
                          <FaUser className="w-4 h-4 mr-2 text-blue-400" />
                          Info Pelanggan
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center text-gray-300">
                            <FaPhone className="w-3 h-3 mr-2 text-gray-400" />
                            {order.customer?.phone}
                          </p>
                          <p className="flex items-start text-gray-300">
                            <FaMapMarkerAlt className="w-3 h-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="break-words">{order.customer?.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2 flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-2 text-green-400" />
                          Detail Pesanan
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Tanggal:</span>
                            <p className="font-medium text-gray-300">{order.orderDetails?.date || formatDate(order.created_at) || 'Tidak tersedia'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Pengiriman:</span>
                            <p className="font-medium text-gray-300">{order.orderDetails?.deliveryMethod || 'Tidak tersedia'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Pembayaran:</span>
                            <p className="font-medium text-gray-300">{order.payment?.method || 'Tidak tersedia'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Ongkir:</span>
                            <p className="font-medium text-gray-300">{formatCurrency(order.payment?.deliveryFee || 0)}</p>
                          </div>
                        </div>
                        {order.customer?.note && (
                          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium text-yellow-300">Catatan:</span>
                              <span className="text-yellow-200 ml-1">{order.customer.note}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="p-4 border-t border-gray-700">
                        <h4 className="font-semibold text-white mb-3">🛍️ Items Pesanan</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center bg-gray-700/50 p-3 rounded-lg">
                              <div className="w-10 h-10 bg-gray-600 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-white truncate">{item.name}</h5>
                                <p className="text-sm text-gray-400">
                                  {item.quantity} × {formatCurrency(item.amount)}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-white">
                                  {formatCurrency((item.quantity || 0) * (item.amount || 0))}
                                </p>
                              </div>
                            </div>
                          )) || (
                            <p className="text-gray-400 text-center py-2">Tidak ada item</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 border-t border-gray-700 bg-gray-700/50">
                        {/* Status Selector */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Ubah Status
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-white"
                          >
                            <option value="pending">⏳ Menunggu</option>
                            <option value="processing">🔄 Diproses</option>
                            <option value="completed">✅ Selesai</option>
                            <option value="cancelled">❌ Dibatalkan</option>
                          </select>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => sendWhatsAppMessage(order)}
                            className="flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-1" />
                            WhatsApp
                          </button>
                          
                          <button
                            onClick={() => copyOrderMessage(order)}
                            className="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                          >
                            <FaCopy className="w-4 h-4 mr-1" />
                            Copy
                          </button>
                          
                          {order.payment_url && (
                            <a
                              href={order.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              Payment
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleDeleteOrder(order.order_id)}
                            className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                          >
                            <FaTrash className="w-4 h-4 mr-1" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login", {
        password,
      });

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        setIsAuthenticated(true);
        fetchOrders();
      } else {
        setError(response.data.message || "Password salah");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login gagal");
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <Image 
                src={logo} 
                alt="Logo" 
                width={80} 
                height={80} 
                className="rounded-full shadow-lg" 
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Masuk ke dashboard admin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔐 Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                autoFocus
                placeholder="Masukkan password admin"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>🚀 Masuk Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-500">
            Babi Panggang Apung Admin Panel
          </div>
        </div>
      </div>
    </div>
  );
}
