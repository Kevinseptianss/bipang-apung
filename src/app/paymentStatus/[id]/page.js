'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PaymentStatusPage() {
  const params = useParams(); // Access dynamic route parameters
  const { id } = params; // Extract `id` from the URL
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      // Periksa status pembayaran menggunakan API checkTransaction
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/checkTransaction?order_id=${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch payment status');
          }
          const data = await response.json();
          setStatus(data.transaction_status);
        } catch (error) {
          console.error('Error checking payment status:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      checkPaymentStatus();
    }
  }, [id]);

  if (loading) {
    return <p>Memeriksa status pembayaran...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Status Pembayaran</h1>
      {status ? (
        <p>Status pembayaran untuk order ID {id}: {status}</p>
      ) : (
        <p>Tidak ada data pembayaran untuk order ID {id}.</p>
      )}
    </div>
  );
}