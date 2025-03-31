import { db } from "@/config/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const snapshot = await db.collection("orders")
      .orderBy("created_at", "desc")
      .get();
    const orders = [];
    
    snapshot.forEach((doc) => {
      orders.push({
        order_id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}