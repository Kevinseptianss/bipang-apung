"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import logo from "@/assets/logo.png";
import bg from "@/assets/bg.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaWhatsapp, 
  FaCopy, 
  FaRefresh,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTimes,
  FaBars,
  FaChartBar,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave
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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchOrders();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data.orders);
      setAllOrders(response.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  // Enhanced filtering logic
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase()))
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

    return filtered;
  }, [allOrders, searchTerm, statusFilter, selectedDate, dateRange]);

  // Sorting logic
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === 'amount') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredOrders, sortConfig]);

  // Update orders state when filters change
  useEffect(() => {
    setOrders(sortedOrders);
  }, [sortedOrders]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setStatusFilter("all");
    setSortConfig({ key: 'created_at', direction: 'desc' });
    setOrders(allOrders);
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
        setError("Failed to update order status");
      }
    };

    const handleDeleteOrder = async (orderId) => {
      if (confirm("Are you sure you want to delete this order?")) {
        try {
          await axios.delete(`/api/orders/${orderId}`);
          setOrders(orders.filter((order) => order.order_id !== orderId));
          setAllOrders(allOrders.filter((order) => order.order_id !== orderId));
        } catch (err) {
          console.error("Failed to delete order:", err);
          setError("Failed to delete order");
        }
      }
    };

    const sendWhatsAppMessage = (order) => {
      const message = `Halo ${order.name}! 👋\n\nTerima kasih telah berbelanja di Babi Panggang Apung! 🍖\n\nPesanan Anda:\n📋 Order ID: ${order.order_id}\n💰 Total: ${formatCurrency(order.amount)}\n📍 Status: ${getStatusText(order.status)}\n\n🔗 Cek status pesanan: https://bipangapung.vercel.app/cekorder/${order.order_id}\n\nTerima kasih! 🙏`;
      const whatsappUrl = `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };

    const copyOrderMessage = (order) => {
      const message = `Terima kasih telah berbelanja di Babi Panggang Apung!\nOrder ID: ${order.order_id}\nStatus: ${getStatusText(order.status)}\nTotal: ${formatCurrency(order.amount)}\n\nCek pesanan: https://bipangapung.vercel.app/cekorder/${order.order_id}`;
      navigator.clipboard.writeText(message);
      alert("Message copied to clipboard!");
    };

    const formatDate = (dateString) => {
      const options = { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      };
      return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "completed":
          return <FaCheckCircle className="text-green-400" />;
        case "processing":
          return <FaClock className="text-yellow-400" />;
        case "cancelled":
          return <FaTimes className="text-red-400" />;
        default:
          return <FaExclamationCircle className="text-gray-400" />;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "completed":
          return "Selesai";
        case "processing":
          return "Diproses";
        case "pending":
          return "Menunggu";
        case "cancelled":
          return "Dibatalkan";
        default:
          return status;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "completed":
          return "bg-green-500";
        case "processing":
          return "bg-yellow-500";
        case "pending":
          return "bg-blue-500";
        case "cancelled":
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    };

    const calculateStats = () => {
      const total = orders.reduce((sum, order) => sum + order.amount, 0);
      const completed = orders.filter(o => o.status === "completed").length;
      const processing = orders.filter(o => o.status === "processing").length;
      const pending = orders.filter(o => o.status === "pending").length;
      const cancelled = orders.filter(o => o.status === "cancelled").length;
      
      return { total, completed, processing, pending, cancelled };
    };

    const stats = calculateStats();

    const exportToCSV = () => {
      const csvData = orders.map(order => ({
        order_id: order.order_id,
        date: formatDate(order.created_at),
        customer: order.name,
        phone: order.phone,
        address: order.address,
        items: order.items.map(item => `${item.name} (${item.quantity})`).join('; '),
        total: order.amount,
        status: order.status,
        payment_method: order.paymentMethod,
        delivery_method: order.deliveryMethod
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    };

    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <div className="absolute inset-0 -z-10">
          <Image
            src={bg}
            alt="background"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-90" />
        </div>

        {/* Header */}
        <div className="relative bg-gray-800 shadow-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <Image src={logo} alt="Logo" width={40} height={40} className="rounded-full" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-gray-400 text-sm">Kelola pesanan Babi Panggang Apung</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchOrders}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Refresh data"
                >
                  <FaRefresh className="w-4 h-4" />
                </button>
                
                <button
                  onClick={exportToCSV}
                  disabled={orders.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FaDownload className="w-4 h-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
                
                <button
                  onClick={() => {
                    if (refreshInterval) {
                      clearInterval(refreshInterval);
                      setRefreshInterval(null);
                    }
                    localStorage.removeItem("adminToken");
                    setIsAuthenticated(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="relative bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama, atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FaBars className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FaChartBar className="w-4 h-4" />
                </button>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                      Tanggal Spesifik
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setDateRange({ startDate: null, endDate: null });
                      }}
                      className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500"
                      placeholderText="Pilih tanggal"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500"
                      placeholderText="Mulai dari"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500"
                      placeholderText="Sampai"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="relative bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-700 p-4 rounded-lg text-center">
                <FaMoneyBillWave className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                <h3 className="text-sm font-medium text-blue-200">Total Penjualan</h3>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.total)}</p>
              </div>
              <div className="bg-green-700 p-4 rounded-lg text-center">
                <FaCheckCircle className="w-6 h-6 mx-auto mb-2 text-green-200" />
                <h3 className="text-sm font-medium text-green-200">Selesai</h3>
                <p className="text-xl font-bold text-white">{stats.completed}</p>
              </div>
              <div className="bg-yellow-700 p-4 rounded-lg text-center">
                <FaClock className="w-6 h-6 mx-auto mb-2 text-yellow-200" />
                <h3 className="text-sm font-medium text-yellow-200">Diproses</h3>
                <p className="text-xl font-bold text-white">{stats.processing}</p>
              </div>
              <div className="bg-blue-700 p-4 rounded-lg text-center">
                <FaExclamationCircle className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                <h3 className="text-sm font-medium text-blue-200">Menunggu</h3>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
              <div className="bg-red-700 p-4 rounded-lg text-center">
                <FaTimes className="w-6 h-6 mx-auto mb-2 text-red-200" />
                <h3 className="text-sm font-medium text-red-200">Dibatalkan</h3>
                <p className="text-xl font-bold text-white">{stats.cancelled}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-white">
                <span className="text-sm">Menampilkan {orders.length} dari {allOrders.length} pesanan</span>
              </div>
              <div className="text-xs text-gray-400">
                Auto-refresh setiap 30 detik
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {isLoadingOrders ? (
              <div className="text-white text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Memuat pesanan...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FaExclamationCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Tidak ada pesanan</h3>
                <p className="text-gray-400">
                  {searchTerm || statusFilter !== 'all' ? 'Tidak ada pesanan yang sesuai dengan filter' : 'Belum ada pesanan masuk'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Orders Cards */}
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                              <span>#{order.order_id}</span>
                              <button
                                onClick={() => copyOrderMessage(order)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Copy order message"
                              >
                                <FaCopy className="w-4 h-4" />
                              </button>
                            </h2>
                            <p className="text-gray-400 text-sm">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} text-white`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Order Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <h3 className="font-semibold text-white mb-2 flex items-center">
                            <FaUser className="w-4 h-4 mr-2 text-blue-400" />
                            Customer
                          </h3>
                          <p className="text-gray-300 text-sm">{order.name}</p>
                          <p className="text-gray-300 text-sm flex items-center">
                            <FaPhone className="w-3 h-3 mr-1" />
                            {order.phone}
                          </p>
                          <p className="text-gray-300 text-sm flex items-start">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1 mt-0.5" />
                            <span className="break-words">{order.address}</span>
                          </p>
                        </div>

                        <div className="bg-gray-700 p-3 rounded-lg">
                          <h3 className="font-semibold text-white mb-2 flex items-center">
                            <FaCalendarAlt className="w-4 h-4 mr-2 text-green-400" />
                            Detail Pesanan
                          </h3>
                          <p className="text-gray-300 text-sm">Tanggal: {order.date}</p>
                          <p className="text-gray-300 text-sm">Pengiriman: {order.deliveryMethod}</p>
                          <p className="text-gray-300 text-sm">Pembayaran: {order.paymentMethod}</p>
                          {order.note && (
                            <p className="text-gray-300 text-sm mt-1">
                              <span className="font-medium">Catatan:</span> {order.note}
                            </p>
                          )}
                        </div>

                        <div className="bg-gray-700 p-3 rounded-lg">
                          <h3 className="font-semibold text-white mb-2 flex items-center">
                            <FaMoneyBillWave className="w-4 h-4 mr-2 text-yellow-400" />
                            Ringkasan
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Subtotal: {formatCurrency(order.itemsTotal)}
                          </p>
                          <p className="text-gray-300 text-sm">
                            Ongkir: {formatCurrency(order.deliveryFee)}
                          </p>
                          <p className="text-white text-lg font-bold">
                            Total: {formatCurrency(order.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-white mb-3">Items Pesanan</h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center bg-gray-700 p-3 rounded-lg"
                            >
                              <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{item.name}</h4>
                                <p className="text-gray-400 text-sm">
                                  {item.quantity} × {formatCurrency(item.amount)}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-white">
                                  {formatCurrency(item.quantity * item.amount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="processing">Diproses</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => sendWhatsAppMessage(order)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
                            title="Kirim WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                          
                          {order.payment_url && (
                            <a
                              href={order.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                            >
                              <FaEye className="w-4 h-4" />
                              <span className="hidden sm:inline">Payment</span>
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleDeleteOrder(order.order_id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
                            title="Hapus pesanan"
                          >
                            <FaTrash className="w-4 h-4" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
        setError(response.data.message || "Invalid password");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Authentication failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <AdminPanel />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute inset-0 -z-10">
        <Image
          src={bg}
          alt="background"
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
      </div>

      <div className="relative flex items-center justify-center flex-1 px-4">
        <div className="w-full max-w-md p-8 bg-black rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Admin Access
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-white mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
