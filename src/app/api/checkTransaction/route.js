import midtransClient from 'midtrans-client';

// Named export for GET method
export async function GET(request) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const order_id = searchParams.get('order_id');

  // Validate order_id
  if (!order_id) {
    return Response.json(
      { message: 'Order ID is required' },
      { status: 400 }
    );
  }

  console.log('Checking payment status for order ID:', order_id);
  try {
    // Inisialisasi Snap API
    const snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Periksa status transaksi
    const statusResponse = await snap.transaction.status(order_id);

    // Kembalikan response
    return Response.json(statusResponse);
  } catch (error) {
    console.error('Error checking payment status:', error);
    return Response.json(
      { message: 'Internal server error' + error },
      { status: 500 }
    );
  }
}