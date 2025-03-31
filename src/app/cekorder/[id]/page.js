'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import bg from "@/assets/bg.png";

export default function PaymentStatusPage() {
  const params = useParams();
  const { id } = params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id) {
      const fetchOrderData = async () => {
        try {
          // Fetch order details
          const orderResponse = await axios.get(`/api/getorder`, {
            params: { order_id: id }
          });
          setOrderDetails(orderResponse.data);
          
          // Check payment status
          const statusResponse = await axios.get(`/api/checkTransaction`, {
            params: { order_id: id }
          });
          setStatus(statusResponse.data.transaction_status);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.response?.data?.message || error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrderData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="absolute">
          <Image src={bg} alt="background" className="w-full h-full" />
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
        </div>
        <div className="relative flex flex-col items-center justify-center text-base p-10 text-center">
          <p>Memeriksa status pembayaran...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute w-full h-full">
        <Image src={bg} alt="background" className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
      </div>
      
      <div className="relative flex flex-col items-center p-6 md:p-10 text-white">
        <h1 className="font-bold text-2xl md:text-3xl mb-6 text-center">Detail Pesanan<br />{orderDetails?.order_id}</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 w-full max-w-2xl">
            {error}
          </div>
        )}

        {orderDetails && (
          <div className="bg-black bg-opacity-10 backdrop-blur-sm p-6 rounded-lg w-full max-w-2xl">
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-white border-opacity-30 pb-2">Informasi Pesanan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-white text-opacity-80">Nama</p>
                  <p className="font-medium">{orderDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">No. HP</p>
                  <p className="font-medium">{orderDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">Alamat</p>
                  <p className="font-medium">{orderDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">Tanggal Pesan</p>
                  <p className="font-medium">{formatDate(orderDetails.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">Metode Pengiriman</p>
                  <p className="font-medium">{orderDetails.deliveryMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">Metode Pembayaran</p>
                  <p className="font-medium">{orderDetails.paymentMethod}</p>
                </div>
              </div>
              
              {orderDetails.note && (
                <div className="mt-2">
                  <p className="text-sm text-white text-opacity-80">Catatan</p>
                  <p className="font-medium">{orderDetails.note}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b border-white border-opacity-30 pb-2">Item Pesanan</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-white text-opacity-70 line-clamp-1">{item.description}</p>
                      <p className="text-sm mt-1">
                        {item.quantity} × {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.amount * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-white border-opacity-30 pt-4">
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderDetails.itemsTotal)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Biaya Pengiriman:</span>
                <span>{formatCurrency(orderDetails.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-2 border-t border-white border-opacity-30">
                <span>Total:</span>
                <span>{formatCurrency(orderDetails.amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {status && (
          <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-2">Status Pembayaran</h2>
            <div className={`text-lg font-medium ${
              status === 'settlement' ? 'text-green-400' : 
              status === 'pending' ? 'text-yellow-400' : 
              status === 'expire' || status === 'deny' || status === 'cancel' ? 'text-red-400' : 
              'text-white'
            }`}>
              {status === 'pending' && 'Menunggu Pembayaran'}
              {status === 'settlement' && 'Pembayaran Berhasil'}
              {status === 'expire' && 'Pembayaran Kadaluarsa'}
              {status === 'deny' && 'Pembayaran Ditolak'}
              {status === 'cancel' && 'Pembayaran Dibatalkan'}
              {!['pending', 'settlement', 'expire', 'deny', 'cancel'].includes(status) && status}
            </div>
            
            {status === 'pending' && orderDetails?.payment_url && (
              <a 
                href={orderDetails.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Lanjutkan Pembayaran
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}