import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Marcellus } from "next/font/google";
import { ServiceWorkerRegister } from "./sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sophisnavi Project",
  description: "Sophisnavi Project",
  appleWebApp: { capable: true, title: "Sophisnavi", statusBarStyle: "black-translucent" },
  icons: { apple: "/icon-192x192.png" },
};

export const viewport: Viewport = {
  themeColor: "#02040a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
