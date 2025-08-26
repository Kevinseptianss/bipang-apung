import { db } from "@/config/firebase-admin";
import { NextResponse } from "next/server";
import midtransClient from 'midtrans-client';

export async function POST(request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ 
        success: false, 
        message: "Order ID is required" 
      }, { status: 400 });
    }

    // Check transaction status with Midtrans
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const statusResponse = await snap.transaction.status(order_id);
    const { transaction_status, fraud_status } = statusResponse;

    // Determine new status
    let newStatus = 'pending';
    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'success' : 'challenge';
    } else if (transaction_status === 'settlement') {
      newStatus = 'success';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = 'failed';
    }

    // Update order in Firebase
    const orderRef = db.collection('orders').doc(order_id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        message: "Order not found" 
      }, { status: 404 });
    }

    const currentOrder = orderDoc.data();
    const currentStatus = currentOrder.payment?.status || currentOrder.status;

    // Only update if status changed
    if (currentStatus !== newStatus) {
      await orderRef.update({
        'payment.status': newStatus,
        'payment.transaction_status': transaction_status,
        'payment.fraud_status': fraud_status || null,
        'status': newStatus,
        'updated_at': new Date().toISOString()
      });

      console.log(`Order ${order_id} status updated from ${currentStatus} to ${newStatus}`);
      
      return NextResponse.json({
        success: true,
        message: "Order status updated",
        oldStatus: currentStatus,
        newStatus: newStatus,
        midtransResponse: statusResponse
      });
    }

    return NextResponse.json({
      success: true,
      message: "No status change needed",
      currentStatus: currentStatus,
      midtransResponse: statusResponse
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update order status" 
    }, { status: 500 });
  }
}
