import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const roboto = Roboto({
  weight: '400', // You can specify the weight you need
  subsets: ["latin"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  weight: '400', // You can specify the weight you need
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Babi Panggang Apung",
  description: "Babi Panggang Apung adalah hidangan khas Chinese yang gurih dan kaya rempah, menggunakan bumbu Ngohiong. Dipanggang hingga kulitnya crispy kriuk dan bagian dalamnya juicy, hidangan ini cocok disajikan dengan nasi putih atau sayuran tumis. Pilihan sempurna untuk acara keluarga atau perayaan khas Chinese.",
  openGraph: {
    title: "Babi Panggang Apung",
    description: "Babi Panggang Apung adalah hidangan khas Chinese yang gurih dan kaya rempah, menggunakan bumbu Ngohiong. Dipanggang hingga kulitnya crispy kriuk dan bagian dalamnya juicy, hidangan ini cocok disajikan dengan nasi putih atau sayuran tumis. Pilihan sempurna untuk acara keluarga atau perayaan khas Chinese.",
    url: "https://bipangapung.vercel.app", // Replace with your website URL
    type: "website",
    images: [
      {
        url: "/logo.png", // Path to your logo image
        width: 800, // Image width
        height: 600, // Image height
        alt: "Logo Babi Panggang Apung", // Alt text for the image
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Babi Panggang Apung",
    description: "Babi Panggang Apung adalah hidangan khas Chinese yang gurih dan kaya rempah, menggunakan bumbu Ngohiong. Dipanggang hingga kulitnya crispy kriuk dan bagian dalamnya juicy, hidangan ini cocok disajikan dengan nasi putih atau sayuran tumis. Pilihan sempurna untuk acara keluarga atau perayaan khas Chinese.",
    images: ["/logo.png"], // Path to your logo image
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}