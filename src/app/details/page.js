"use client";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import bg from "@/assets/bg.png";

export default function Details() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    note: "",
    date: tomorrowFormatted, // Set default to tomorrow
    deliveryMethod: "Dikirim kurir flat Rp 12.000",
    paymentMethod: "Pembayaran Otomatis",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post("/api/createTransaction", {
        ...formData,
        items: JSON.parse(localStorage.getItem("cart") || []),
      });

      if (response.data.success) {
        setSuccess(true);
        console.log(response.data);
        localStorage.removeItem("cart");

        if(response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
            window.location.href = "/";
        }
      } else {
        setError(response.data.message || "Failed to create transaction");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred" + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="absolute">
        <Image src={bg} alt="background" className="w-full h-full" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
      </div>
      <div className="relative flex flex-col items-center justify-center text-base p-10">
        <h1 className="font-bold text-2xl mb-4">Detail Pengiriman</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && (
          <div className="text-green-500 mb-4">
            Pesanan berhasil dibuat! Terima kasih.
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-4">
            <label className="block text-base mb-2">Nama</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">Alamat</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">No. Telepon</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">Catatan</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">
              Pilih Metode Pengiriman
            </label>
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
            >
              <option value="Gojek, Maxim, Shopee, Bayar di tempat ongkirnya">
                Gojek, Maxim, Shopee, Bayar di tempat ongkirnya
              </option>
              <option value="Di Ambil di Toko">Di Ambil di Toko</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">
              Pilih Tanggal Pengiriman
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={tomorrowFormatted} // Prevent selecting past dates
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-base mb-2">Pilih Pembayaran</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="border-1 border-white rounded-lg p-2 w-full bg-transparent text-white"
            >
              <option value="Pembayaran Otomatis">Pembayaran Otomatis</option>
              <option value="COD (Cash on Destination)">
                COD (Cash on Destination)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-lg mt-4 text-base w-full disabled:bg-gray-500"
          >
            {isSubmitting ? "Memproses..." : "Pesan Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
