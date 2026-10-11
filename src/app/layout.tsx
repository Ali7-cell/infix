import type { Metadata } from 'next';
import './globals.css';
import { POSProvider } from '@/context/POSContext';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Zaad Restaurant & POS Management System',
  description: 'Fast, premium point of sale (POS), table management, KOT printing, and sales analytics with Zaad brand identity.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#FAF5EC] text-[#2B180F] flex overflow-hidden antialiased">
        <POSProvider>
          {/* Global Left Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area with Warm Cream Background */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAF5EC]">
            {children}
          </main>
        </POSProvider>
      </body>
    </html>
  );
}
