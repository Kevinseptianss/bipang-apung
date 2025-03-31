'use client';
import { useState } from 'react';

export default function PaymentPage() {
  const [amount, setAmount] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kirim data ke API route untuk membuat transaksi
      const response = await fetch('/api/createTransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, name, email, phone }),
      });

      const data = await response.json();


      if (data.paymentUrl) {
        // Redirect ke halaman pembayaran Midtrans
        window.location.href = data.paymentUrl;
      } else {
        alert('Gagal membuat transaksi' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Pembayaran</h1>
      <form onSubmit={handlePayment}>
        <div>
          <label>Nama:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nomor Telepon:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Jumlah Pembayaran:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Bayar'}
        </button>
      </form>
    </div>
  );
}