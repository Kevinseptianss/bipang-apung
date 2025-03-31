import { db } from "@/config/firebase-admin";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { orderId } = params;
    const { status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { message: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const orderRef = db.collection("orders").doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await orderRef.update({ status });

    return NextResponse.json(
      { message: "Order status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    const orderRef = db.collection("orders").doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await orderRef.delete();

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
