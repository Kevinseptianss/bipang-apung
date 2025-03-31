// app/api/createTransaction/route.js
import midtransClient from "midtrans-client";
import { db } from "@/config/firebase-admin";
import sendWhatsApp from "@/config/dripsender";

export async function POST(request) {
  try {
    const {
      name,
      phone,
      address,
      note,
      deliveryMethod,
      paymentMethod,
      items,
      date,
    } = await request.json();

    const order_id = `BA-${Date.now()}`;

    // Calculate total amount from items
    const itemsTotal = items.reduce((sum, item) => {
      return sum + item.amount * item.quantity;
    }, 0);

    // Add delivery fee if applicable
    const deliveryFee = deliveryMethod.includes("Rp 12.000") ? 12000 : 0;
    const totalAmount = itemsTotal + deliveryFee;

    let waPhone = phone;
    if (waPhone.startsWith("0")) {
      waPhone = `62${waPhone.substring(1)}`;
    }
    const message = `Terima kasih telah berbelanja di Babi Panggang Apung \nPesanan Anda sedang diproses. Order ID: ${order_id} \nhttps://bipangapung.vercel.app/cekorder/${order_id}`;

    // For COD orders, just store in Firebase
    if (paymentMethod === "COD (Cash on Destination)") {
      await db.collection("orders").doc(order_id).set({
        order_id,
        amount: totalAmount,
        itemsTotal,
        deliveryFee,
        name,
        phone,
        address,
        note,
        deliveryMethod,
        paymentMethod,
        items,
        date,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      sendWhatsApp(message, waPhone);

      return Response.json({
        success: true,
        message: "COD order created successfully",
      });
    }

    // For automatic payments, process with Midtrans
    const snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const transactionDetails = {
      order_id,
      gross_amount: totalAmount,
    };

    const customerDetails = {
      first_name: name,
      email: `${order_id}@temp.com`,
      phone,
      billing_address: {
        first_name: name,
        phone,
        address,
      },
      shipping_address: {
        first_name: name,
        phone,
        address,
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
    });

    console.log(JSON.stringify(transaction));
    // Save to Firebase including payment URL
    await db.collection("orders").doc(order_id).set({
      order_id,
      amount: totalAmount,
      itemsTotal,
      deliveryFee,
      name,
      phone,
      address,
      note,
      deliveryMethod,
      paymentMethod,
      items,
      date,
      payment_url: transaction.redirect_url,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    sendWhatsApp(message, waPhone);

    return Response.json({
      paymentUrl: transaction.redirect_url,
      success: true,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
