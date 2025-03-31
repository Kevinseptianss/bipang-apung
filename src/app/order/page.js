"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";

export default function Order() {
  const [menuItems, setMenuItems] = useState([]); // State to store menu items
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors
  const [cart, setCart] = useState([]); // State to store cart items
  const [total, setTotal] = useState(0);

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
    // Redirect to the payment page
    window.location.href = "/details";
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

  return (
    <div className="flex flex-col">
      <div className="absolute">
        <Image src={bg} alt="background" className="w-full h-full" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
      </div>
      <div className="relative flex flex-col items-center justify-center text-3xl pt-10">
        <h1 className="font-bold">Daftar Menu</h1>

        {/* Display loading message */}
        {loading && <p className="text-white">Loading...</p>}

        {/* Display error message */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Display menu items */}
        {!loading && !error && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="text-white mb-4 flex flex-col m-2 border-1 bg-black border-black rounded-2xl"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={500}
                    height={500}
                    className="rounded-tl-2xl w-full h-auto aspect-square rounded-tr-2xl"
                  />
                  <div className="flex flex-col p-2">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-base line-clamp-2">{item.description}</p>
                    <p className="text-base">
                      Rp {item.amount.toLocaleString()} {/* Format amount */}
                    </p>
                  </div>
                  <div className="flex flex-row">
                    {cart.some((cartItem) => cartItem.id === item.id) ? (
                      <>
                        <button
                          onClick={() => handleDecrement(item)}
                          className="mt-2 bg-green-700 text-white px-4 py-2 rounded-tl-lg rounded-bl-lg hover:bg-green-600 transition-colors text-base"
                        >
                          -
                        </button>
                        <button className="flex-1 mt-2 bg-green-700 text-white px-4 py-2 hover:bg-green-600 transition-colors text-base">
                          {cart.find((cartItem) => cartItem.id === item.id)
                            ?.quantity || 0}
                        </button>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="mt-2 bg-green-700 text-white px-4 py-2 rounded-tr-lg rounded-br-lg hover:bg-green-600 transition-colors text-base"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCart(item)}
                        className="flex-1 mt-2 bg-green-700 text-white px-4 py-2 rounded-bl-lg rounded-br-lg hover:bg-green-600 transition-colors text-base"
                      >
                        Tambah Keranjang
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col my-10">
              {/* Display "Lanjutkan" button if cart has items */}
              {cart.length > 0 && (
                <button
                  onClick={() => handleContinue()} // Handle the "Lanjutkan" action
                  className="w-full mt-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-base"
                >
                  Lanjutkan (Rp {total.toLocaleString()})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
