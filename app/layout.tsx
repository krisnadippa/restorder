import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import AppShell from "./components/AppShell";

const font = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: 'swap'
});

export const metadata: Metadata = {
  title: "GLORIOUS | Order Food Online",
  description: "Sensasi kuliner premium favoritmu, pesan mudah langsung dari smartphone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={font.className}>
        <CartProvider>
          <AppShell>
            {children}
          </AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
