import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}