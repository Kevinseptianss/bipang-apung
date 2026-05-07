import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { origin, destination, items } = await req.json();

    const isProduction = process.env.BITESHIP_IS_PRODUCTION === 'true';
    const apiKey = isProduction 
      ? process.env.BITESHIP_API_KEY 
      : process.env.BITESHIP_TEST_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Biteship API Key not configured" }, { status: 500 });
    }

    const response = await axios.post(
      "https://api.biteship.com/v1/rates/couriers",
      {
        origin_latitude: origin.lat,
        origin_longitude: origin.lng,
        destination_latitude: destination.lat,
        destination_longitude: destination.lng,
        couriers: "grab,gojek,jne,tiki,anteraja,sicepat,jnt",
        items: items.map(item => ({
          name: item.name,
          description: item.description || item.name,
          value: item.amount,
          weight: 0.5, // Biteship expects weight in KG
          length: 10,  // Added default dimensions (cm)
          width: 10,
          height: 10,
          quantity: item.quantity
        }))
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json({ success: true, rates: response.data.pricing });
  } catch (error) {
    console.error("Biteship API Error Detail:", error.response?.data || error.message);
    const errorData = error.response?.data;
    return NextResponse.json({ 
      success: false, 
      message: errorData?.error || errorData?.message || "Gagal mendapatkan tarif pengiriman" 
    }, { status: 500 });
  }
}
