import { db } from '@/config/firebase-admin'; // Import Firebase Admin SDK
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Query Firestore for the order
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.where('order_id', '==', order_id).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get the first matching order (order_id should be unique)
    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();

    // Convert Firestore timestamps to strings if needed
    if (orderData.created_at && typeof orderData.created_at.toDate === 'function') {
      orderData.created_at = orderData.created_at.toDate().toISOString();
    }

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}