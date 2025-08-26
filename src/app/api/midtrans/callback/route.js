import midtransClient from 'midtrans-client';
import { db } from "@/config/firebase-admin";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Midtrans callback received:', body);
    
    const {
      order_id,
      status_code,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
      gross_amount,
      signature_key
    } = body;

    // Verify notification authenticity using signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const input = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const hash = crypto.createHash('sha512').update(input).digest('hex');
    
    if (hash !== signature_key) {
      console.error('Invalid signature from Midtrans');
      return NextResponse.json({ status: 'fail', message: 'Invalid signature' }, { status: 400 });
    }

    // Determine transaction status
    let orderStatus = 'pending';
    
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        orderStatus = 'challenge';
      } else if (fraud_status === 'accept') {
        orderStatus = 'success';
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'success';
    } else if (transaction_status === 'cancel' || 
               transaction_status === 'deny' || 
               transaction_status === 'expire') {
      orderStatus = 'failed';
    } else if (transaction_status === 'pending') {
      orderStatus = 'pending';
    }

    // Update order status in Firebase
    const orderRef = db.collection('orders').doc(order_id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      console.error(`Order ${order_id} not found in database`);
      return NextResponse.json({ status: 'fail', message: 'Order not found' }, { status: 404 });
    }

    // Update the order with payment information
    await orderRef.update({
      'payment.status': orderStatus,
      'payment.transaction_status': transaction_status,
      'payment.payment_type': payment_type,
      'payment.transaction_time': transaction_time,
      'payment.fraud_status': fraud_status || null,
      'status': orderStatus,
      'updated_at': new Date().toISOString()
    });

    console.log(`Order ${order_id} updated with status: ${orderStatus}`);

    // Send additional notifications or trigger other processes based on status
    if (orderStatus === 'success') {
      // You can add logic here to send confirmation WhatsApp message
      console.log(`Payment successful for order ${order_id}`);
    } else if (orderStatus === 'failed') {
      console.log(`Payment failed for order ${order_id}`);
    }

    return NextResponse.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Error processing Midtrans callback:', error);
    return NextResponse.json({ 
      status: 'fail', 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
