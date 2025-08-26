import { db } from "@/config/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = db.collection("orders");
    
    // If userId is provided, filter by user.uid (nested field)
    if (userId) {
      query = query.where("user.uid", "==", userId);
    }
    
    // Get documents without ordering to avoid index requirement
    const snapshot = await query.get();
      
    const orders = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderId: data.orderId || doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    // Sort by createdAt on the server side
    orders.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // desc order
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}