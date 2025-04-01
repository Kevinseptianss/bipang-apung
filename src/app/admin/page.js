"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import logo from "@/assets/logo.png";
import bg from "@/assets/bg.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data.orders);
      setAllOrders(response.data.orders); // Store all orders
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const filterOrdersByDate = () => {
    if (!dateRange.startDate && !dateRange.endDate && !selectedDate) {
      setOrders(allOrders);
      return;
    }

    let filtered = [...allOrders];

    if (selectedDate) {
      // Filter for single day
      const selectedDay = new Date(selectedDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at).setHours(0, 0, 0, 0);
        return orderDate === selectedDay;
      });
    } else if (dateRange.startDate || dateRange.endDate) {
      // Filter for date range
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const start = dateRange.startDate
          ? new Date(dateRange.startDate)
          : null;
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

    setOrders(filtered);
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setDateRange({ startDate: null, endDate: null });
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
        } catch (err) {
          console.error("Failed to delete order:", err);
          setError("Failed to delete order");
        }
      }
    };

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    };

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

        <div className="relative flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white">
                Orders Management
              </h1>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-white mb-4">
                Filter Orders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Single Day
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setDateRange({ startDate: null, endDate: null });
                    }}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    placeholderText="Select a day"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
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
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    placeholderText="Start date"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
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
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    placeholderText="End date"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={filterOrdersByDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {isLoadingOrders ? (
              <div className="text-white text-center py-8">
                Loading orders...
              </div>
            ) : (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="text-white text-center py-8">
                    No orders found
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.order_id}
                      className="bg-gray-800 rounded-lg p-6 shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2
                            className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const message = `Terima kasih telah berbelanja di Babi Panggang Apung \nPesanan Anda sedang diproses. Order ID: ${order.order_id} \nhttps://bipangapung.vercel.app/cekorder/${order.order_id}`;
                              navigator.clipboard.writeText(message);
                              alert("Message copied to clipboard!");
                            }}
                          >
                            Order #{order.order_id}
                          </h2>
                          <p className="text-gray-300">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "processing"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } text-white`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="font-bold text-white mb-2">
                            Customer Info
                          </h3>
                          <p className="text-gray-300">Name: {order.name}</p>
                          <p className="text-gray-300">Phone: {order.phone}</p>
                          <p className="text-gray-300">
                            Address: {order.address}
                          </p>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="font-bold text-white mb-2">
                            Order Details
                          </h3>
                          <p className="text-gray-300">Date: {order.date}</p>
                          <p className="text-gray-300">
                            Delivery: {order.deliveryMethod}
                          </p>
                          <p className="text-gray-300">
                            Payment: {order.paymentMethod}
                          </p>
                          {order.note && (
                            <p className="text-gray-300">Note: {order.note}</p>
                          )}
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="font-bold text-white mb-2">
                            Payment Summary
                          </h3>
                          <p className="text-gray-300">
                            Subtotal: {formatCurrency(order.itemsTotal)}
                          </p>
                          <p className="text-gray-300">
                            Delivery Fee: {formatCurrency(order.deliveryFee)}
                          </p>
                          <p className="text-gray-300 font-bold">
                            Total: {formatCurrency(order.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-bold text-white mb-2">Items</h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center bg-gray-700 p-3 rounded-lg"
                            >
                              <div className="w-16 h-16 bg-gray-600 rounded-md overflow-hidden mr-4">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white">
                                  {item.name}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="text-white">
                                  {item.quantity} ×{" "}
                                  {formatCurrency(item.amount)}
                                </p>
                                <p className="font-bold text-white">
                                  {formatCurrency(item.quantity * item.amount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.order_id, e.target.value)
                            }
                            className="bg-gray-700 text-white rounded px-3 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          {order.payment_url && (
                            <a
                              href={order.payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View Payment
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.order_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
