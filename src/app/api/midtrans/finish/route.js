import { NextResponse } from "next/server";
import { db } from "@/config/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');
    const transaction_status = searchParams.get('transaction_status');
    
    if (!order_id) {
      return NextResponse.redirect(new URL('/?error=missing_order_id', request.url));
    }

    // Check order status in database
    let orderStatus = 'pending';
    try {
      const orderRef = db.collection('orders').doc(order_id);
      const orderDoc = await orderRef.get();
      
      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        orderStatus = orderData.payment?.status || orderData.status || 'pending';
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }

    // Redirect to payment status page with order ID
    const redirectUrl = new URL(`/paymentStatus/${order_id}`, request.url);
    redirectUrl.searchParams.set('status', orderStatus);
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Error in finish endpoint:', error);
    return NextResponse.redirect(new URL('/?error=payment_error', request.url));
  }
}
