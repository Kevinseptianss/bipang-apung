"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";
import ProfileHeader from "@/components/ProfileHeader";
import { FaHome, FaMinus, FaPlus, FaShoppingCart, FaTimes } from "react-icons/fa";

export default function Order() {
  const [menuItems, setMenuItems] = useState([]); // State to store menu items
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors
  const [cart, setCart] = useState([]); // State to store cart items
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false); // State for cart modal

  const handleIncrement = (item) => {
    const updatedCart = cart.map(cartItem =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    setCart(updatedCart);
    // Save the UPDATED cart, not the old one
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
    // Redirect to the order type selection page
    window.location.href = "/ordertype";
  };
  
  const handleCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
  
    if (existingItem) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
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
    // Calculate the total whenever the cart changes
    const newTotal = cart.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [cart]); // Re-run this effect whenever `cart` changes

  // Fetch menu items from the API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("/api/getMenu"); // Fetch data from the API
        setMenuItems(response.data); // Update state with fetched data
        const newCart = localStorage.getItem("cart");
        if (newCart) {
          setCart(JSON.parse(newCart));
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError("Failed to fetch menu items"); // Set error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchMenu();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
      <header className="relative z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
        {/* Top row - Logo and Profile */}
        <div className="flex justify-between items-center p-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold text-white">Menu Kami</h1>
          <ProfileHeader />
        </div>
        
        {/* Bottom row - Navigation and Cart */}
        <div className="flex justify-between items-center px-4 pb-4">
          <a href="/" className="flex items-center text-white hover:text-orange-400 transition-colors text-sm md:text-base">
            <FaHome className="mr-2" size={16} />
            <span className="font-medium">Beranda</span>
          </a>
          
          <button 
            onClick={() => setShowCart(true)}
            className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors relative text-sm md:text-base"
          >
            <FaShoppingCart className="mr-2" size={16} />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="sm:hidden">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4">
        {/* Display loading message */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              Memuat menu...
            </div>
          </div>
        )}

        {/* Display error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Display menu items */}
        {!loading && !error && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
                >
                  <div className="menu-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Rp {item.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      {cart.some((cartItem) => cartItem.id === item.id) ? (
                        <div className="flex items-center bg-orange-600 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="px-4 py-2 hover:bg-orange-700 transition-colors text-white"
                          >
                            <FaMinus />
                          </button>
                          <span className="px-4 py-2 bg-orange-500 text-white font-semibold min-w-[3rem] text-center">
                            {cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="px-4 py-2 hover:bg-orange-700 transition-colors text-white"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCart(item)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-semibold transform hover:scale-105 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" size={14} />
                          Tambah ke Keranjang
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

      {/* Floating Cart Button for Mobile */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <button 
            onClick={() => setShowCart(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-colors relative"
          >
            <FaShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-md max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Keranjang Belanja</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaShoppingCart className="mx-auto mb-4 text-4xl" />
                  <p>Keranjang belanja kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-gray-400 text-sm">Rp {item.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="w-8 h-8 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <FaPlus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-xl font-bold text-orange-400">
                    Rp {total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
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
