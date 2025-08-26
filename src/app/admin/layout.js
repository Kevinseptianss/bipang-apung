import { Metadata } from 'next';

export const metadata = {
  title: 'Apung Admin',
  description: 'Admin Panel untuk Bipang Apung',
  manifest: '/manifest.json',
  themeColor: '#1F2937',
  appleWebApp: {
    title: 'Apung Admin',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Apung Admin" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#1F2937" />
      <meta name="background-color" content="#111827" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/logo.png" />
      <link rel="icon" href="/logo.png" />
      {children}
    </>
  );
}
