// app/api/createTransaction/route.js
import midtransClient from "midtrans-client";
import { db } from "@/config/firebase-admin";
import sendWhatsApp from "@/config/dripsender";

export async function POST(request) {
  try {
    const {
      user,
      customerInfo,
      orderDetails,
      items,
      totalAmount,
      paymentMethod,
      timestamp
    } = await request.json();

    const order_id = `BA-${Date.now()}`;

    // Calculate total amount from items
    const itemsTotal = items.reduce((sum, item) => {
      return sum + item.amount * item.quantity;
    }, 0);

    // Add delivery fee if applicable (only for delivery orders)
    const deliveryFee = orderDetails.type === "delivery" && orderDetails.deliveryMethod.includes("Rp 12.000") ? 12000 : 0;
    const finalTotal = itemsTotal + deliveryFee;

    let waPhone = customerInfo.phone;
    if (waPhone.startsWith("0")) {
      waPhone = `62${waPhone.substring(1)}`;
    }
    const message = `Terima kasih telah berbelanja di Babi Panggang Apung \nPesanan Anda sedang diproses. Order ID: ${order_id} \nhttps://bipangapung.vercel.app/cekorder/${order_id}`;

    // Store order in Firebase with complete user and order details
    const orderData = {
      order_id,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL
      },
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        note: customerInfo.note
      },
      orderDetails: {
        type: orderDetails.type, // pickup or delivery
        date: orderDetails.date,
        time: orderDetails.time,
        deliveryMethod: orderDetails.deliveryMethod
      },
      payment: {
        method: "Pembayaran Online", // Always online payment
        amount: finalTotal,
        itemsTotal,
        deliveryFee,
        status: "pending"
      },
      items,
      status: "pending",
      created_at: timestamp,
      updated_at: timestamp
    };

    // Always process with Midtrans for online payment
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    
    console.log('Midtrans Environment Variables:');
    console.log('MIDTRANS_IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION);
    console.log('isProduction parsed:', isProduction);
    console.log('Server Key prefix:', serverKey?.substring(0, 10) + '...');
    console.log('Client Key prefix:', clientKey?.substring(0, 10) + '...');
    console.log('Is Sandbox Key (SB- prefix):', serverKey?.startsWith('SB-'));
    
    const snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const transactionDetails = {
      order_id,
      gross_amount: finalTotal,
    };

    const customerDetails = {
      first_name: customerInfo.name,
      email: user.email, // Use real user email
      phone: customerInfo.phone,
      billing_address: {
        first_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
      },
      shipping_address: {
        first_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
      },
    };

    const itemDetails = items.map((item) => ({
      id: item.id,
      price: item.amount,
      quantity: item.quantity,
      name: item.name,
    }));

    // Add delivery fee as separate item if applicable
    if (deliveryFee > 0) {
      itemDetails.push({
        id: "DELIVERY",
        price: deliveryFee,
        quantity: 1,
        name: "Biaya Pengiriman",
      });
    }

    const transaction = await snap.createTransaction({
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/midtrans/finish?order_id=${order_id}`,
        unfinish: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/paymentStatus/${order_id}?status=unfinished`,
        error: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/paymentStatus/${order_id}?status=error`
      }
    });

    console.log('Midtrans transaction response:', JSON.stringify(transaction, null, 2));
    console.log('Payment URL:', transaction.redirect_url);
    console.log('Is Sandbox URL:', transaction.redirect_url?.includes('sandbox'));
    
    // Save complete order data to Firebase
    orderData.payment.payment_url = transaction.redirect_url;
    await db.collection("orders").doc(order_id).set(orderData);

    sendWhatsApp(message, waPhone);

    return Response.json({
      paymentUrl: transaction.redirect_url,
      success: true,
      orderId: order_id
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
